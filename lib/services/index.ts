import { createClient, isBackendConnected } from '../config/supabase';
import type {
  Condominio, Unidad, ResidenteUnidad, Guardia, Puesto, Visita, AutorizacionQR, Movimiento, Vehiculo, Incidencia,
  Evidencia, AlertaPanico, Turno, LugarCondominio, Camara, Conversacion, Mensaje, Notificacion, AuditoriaRegistro,
} from '../types';

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

  async crearCondominio(data: { nombre: string, direccion: string, comuna: string, unidades: number, administrador: string, contratoHasta: string }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('crear_condominio_completo', {
      p_nombre: data.nombre, p_direccion: data.direccion, p_comuna: data.comuna, 
      p_unidades: data.unidades, p_administrador: data.administrador, p_contrato_hasta: data.contratoHasta
    });
    if (error) throw error;
  },

  async actualizarCondominio(id: string, data: { nombre: string, direccion: string, comuna: string, unidades: number, administrador: string, contratoHasta: string }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('condominios').update({
      nombre: data.nombre, direccion: data.direccion, comuna: data.comuna, 
      unidades: data.unidades, administrador: data.administrador, contrato_hasta: data.contratoHasta
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
      id: data.id, nombre: data.nombre, direccion: data.direccion || 'Sin dirección', comuna: data.comuna || '-',
      unidades: data.unidades || 0, guardiasActivos: 0, puestos: 0, estado: data.activo ? 'Activo' : 'Suspendido',
      administrador: data.administrador || 'Sin asignar', contratoHasta: data.contrato_hasta || '-'
    };
  },

  // --- UNIDADES ---
  async unidades(c: string): Promise<Unidad[]> {
    const supabase = createClient();
    const { data } = await supabase.from('unidades').select('*').eq('condominio_id', c);
    return (data || []).map(u => ({
      id: u.id, condominioId: u.condominio_id, codigo: u.identificador || 'N/A', torre: 'A', piso: 1, tipo: u.tipo || 'Departamento', estado: u.estado || 'Desocupada'
    }));
  },

  async crearUnidad(c: string, identificador: string, tipo: string = 'departamento'): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('unidades').insert({
      condominio_id: c, identificador: identificador, tipo: tipo, estado: 'Desocupada'
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

    const userIds = data.map(r => r.usuario_id);
    const { data: perfiles } = await supabase.from('perfiles').select('id, nombre_completo, telefono').in('id', userIds);
    const { data: unidades } = await supabase.from('unidades').select('id, identificador').eq('condominio_id', c);

    return data.map((r: any) => {
      const perfil = perfiles?.find(p => p.id === r.usuario_id);
      const unidad = unidades?.find(u => u.id === r.unidad_id);
      
      return {
        id: r.id, condominioId: r.condominio_id, unidadId: r.unidad_id, unidadCodigo: unidad?.identificador || 'N/A',
        nombre: perfil?.nombre_completo || 'Sin nombre', rut: r.rut || 'N/A', email: '', telefono: perfil?.telefono || '',
        relacion: (r.relacion === 'titular' ? 'Propietario' : r.relacion === 'inquilino' ? 'Arrendatario' : r.relacion === 'familiar' ? 'Familiar' : 'Residente') as any, 
        estado: 'Activo', vehiculos: 0
      };
    });
  },

  async crearResidente(data: { condominioId: string, unidadId: string, nombre: string, email: string, telefono: string, relacion: string, rut: string }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('crear_residente_completo', {
      p_condominio_id: data.condominioId, p_unidad_id: data.unidadId, p_nombre: data.nombre,
      p_email: data.email, p_telefono: data.telefono, p_relacion: data.relacion, p_rut: data.rut
    });
    if (error) throw error;
  },

  async eliminarResidente(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('residentes_unidades').delete().eq('id', id);
    if (error) throw error;
  },

  // --- GUARDIAS ---
  async guardias(c: string): Promise<Guardia[]> {
    const supabase = createClient();
    const { data: guardiasData, error } = await supabase.from('guardias').select('*').eq('condominio_id', c);
    if (error || !guardiasData) return [];

    const usuarioIds = guardiasData.map(g => g.usuario_id);
    const { data: perfilesData } = await supabase.from('perfiles').select('id, nombre_completo, telefono').in('id', usuarioIds);
    const guardiaIds = guardiasData.map(g => g.id);
    const { data: turnosData } = await supabase.from('turnos').select('*').in('guardia_id', guardiaIds);

  return guardiasData.map((g: any) => {
  const perfil = perfilesData?.find(p => p.id === g.usuario_id);
  const turno = turnosData?.find(t => t.guardia_id === g.id);

  let turnoFinal = 'Libre';
  if (turno) turnoFinal = turno.tipo === 'diurno' ? 'Diurno' : 'Nocturno';

  return {
    id: g.id,
    condominioId: g.condominio_id,
    usuarioId: g.usuario_id,
    nombre: perfil?.nombre_completo || 'Guardia sin nombre',
    rut: 'N/A',
    telefono: perfil?.telefono || '',
    puesto: g.cargo || 'Portería',
    puestoId: turno?.puesto_id || '',
    turnoActual: turnoFinal as any,
    estado: g.en_turno ? 'En turno' : 'Fuera de turno',
    ultimaActividad: 'Hace poco',
    credencialVence: '2027'
  };
});
  },

  async crearGuardia(data: { condominioId: string, nombre: string, telefono: string, email: string, codigoInterno: string }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('crear_guardia_completo', {
      p_condominio_id: data.condominioId, p_nombre: data.nombre, p_telefono: data.telefono,
      p_email: data.email, p_codigo_interno: data.codigoInterno
    });
    if (error) throw error;
  },

  async eliminarGuardia(id: string, usuarioId: string, condominioId: string): Promise<void> {
    const supabase = createClient();
    await supabase.from('membresias').delete().eq('usuario_id', usuarioId).eq('condominio_id', condominioId);
    const { error } = await supabase.from('guardias').delete().eq('id', id);
    if (error) throw error;
  },
   
   
   
    // --- PUESTOS ---
  async puestos(c: string): Promise<Puesto[]> {
    const supabase = createClient();
    
    // 1. Traemos todos los puestos del condominio
    const { data } = await supabase.from('puestos').select('*').eq('condominio_id', c);
    
    // 2. Contamos cuántos guardias están realmente EN TURNO ahora mismo
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
      requeridos: 1, // Asumimos que cada puesto necesita 1 guardia
      cubiertos: guardiasEnTurno || 0, // <-- Ahora es dinámico
      foto_guardia_actual: p.foto_guardia_actual || null,
      nombre_guardia_actual: p.nombre_guardia_actual || null,
      hora_relevo: p.hora_relevo || null
    }));
  },

  async crearPuesto(c: string, nombre: string, tipo: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('puestos').insert({ condominio_id: c, nombre: nombre, descripcion: tipo });
    if (error) throw error;
  },

  async actualizarPuesto(id: string, nombre: string, tipo: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('puestos').update({ nombre: nombre, descripcion: tipo }).eq('id', id);
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
    return (data || []).map((l: any) => ({
      id: l.id, condominioId: l.condominio_id, nombre: l.nombre, tipo: l.tipo,
      descripcion: l.descripcion || '', horario: l.horario || '', reglas: l.reglas || '',
      aforo: null, reservable: false, camaras: 0, restringido: false 
    }));
  },

  async crearLugar(c: string, data: { nombre: string, tipo: string, descripcion: string, horario: string, reglas: string }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('lugares_condominio').insert({
      condominio_id: c, nombre: data.nombre, tipo: data.tipo, descripcion: data.descripcion,
      horario: data.horario, reglas: data.reglas, visible_residentes: true, activo: true
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
    return (data || []).map((t: any) => {
      const inicio = new Date(t.inicio);
      const hora = inicio.getHours();
      const tipoCalculado = (hora >= 6 && hora < 18) ? 'Diurno' : 'Nocturno';
      const diaCalculado = inicio.getDay() === 0 ? 6 : inicio.getDay() - 1;

      return {
        id: t.id, condominioId: t.condominio_id, guardia: t.guardia_id, puesto: t.puesto_id, dia: diaCalculado,
        tipo: tipoCalculado as any, horario: `${inicio.toLocaleDateString()} ${inicio.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`, estado: 'Programado'
      };
    });
  },

  async crearTurno(data: { condominioId: string, guardiaId: string, puestoId: string, inicio: string, fin: string, tipo: string }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('crear_turno_completo', {
      p_condominio_id: data.condominioId, p_guardia_id: data.guardiaId, p_puesto_id: data.puestoId,
      p_inicio: new Date(data.inicio).toISOString(), p_fin: new Date(data.fin).toISOString(), p_tipo: data.tipo
    });
    if (error) throw error;
  },

  async actualizarTurno(id: string, data: { guardiaId: string, puestoId: string, inicio: string, fin: string, tipo: string }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('turnos').update({
      guardia_id: data.guardiaId, puesto_id: data.puestoId,
      inicio: new Date(data.inicio).toISOString(), fin: new Date(data.fin).toISOString(), tipo: data.tipo.toLowerCase()
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
    
    return (data || []).map((v: any) => ({
      id: v.id, condominioId: v.condominio_id, visitante: v.titulo || 'Visita', rut: 'N/A', 
      unidadCodigo: 'Unidad 1', residente: 'Residente', motivo: 'Familiar', 
      ventanaDesde: new Date(v.fecha_prevista).toLocaleString(), ventanaHasta: '', 
      estado: (v.estado.charAt(0).toUpperCase() + v.estado.slice(1)) as any, creadaPor: 'Residente',
      qrCodigo: v.qr_codigo || null
    }));
  },
  
  async crearVisita(data: { condominioId: string, titulo: string, fecha: string, qrCodigo: string }): Promise<void> {
    const supabase = createClient();
    const { data: unidades } = await supabase.from('unidades').select('id').eq('condominio_id', data.condominioId).limit(1);
    const unidadId = unidades?.[0]?.id || null;

    if (!unidadId) throw new Error("Este condominio no tiene unidades creadas.");

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('visitas').insert({
      condominio_id: data.condominioId, unidad_id: unidadId, creada_por: user?.id || null,
      titulo: data.titulo, fecha_prevista: new Date(data.fecha).toISOString(), cantidad_visitantes: 1,
      estado: 'autorizada', qr_codigo: data.qrCodigo
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

  async actualizarVisita(id: string, data: { motivo: string, ventanaDesde: string, ventanaHasta: string, vehiculoPatente: string }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('visitas').update({
      motivo: data.motivo, fecha_prevista: data.ventanaDesde, vehiculo_patente: data.vehiculoPatente
    }).eq('id', id);
    if (error) throw error;
  },

  async obtenerCondominioDelUsuario(): Promise<string | null> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: membresia } = await supabase.from('membresias').select('condominio_id').eq('usuario_id', user.id).limit(1).single();
    return membresia?.condominio_id || null;
  },

  // --- AUTORIZACIONES QR ---
    async autorizacionesQR(c: string): Promise<AutorizacionQR[]> {
    const supabase = createClient();
    // Leemos de 'visitas' porque ahí se guardan los QRs reales
    const { data } = await supabase.from('visitas').select('*').eq('condominio_id', c).not('qr_codigo', 'is', null);
    
    return (data || []).map((v: any) => ({
      id: v.id, 
      condominioId: v.condominio_id, 
      codigo: v.qr_codigo, 
      visitante: v.titulo || 'Visita', 
      unidadCodigo: 'Unidad 1',
      emitidoPor: 'Residente', 
      validoDesde: new Date(v.fecha_prevista).toLocaleString(), 
      validoHasta: '', 
      usosMax: 2, 
      usosActuales: v.estado === 'en el condominio' ? 1 : 0, 
      estado: (v.estado === 'autorizada' ? 'Vigente' : v.estado === 'cancelada' ? 'Revocado' : 'Usado') as any
    }));
  },

  // --- MOVIMIENTOS ---
  async movimientos(c: string): Promise<Movimiento[]> {
    const supabase = createClient();
    const { data } = await supabase.from('movimientos').select('*').eq('condominio_id', c).limit(20);
    return (data || []).map((m: any) => ({
      id: m.id, condominioId: m.condominio_id, hora: new Date(m.fecha_hora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      tipo: m.tipo as any, persona: 'Persona', categoria: 'Visita', unidadCodigo: 'N/A', puesto: 'Portería', guardia: 'Guardia',
      metodo: 'Manual', patente: m.matricula_registrada
    }));
  },

  async registrarMovimiento(data: { condominioId: string, visitaId: string, tipo: string, matricula: string }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc('registrar_movimiento', {
      p_condominio_id: data.condominioId, p_visita_id: data.visitaId, p_tipo: data.tipo,
      p_matricula: data.matricula || null, p_metodo: 'Manual'
    });
    if (error) throw error;
  },

  // --- VEHICULOS ---
  async crearVehiculo(c: string, data: { patente: string, marca: string, modelo: string, color: string, propietario: string }): Promise<void> {
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
    
    return (data || []).map((v: any) => ({
      id: v.id,
      condominioId: v.condominio_id,
      patente: v.patente || 'S/N',
      marca: v.marca || 'Desconocida',
      modelo: v.modelo || 'Desconocido',
      color: v.color || 'N/A',
      propietario: v.propietario || 'Sin asignar',
      tipo: v.tipo || 'Residente',
      estado: v.estado || 'Registrado',
      unidadCodigo: v.unidad_codigo || 'N/A',           // <-- ESTAS DOS LÍNEAS FALTABAN
      estacionamiento: v.estacionamiento || 'Sin asignar' // <-- ESTAS DOS LÍNEAS FALTABAN
    }));
  },
  // --- INCIDENCIAS ---
  async incidencias(c: string): Promise<Incidencia[]> {
    const supabase = createClient();
    const { data } = await supabase.from('incidencias').select('*').eq('condominio_id', c);
    return (data || []).map((i: any) => ({
      id: i.id, condominioId: i.condominio_id, titulo: i.titulo, categoria: 'Falla técnica',
      severidad: (i.prioridad === 'alta' ? 'Alta' : i.prioridad === 'baja' ? 'Baja' : 'Media') as any, 
      estado: (i.estado === 'abierta' ? 'Abierta' : 'En revisión') as any, 
      reportadaPor: 'Usuario', fecha: new Date(i.reportada_en).toLocaleDateString(),
      lugar: 'Condominio', descripcion: i.descripcion, evidencias: 0, responsable: 'Admin'
    }));
  },

  async actualizarIncidencia(id: string, data: { estado?: string, responsable?: string }): Promise<void> {
    const supabase = createClient();
    const updates: any = {};
    if (data.estado) updates.estado = data.estado.toLowerCase();
    if (data.responsable) updates.responsable = data.responsable;
    const { error } = await supabase.from('incidencias').update(updates).eq('id', id);
    if (error) throw error;
  },

  async evidencias(incidenciaId: string): Promise<Evidencia[]> { return []; },
  
  // --- ALERTAS PANICO ---
  async alertasPanico(c: string): Promise<AlertaPanico[]> {
    const supabase = createClient();
    const { data } = await supabase.from('alertas_panico').select('*').eq('condominio_id', c);
    return (data || []).map((p: any) => ({
      id: p.id, condominioId: p.condominio_id, origen: 'Residente', ubicacion: 'Torre', fecha: new Date(p.creada_en).toLocaleString(),
      estado: (p.estado === 'activa' ? 'Activa' : 'Cerrada') as any, respondio: '-', tiempoRespuesta: '-', resultado: 'Confirmada'
    }));
  },

  // --- CAMARAS ---
  async camaras(c: string): Promise<Camara[]> {
    const supabase = createClient();
    const { data } = await supabase.from('camaras').select('*').eq('condominio_id', c);
    return (data || []).map((cam: any) => ({
      id: cam.id, condominioId: cam.condominio_id, nombre: cam.nombre, lugar: cam.ubicacion || 'Área común',
      estado: cam.estado === 'activa' ? 'En línea' : 'Sin señal', resolucion: '1080p', grabacion: true, ultimaConexion: 'Ahora'
    }));
  },

  async crearCamara(c: string, data: { nombre: string, ubicacion: string, direccion_host: string, puerto: string, estado: string }): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('camaras').insert({
      condominio_id: c, nombre: data.nombre, ubicacion: data.ubicacion,
      direccion_host: data.direccion_host || null, puerto: data.puerto ? parseInt(data.puerto) : null,
      estado: data.estado.toLowerCase(), habilitada: true
    });
    if (error) throw error;
  },

  async eliminarCamara(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from('camaras').delete().eq('id', id);
    if (error) throw error;
  },

  // --- CONVERSACIONES Y MENSAJES ---
  async conversaciones(c: string): Promise<Conversacion[]> { return []; },
  async mensajes(conversacionId: string): Promise<Mensaje[]> { return []; },
  async notificaciones(c: string): Promise<Notificacion[]> { return []; },
  async auditoria(c: string): Promise<AuditoriaRegistro[]> { return []; },
};

export type { };