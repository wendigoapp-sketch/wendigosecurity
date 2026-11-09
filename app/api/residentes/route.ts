import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Falta configurar la clave secreta de Supabase.' },
      { status: 500 }
    );
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let usuarioCreadoId: string | null = null;

  try {
    const authorization = request.headers.get('Authorization');
    const token = authorization?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Sesión no válida.' },
        { status: 401 }
      );
    }

    const { data: authData, error: authError } =
      await admin.auth.getUser(token);

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Sesión no válida.' },
        { status: 401 }
      );
    }

    const usuarioAdminId = authData.user.id;
    const body = await request.json();

    const {
      condominioId,
      unidadId,
      nombre,
      email,
      telefono,
      relacion,
      rut,
    } = body;

    if (
      !condominioId ||
      !unidadId ||
      !nombre?.trim() ||
      !email?.trim()
    ) {
      return NextResponse.json(
        { error: 'Completá nombre, correo, condominio y unidad.' },
        { status: 400 }
      );
    }

    const { data: condominio, error: condominioError } = await admin
      .from('condominios')
      .select('empresa_id')
      .eq('id', condominioId)
      .single();

    if (condominioError || !condominio?.empresa_id) {
      return NextResponse.json(
        { error: 'No se encontró el condominio.' },
        { status: 404 }
      );
    }

    const { data: membresiaAdmin, error: membresiaError } =
      await admin
        .from('empresa_membresias')
        .select('rol, estado')
        .eq('empresa_id', condominio.empresa_id)
        .eq('usuario_id', usuarioAdminId)
        .eq('estado', 'activo')
        .maybeSingle();

    const rol = String(membresiaAdmin?.rol || '').toLowerCase();

    if (
      membresiaError ||
      !membresiaAdmin ||
      !['admin', 'administrador'].includes(rol)
    ) {
      return NextResponse.json(
        { error: 'No tenés permisos para crear residentes.' },
        { status: 403 }
      );
    }

    const { data: unidad, error: unidadError } = await admin
      .from('unidades')
      .select('id')
      .eq('id', unidadId)
      .eq('condominio_id', condominioId)
      .single();

    if (unidadError || !unidad) {
      return NextResponse.json(
        { error: 'La unidad no pertenece a este condominio.' },
        { status: 404 }
      );
    }

    const { data: nuevoUsuario, error: crearUsuarioError } =
      await admin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: 'Wendigo123!',
        email_confirm: true,
        user_metadata: {
          nombre_completo: nombre.trim(),
        },
      });

    if (crearUsuarioError || !nuevoUsuario.user) {
      throw crearUsuarioError || new Error(
        'No se pudo crear la cuenta.'
      );
    }

    usuarioCreadoId = nuevoUsuario.user.id;

    const { error: perfilError } = await admin
      .from('perfiles')
      .insert({
        id: usuarioCreadoId,
        nombre_completo: nombre.trim(),
        telefono: telefono?.trim() || '',
        estado: 'activo',
      });

    if (perfilError) throw perfilError;

    const { error: membresiaResidenteError } = await admin
      .from('membresias')
      .insert({
        condominio_id: condominioId,
        usuario_id: usuarioCreadoId,
        rol: 'residente',
        estado: 'activo',
      });

    if (membresiaResidenteError) {
      throw membresiaResidenteError;
    }

    const relaciones: Record<string, string> = {
      Propietario: 'titular',
      Arrendatario: 'inquilino',
      Familiar: 'familiar',
    };

    const relacionFinal =
      relaciones[relacion] || 'residente';

    const { error: residenteUnidadError } = await admin
      .from('residentes_unidades')
      .insert({
        condominio_id: condominioId,
        unidad_id: unidadId,
        usuario_id: usuarioCreadoId,
        relacion: relacionFinal,
        rut: rut?.trim() || '',
      });

    if (residenteUnidadError) {
      throw residenteUnidadError;
    }

    const { error: unidadUpdateError } = await admin
      .from('unidades')
      .update({ estado: 'Ocupada' })
      .eq('id', unidadId)
      .eq('condominio_id', condominioId);

    if (unidadUpdateError) throw unidadUpdateError;

    return NextResponse.json({
      success: true,
      message: 'Residente creado correctamente.',
    });

  } catch (error: unknown) {
    if (usuarioCreadoId) {
      await admin
        .from('residentes_unidades')
        .delete()
        .eq('usuario_id', usuarioCreadoId);

      await admin
        .from('membresias')
        .delete()
        .eq('usuario_id', usuarioCreadoId);

      await admin
        .from('perfiles')
        .delete()
        .eq('id', usuarioCreadoId);

      await admin.auth.admin.deleteUser(usuarioCreadoId);
    }

    console.error('Error creando residente:', error);

    const mensaje = error instanceof Error
      ? error.message
      : 'No se pudo crear el residente.';

    return NextResponse.json(
      { error: mensaje },
      { status: 400 }
    );
  }
}