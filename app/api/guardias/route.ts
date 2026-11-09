import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.' },
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
      return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    }

    const { data: authData, error: authError } = await admin.auth.getUser(token);

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    }

    const usuarioAdminId = authData.user.id;

    const body = await request.json();
    const { condominioId, nombre, telefono, email, codigoInterno } = body;

    if (!condominioId || !nombre?.trim() || !email?.trim() || !codigoInterno?.trim()) {
      return NextResponse.json(
        { error: 'Completá nombre, correo y código interno.' },
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
        { error: 'No se encontró el condominio o no tiene empresa asignada.' },
        { status: 404 }
      );
    }

    const { data: membresiaAdmin, error: membresiaError } = await admin
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
        { error: 'No tenés permisos para crear guardias en este condominio.' },
        { status: 403 }
      );
    }

    const { data: nuevoUsuario, error: crearUsuarioError } =
      await admin.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: 'Wendigo123!',
        email_confirm: true,
        user_metadata: { nombre_completo: nombre.trim() },
      });

    if (crearUsuarioError || !nuevoUsuario.user) {
      throw crearUsuarioError || new Error('No se pudo crear la cuenta.');
    }

    usuarioCreadoId = nuevoUsuario.user.id;

    const { error: perfilError } = await admin.from('perfiles').insert({
      id: usuarioCreadoId,
      nombre_completo: nombre.trim(),
      telefono: telefono?.trim() || '',
      estado: 'activo',
    });

    if (perfilError) throw perfilError;

    const { error: membresiaGuardiaError } = await admin
      .from('membresias')
      .insert({
        condominio_id: condominioId,
        usuario_id: usuarioCreadoId,
        rol: 'guardia',
        estado: 'activo',
      });

    if (membresiaGuardiaError) throw membresiaGuardiaError;

    const { error: guardiaError } = await admin.from('guardias').insert({
      condominio_id: condominioId,
      usuario_id: usuarioCreadoId,
      codigo_interno: codigoInterno.trim(),
      cargo: 'Guardia de seguridad',
      estado_laboral: 'activo',
      en_turno: false,
    });

    if (guardiaError) throw guardiaError;

    return NextResponse.json({
      success: true,
      message: 'Guardia creado correctamente.',
    });
  } catch (error: unknown) {
    if (usuarioCreadoId) {
      await admin
        .from('guardias')
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

    console.error('Error creando guardia:', error);

    const mensaje = error instanceof Error
      ? error.message
      : 'No se pudo crear el guardia.';

    return NextResponse.json(
      { error: mensaje },
      { status: 400 }
    );
  }
}