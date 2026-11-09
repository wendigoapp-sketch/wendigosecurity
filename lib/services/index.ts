
import { createClient, isBackendConnected } from '../config/supabase';
import type {
  Condominio, Unidad, ResidenteUnidad, Guardia, Puesto, Visita, AutorizacionQR, Movimiento, Vehiculo, Incidencia,
  Evidencia, AlertaPanico, Turno, LugarCondominio, Camara, Conversacion, Mensaje, Notificacion, AuditoriaRegistro,
} from '../types';

/**
 * Tipos locales para las respuestas de Supabase.
 * Representan las columnas que este archivo consulta.
 * No modifican las tablas ni el esquema de la base de datos.
 */

interface ResidenteDb {
  id: string;
  condominio_id: string;
  usuario_id: string;
  unidad_id: string;
  rut: string | null;
  relacion: string | null;
}

interface GuardiaDb {
  id: string;
  condominio_id: string;
  usuario_id: string;
  cargo: string | null;
  en_turno: boolean;
}

interface TurnoDb {
  id: string;
  condominio_id: string;
  guardia_id: string;
  puesto_id: string;
  tipo: string;
  inicio: string;
}

interface LugarDb {
  id: string;
  condominio_id: string;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  horario: string | null;
  reglas: string | null;
}

interface VisitaDb {
  id: string;
  condominio_id: string;
  titulo: string | null;
  fecha_prevista: string;
  estado: string;
  qr_codigo: string | null;
}

interface MovimientoDb {
  id: string;
  condominio_id: string;
  fecha_hora: string;
  tipo: string;
  matricula_registrada: string | null;
}

interface VehiculoDb {
  id: string;
  condominio_id: string;
  patente: string | null;
  marca: string | null;
  modelo: string | null;
  color: string | null;
  propietario: string | null;
  tipo: string | null;
  estado: string | null;
  unidad_codigo: string | null;
  estacionamiento: string | null;
}

interface IncidenciaDb {
  id: string;
  condominio_id: string;
  titulo: string;
  prioridad: string;
  estado: string;
  reportada_en: string;
  descripcion: string;
}

interface AlertaPanicoDb {
  id: string;
  condominio_id: string;
  creada_en: string;
  estado: string;
}

interface CamaraDb {
  id: string;
  condominio_id: string;
  nombre: string;
  ubicacion: string | null;
  estado: string;
}

export const servicios = {
  modoDemo: () => !isBackendConnected(),

  // --- CONDOMINIOS ---
  async condominios(): Promise<Condominio[]> {
    const supabase = createClient();
    const { data } = await supabase.from('condominios').select('*');
    if (!data) return [];

    const { data: guardias } = await supabase.from('guardias').select('condominio_id');
    const { data: puestos } = await supabase.from('puestos').select('condominio_id');

    return data.map(c => {
      const cantGuardias = guardias?.filter(g => g.condominio_id === c.id).length || 0;
      const cantPuestos = puestos?.filter(p => p.condominio_id === c.id).length || 0;

      return {
        id: c.id,
        nombre: c.nombre,
        direccion: c.direccion || 'Sin dirección',
        comuna: c.comuna || '-',
        unidades: c.unidades || 0,
        guardiasActivos: cantGuardias,
        puestos: cantPuestos,
        estado: c.activo ? 'Activo' : 'Suspendido',
        administrador: c.administrador || 'Sin asignar',
        contratoHasta: c.contrato_hasta || '-'
      };
    });
  },

  async crearCondominio(data: {
    nombre: string;
    direccion: string;
    comuna: string;
    unidades: number;
    administrador: string;
    contratoHasta: string;
  }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('crear_condominio_completo', {
      p_nombre: data.nombre,
      p_direccion: data.direccion,
      p_comuna: data.comuna,
      p_unidades: data.unidades,
      p_administrador: data.administrador,
      p_contrato_hasta: data.contratoHasta
    });
    if (error) throw error;
  },

  async actualizarCondominio(id: string, data: {
    nombre: string;
    direccion: string;
    comuna: string;
    unidades: number;
    administrador: string;
    contratoHasta: string;
  }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('condominios').update({
      nombre: data.nombre,
      direccion: data.direccion,
      comuna: data.comuna,
      unidades: data.unidades,
      administrador: data.administrador,
      contrato_hasta: data.contratoHasta
    }).eq('id', id);
    if (error) throw error;
  },

  async eliminarCondominio(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('eliminar_condominio_completo', { p_id: id });
    if (error) throw error;
  },

  async obtenerCondominio(id: string): Promise<Condominio | null> {
    const supabase = createClient();
    const { data } = await supabase.from('condominios').select('*').eq('id', id).single();
    if (!data) return null;

    return {
      id: data.id,
      nombre: data.nombre,
      direccion: data.direccion || 'Sin dirección',
      comuna: data.comuna || '-',
      unidades: data.unidades || 0,
      guardiasActivos: 0,
      puestos: 0,
      estado: data.activo ? 'Activo' : 'Suspendido',
      administrador: data.administrador || 'Sin asignar',
      contratoHasta: data.contrato_hasta || '-'
    };
  },

  // --- UNIDADES ---
  async unidades(c: string): Promise<Unidad[]> {
    const supabase = createClient();
    const { data } = await supabase.from('unidades').select('*').eq('condominio_id', c);

    return (data || []).map(u => ({
      id: u.id,
      condominioId: u.condominio_id,
      codigo: u.identificador || 'N/A',
      torre: 'A',
      piso: 1,
      tipo: u.tipo || 'Departamento',
      estado: u.estado || 'Desocupada'
    }));
  },

  async crearUnidad(c: string, identificador: string, tipo: string = 'departamento'): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('unidades').insert({
      condominio_id: c,
      identificador,
      tipo,
      estado: 'Desocupada'
    });
    if (error) throw error;
  },

  async eliminarUnidad(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('unidades').delete().eq('id', id);
    if (error) throw error;
  },

  // --- RESIDENTES ---
  async residentes(c: string): Promise<ResidenteUnidad[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('residentes_unidades').select('*').eq('condominio_id', c);
    if (error || !data) return [];

    const residentesData = data as unknown as ResidenteDb[];
    const userIds = residentesData.map(r => r.usuario_id);

    const { data: perfiles } = await supabase.from('perfiles')
      .select('id, nombre_completo, telefono')
      .in('id', userIds);

    const { data: unidades } = await supabase.from('unidades')
      .select('id, identificador')
      .eq('condominio_id', c);

    return residentesData.map(r => {
      const perfil = perfiles?.find(p => p.id === r.usuario_id);
      const unidad = unidades?.find(u => u.id === r.unidad_id);

      const relacion: ResidenteUnidad['relacion'] =
        r.relacion === 'titular' ? 'Propietario'
          : r.relacion === 'inquilino' ? 'Arrendatario'
            : 'Familiar';

      return {
        id: r.id,
        condominioId: r.condominio_id,
        unidadId: r.unidad_id,
        unidadCodigo: unidad?.identificador || 'N/A',
        nombre: perfil?.nombre_completo || 'Sin nombre',
        rut: r.rut || 'N/A',
        email: '',
        telefono: perfil?.telefono || '',
        relacion,
        estado: 'Activo',
        vehiculos: 0
      };
    });
  },

  async crearResidente(data: {
    condominioId: string;
    unidadId: string;
    nombre: string;
    email: string;
    telefono: string;
    relacion: string;
    rut: string;
  }): Promise<void> {
    const supabase = createClient();

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
    }

    const response = await fetch('/api/residentes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.error || 'No se pudo crear el residente.');
    }
  },

  async eliminarResidente(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('residentes_unidades').delete().eq('id', id);
    if (error) throw error;
  },

 
// --- GUARDIAS ---
async guardias(c: string): Promise<Guardia[]> {
  const supabase = createClient();

  const { data: guardiasData, error } = await supabase
    .from('guardias')
    .select('*')
    .eq('condominio_id', c);

  if (error || !guardiasData) return [];

  const filasGuardias = guardiasData as unknown as GuardiaDb[];
  const usuarioIds = filasGuardias.map(g => g.usuario_id);

  const { data: perfilesData } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, telefono')
    .in('id', usuarioIds);

  const guardiaIds = filasGuardias.map(g => g.id);

  const { data: turnosData } = await supabase
    .from('turnos')
    .select('*')
    .in('guardia_id', guardiaIds);

  const filasTurnos = (turnosData || []) as unknown as TurnoDb[];

  return filasGuardias.map(g => {
    const perfil = perfilesData?.find(p => p.id === g.usuario_id);
    const turno = filasTurnos.find(t => t.guardia_id === g.id);

    let turnoFinal: Guardia['turnoActual'] = 'Libre';

    if (turno) {
      turnoFinal = turno.tipo === 'diurno' ? 'Diurno' : 'Nocturno';
    }

    return {
      id: g.id,
      condominioId: g.condominio_id,
      usuarioId: g.usuario_id,
      nombre: perfil?.nombre_completo || 'Guardia sin nombre',
      email: '',
      rut: 'N/A',
      telefono: perfil?.telefono || '',
      puesto: g.cargo || 'Portería',
      puestoId: turno?.puesto_id || '',
      turnoActual: turnoFinal,
      estado: g.en_turno ? 'En turno' : 'Fuera de turno',
      ultimaActividad: 'Hace poco',
      credencialVence: '2027'
    };
  });
},

async crearGuardia(data: {
  condominioId: string;
  nombre: string;
  telefono: string;
  email: string;
  codigoInterno: string;
}): Promise<void> {
  const supabase = createClient();

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    throw new Error('Tu sesión expiró. Volvé a iniciar sesión.');
  }

  const response = await fetch('/api/guardias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionData.session.access_token}`,
    },
    body: JSON.stringify(data),
  });

  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(resultado.error || 'No se pudo crear el guardia.');
  }
},

async eliminarGuardia(id: string, usuarioId: string, condominioId: string): Promise<void> {
  const supabase = createClient();

  await supabase
    .from('membresias')
    .delete()
    .eq('usuario_id', usuarioId)
    .eq('condominio_id', condominioId);

  const { error } = await supabase
    .from('guardias')
    .delete()
    .eq('id', id);

  if (error) throw error;
},


  // --- PUESTOS ---
  async puestos(c: string): Promise<Puesto[]> {
    const supabase = createClient();

    const { data } = await supabase.from('puestos').select('*').eq('condominio_id', c);

    const { count: guardiasEnTurno } = await supabase
      .from('guardias')
      .select('*', { count: 'exact', head: true })
      .eq('condominio_id', c)
      .eq('en_turno', true);

    return (data || []).map(p => ({
      id: p.id,
      condominioId: p.condominio_id,
      nombre: p.nombre,
      tipo: p.descripcion || 'Portería',
      requeridos: 1,
      cubiertos: guardiasEnTurno || 0,
      foto_guardia_actual: p.foto_guardia_actual || null,
      nombre_guardia_actual: p.nombre_guardia_actual || null,
      hora_relevo: p.hora_relevo || null
    }));
  },

  async crearPuesto(c: string, nombre: string, tipo: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('puestos').insert({
      condominio_id: c,
      nombre,
      descripcion: tipo
    });
    if (error) throw error;
  },

  async actualizarPuesto(id: string, nombre: string, tipo: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('puestos').update({
      nombre,
      descripcion: tipo
    }).eq('id', id);
    if (error) throw error;
  },

  async eliminarPuesto(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('puestos').delete().eq('id', id);
    if (error) throw error;
  },

  async registrarRelevo(
    puestoId: string,
    guardiaLlegandoId: string,
    file: File,
    guardiaSalienteId: string | null
  ): Promise<void> {
    const supabase = createClient();

    // 1. Buscamos al guardia que llega
    const { data: guardia, error: errorGuardia } = await supabase
      .from('guardias')
      .select('usuario_id')
      .eq('id', guardiaLlegandoId)
      .single();

    if (errorGuardia || !guardia) {
      throw errorGuardia || new Error('No se encontró el guardia entrante');
    }

    // 2. Buscamos su nombre en perfiles
    const { data: perfil, error: errorPerfil } = await supabase
      .from('perfiles')
      .select('nombre_completo')
      .eq('id', guardia.usuario_id)
      .single();

    if (errorPerfil || !perfil) {
      throw errorPerfil || new Error('No se encontró el perfil del guardia');
    }

    // 3. Preparamos y subimos la fotografía
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `puesto-${puestoId}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('asistencias')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error de Storage:', uploadError);
      throw uploadError;
    }

    // 4. Obtenemos la URL pública
    const { data: urlData } = supabase.storage
      .from('asistencias')
      .getPublicUrl(fileName);

    // 5. Guardamos foto, nombre y hora en el puesto
    const { error: errorPuesto } = await supabase
      .from('puestos')
      .update({
        foto_guardia_actual: urlData.publicUrl,
        nombre_guardia_actual: perfil.nombre_completo,
        hora_relevo: new Date().toISOString()
      })
      .eq('id', puestoId);

    if (errorPuesto) throw errorPuesto;

    // 6. Ponemos al guardia entrante EN TURNO
    const { error: errorLlegando } = await supabase
      .from('guardias')
      .update({ en_turno: true })
      .eq('id', guardiaLlegandoId);

    if (errorLlegando) throw errorLlegando;

    // 7. Ponemos al guardia saliente FUERA DE TURNO
    if (guardiaSalienteId && guardiaSalienteId !== guardiaLlegandoId) {
      const { error: errorSaliente } = await supabase
        .from('guardias')
        .update({ en_turno: false })
        .eq('id', guardiaSalienteId);

      if (errorSaliente) throw errorSaliente;
    }
  },

  // --- LUGARES ---
  async lugares(c: string): Promise<LugarCondominio[]> {
    const supabase = createClient();
    const { data } = await supabase.from('lugares_condominio').select('*').eq('condominio_id', c);
    const filas = (data || []) as unknown as LugarDb[];

    return filas.map(l => ({
      id: l.id,
      condominioId: l.condominio_id,
      nombre: l.nombre,
      tipo: l.tipo as LugarCondominio['tipo'],
      descripcion: l.descripcion || '',
      horario: l.horario || '',
      reglas: l.reglas || '',
      aforo: null,
      reservable: false,
      camaras: 0,
      restringido: false
    }));
  },

  async crearLugar(c: string, data: {
    nombre: string;
    tipo: string;
    descripcion: string;
    horario: string;
    reglas: string;
  }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('lugares_condominio').insert({
      condominio_id: c,
      nombre: data.nombre,
      tipo: data.tipo,
      descripcion: data.descripcion,
      horario: data.horario,
      reglas: data.reglas,
      visible_residentes: true,
      activo: true
    });
    if (error) throw error;
  },

  async eliminarLugar(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('lugares_condominio').delete().eq('id', id);
    if (error) throw error;
  },

  // --- TURNOS ---
  async turnos(c: string): Promise<Turno[]> {
    const supabase = createClient();
    const { data } = await supabase.from('turnos').select('*').eq('condominio_id', c);
    const filas = (data || []) as unknown as TurnoDb[];

    return filas.map(t => {
      const inicio = new Date(t.inicio);
      const hora = inicio.getHours();
      const tipoCalculado: Turno['tipo'] = (hora >= 6 && hora < 18) ? 'Diurno' : 'Nocturno';
      const diaCalculado = inicio.getDay() === 0 ? 6 : inicio.getDay() - 1;

      return {
        id: t.id,
        condominioId: t.condominio_id,
        guardia: t.guardia_id,
        puesto: t.puesto_id,
        dia: diaCalculado,
        tipo: tipoCalculado,
        horario: `${inicio.toLocaleDateString()} ${inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        estado: 'Programado'
      };
    });
  },

  async crearTurno(data: {
    condominioId: string;
    guardiaId: string;
    puestoId: string;
    inicio: string;
    fin: string;
    tipo: string;
  }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('crear_turno_completo', {
      p_condominio_id: data.condominioId,
      p_guardia_id: data.guardiaId,
      p_puesto_id: data.puestoId,
      p_inicio: new Date(data.inicio).toISOString(),
      p_fin: new Date(data.fin).toISOString(),
      p_tipo: data.tipo
    });
    if (error) throw error;
  },

  async actualizarTurno(id: string, data: {
    guardiaId: string;
    puestoId: string;
    inicio: string;
    fin: string;
    tipo: string;
  }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('turnos').update({
      guardia_id: data.guardiaId,
      puesto_id: data.puestoId,
      inicio: new Date(data.inicio).toISOString(),
      fin: new Date(data.fin).toISOString(),
      tipo: data.tipo.toLowerCase()
    }).eq('id', id);
    if (error) throw error;
  },

  async eliminarTurno(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('turnos').delete().eq('id', id);
    if (error) throw error;
  },

  // --- VISITAS ---
  async visitas(c: string): Promise<Visita[]> {
    const supabase = createClient();
    const { data } = await supabase.from('visitas').select('*').eq('condominio_id', c);
    const filas = (data || []) as unknown as VisitaDb[];

    return filas.map(v => {
      const estados: Record<string, Visita['estado']> = {
        programada: 'Programada',
        autorizada: 'Autorizada',
        'en el condominio': 'En el condominio',
        finalizada: 'Finalizada',
        vencida: 'Vencida',
        rechazada: 'Rechazada'
      };

      return {
        id: v.id,
        condominioId: v.condominio_id,
        visitante: v.titulo || 'Visita',
        rut: 'N/A',
        unidadCodigo: 'Unidad 1',
        residente: 'Residente',
        motivo: 'Familiar',
        ventanaDesde: new Date(v.fecha_prevista).toLocaleString(),
        ventanaHasta: '',
        estado: estados[v.estado.toLowerCase()] || 'Programada',
        creadaPor: 'Residente',
        qrCodigo: v.qr_codigo || undefined
      };
    });
  },

  async crearVisita(data: {
    condominioId: string;
    titulo: string;
    fecha: string;
    qrCodigo: string;
  }): Promise<void> {
    const supabase = createClient();
    const { data: unidades } = await supabase.from('unidades')
      .select('id')
      .eq('condominio_id', data.condominioId)
      .limit(1);

    const unidadId = unidades?.[0]?.id || null;

    if (!unidadId) throw new Error('Este condominio no tiene unidades creadas.');

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('visitas').insert({
      condominio_id: data.condominioId,
      unidad_id: unidadId,
      creada_por: user?.id || null,
      titulo: data.titulo,
      fecha_prevista: new Date(data.fecha).toISOString(),
      cantidad_visitantes: 1,
      estado: 'autorizada',
      qr_codigo: data.qrCodigo
    });

    if (error) throw error;
  },

  async cancelarVisita(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('visitas').update({ estado: 'cancelada' }).eq('id', id);
    if (error) throw error;
  },

  async eliminarVisita(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('visitas').delete().eq('id', id);
    if (error) throw error;
  },

  async actualizarVisita(id: string, data: {
    motivo: string;
    ventanaDesde: string;
    ventanaHasta: string;
    vehiculoPatente: string;
  }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('visitas').update({
      motivo: data.motivo,
      fecha_prevista: data.ventanaDesde,
      vehiculo_patente: data.vehiculoPatente
    }).eq('id', id);
    if (error) throw error;
  },

  async obtenerCondominioDelUsuario(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: membresia } = await supabase.from('membresias')
      .select('condominio_id')
      .eq('usuario_id', user.id)
      .limit(1)
      .single();

    return membresia?.condominio_id || null;
  },

  // --- AUTORIZACIONES QR ---
  async autorizacionesQR(c: string): Promise<AutorizacionQR[]> {
    const supabase = createClient();
    const { data } = await supabase.from('visitas')
      .select('*')
      .eq('condominio_id', c)
      .not('qr_codigo', 'is', null);

    const filas = (data || []) as unknown as VisitaDb[];

    return filas.map(v => ({
      id: v.id,
      condominioId: v.condominio_id,
      codigo: v.qr_codigo || '',
      visitante: v.titulo || 'Visita',
      unidadCodigo: 'Unidad 1',
      emitidoPor: 'Residente',
      validoDesde: new Date(v.fecha_prevista).toLocaleString(),
      validoHasta: '',
      usosMax: 2,
      usosActuales: v.estado === 'en el condominio' ? 1 : 0,
      estado: v.estado === 'autorizada'
        ? 'Vigente'
        : v.estado === 'cancelada'
          ? 'Revocado'
          : 'Usado'
    }));
  },

  // --- MOVIMIENTOS ---
  async movimientos(c: string): Promise<Movimiento[]> {
    const supabase = createClient();
    const { data } = await supabase.from('movimientos')
      .select('*')
      .eq('condominio_id', c)
      .limit(20);

    const filas = (data || []) as unknown as MovimientoDb[];

    return filas.map(m => ({
      id: m.id,
      condominioId: m.condominio_id,
      hora: new Date(m.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tipo: m.tipo === 'Salida' || m.tipo === 'salida' ? 'Salida' : 'Entrada',
      persona: 'Persona',
      categoria: 'Visita',
      unidadCodigo: 'N/A',
      puesto: 'Portería',
      guardia: 'Guardia',
      metodo: 'Manual',
      patente: m.matricula_registrada || undefined
    }));
  },

  async registrarMovimiento(data: {
    condominioId: string;
    visitaId: string;
    tipo: string;
    matricula: string;
  }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('registrar_movimiento', {
      p_condominio_id: data.condominioId,
      p_visita_id: data.visitaId,
      p_tipo: data.tipo,
      p_matricula: data.matricula || null,
      p_metodo: 'Manual'
    });
    if (error) throw error;
  },

  // --- VEHICULOS ---
  async crearVehiculo(c: string, data: {
    patente: string;
    marca: string;
    modelo: string;
    color: string;
    propietario: string;
  }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('vehiculos').insert({
      condominio_id: c,
      patente: data.patente,
      marca: data.marca,
      modelo: data.modelo,
      color: data.color,
      propietario: data.propietario,
      tipo: 'Residente',
      estado: 'Registrado'
    });
    if (error) throw error;
  },

  async eliminarVehiculo(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('vehiculos').delete().eq('id', id);
    if (error) throw error;
  },

  async vehiculos(c: string): Promise<Vehiculo[]> {
    const supabase = createClient();
    const { data } = await supabase.from('vehiculos').select('*').eq('condominio_id', c);
    const filas = (data || []) as unknown as VehiculoDb[];

    return filas.map(v => ({
      id: v.id,
      condominioId: v.condominio_id,
      patente: v.patente || 'S/N',
      marca: v.marca || 'Desconocida',
      modelo: v.modelo || 'Desconocido',
      color: v.color || 'N/A',
      propietario: v.propietario || 'Sin asignar',
      tipo: v.tipo === 'Visita' ? 'Visita' : 'Residente',
      estado: v.estado === 'En el condominio'
        ? 'En el condominio'
        : v.estado === 'Bloqueado'
          ? 'Bloqueado'
          : 'Registrado',
      unidadCodigo: v.unidad_codigo || 'N/A',
      estacionamiento: v.estacionamiento || 'Sin asignar'
    }));
  },

  // --- INCIDENCIAS ---
  async incidencias(c: string): Promise<Incidencia[]> {
    const supabase = createClient();
    const { data } = await supabase.from('incidencias').select('*').eq('condominio_id', c);
    const filas = (data || []) as unknown as IncidenciaDb[];

    return filas.map(i => ({
      id: i.id,
      condominioId: i.condominio_id,
      titulo: i.titulo,
      categoria: 'Falla técnica',
      severidad: i.prioridad === 'alta'
        ? 'Alta'
        : i.prioridad === 'baja'
          ? 'Baja'
          : 'Media',
      estado: i.estado === 'abierta'
        ? 'Abierta'
        : 'En revisión',
      reportadaPor: 'Usuario',
      fecha: new Date(i.reportada_en).toLocaleDateString(),
      lugar: 'Condominio',
      descripcion: i.descripcion,
      evidencias: 0,
      responsable: 'Admin'
    }));
  },

  async actualizarIncidencia(id: string, data: {
    estado?: string;
    responsable?: string;
  }): Promise<void> {
    const supabase = createClient();
    const updates: { estado?: string; responsable?: string } = {};

    if (data.estado) updates.estado = data.estado.toLowerCase();
    if (data.responsable) updates.responsable = data.responsable;

    const { error } = await supabase.from('incidencias').update(updates).eq('id', id);
    if (error) throw error;
  },

   async evidencias(incidenciaId: string): Promise<Evidencia[]> {
    void incidenciaId;
    return [];
  },

  // --- ALERTAS PANICO ---
  async alertasPanico(c: string): Promise<AlertaPanico[]> {
    const supabase = createClient();
    const { data } = await supabase
      .from('alertas_panico')
      .select('*')
      .eq('condominio_id', c);

    return (data || []).map((p) => ({
      id: p.id,
      condominioId: p.condominio_id,
      origen: 'Residente',
      ubicacion: 'Torre',
      fecha: new Date(p.creada_en).toLocaleString(),
      estado: p.estado === 'activa' ? 'Activa' : 'Cerrada',
      respondio: '-',
      tiempoRespuesta: '-',
      resultado: 'Confirmada',
    }));
  },

  // --- CAMARAS ---
  async camaras(c: string): Promise<Camara[]> {
    const supabase = createClient();
    const { data } = await supabase
      .from('camaras')
      .select('*')
      .eq('condominio_id', c);

    return (data || []).map((cam) => ({
      id: cam.id,
      condominioId: cam.condominio_id,
      nombre: cam.nombre,
      lugar: cam.ubicacion || 'Área común',
      estado: cam.estado === 'activa' ? 'En línea' : 'Sin señal',
      resolucion: '1080p',
      grabacion: true,
      ultimaConexion: 'Ahora',
    }));
  },

  async crearCamara(c: string, data: {
    nombre: string;
    ubicacion: string;
    direccion_host: string;
    puerto: string;
    estado: string;
  }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('camaras').insert({
      condominio_id: c,
      nombre: data.nombre,
      ubicacion: data.ubicacion,
      direccion_host: data.direccion_host || null,
      puerto: data.puerto ? parseInt(data.puerto) : null,
      estado: data.estado.toLowerCase(),
      habilitada: true,
    });

    if (error) throw error;
  },

  async eliminarCamara(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('camaras').delete().eq('id', id);
    if (error) throw error;
  },

  // --- CONVERSACIONES Y MENSAJES ---
  async conversaciones(c: string): Promise<Conversacion[]> {
    void c;
    return [];
  },

  async mensajes(conversacionId: string): Promise<Mensaje[]> {
    void conversacionId;
    return [];
  },

  async notificaciones(c: string): Promise<Notificacion[]> {
    void c;
    return [];
  },

  async auditoria(c: string): Promise<AuditoriaRegistro[]> {
    void c;
    return [];
  },
};

export type {};