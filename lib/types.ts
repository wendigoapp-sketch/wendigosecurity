/** Tipos que reflejan las tablas existentes del backend (sin modificarlas). */

export type Rol = 'administrador' | 'residente' | 'guardia';

export interface Condominio {
  id: string;
  nombre: string;
  direccion: string;
  comuna: string;
  unidades: number;
  guardiasActivos: number;
  puestos: number;
  estado: 'Activo' | 'Implementacion' | 'Suspendido';
  administrador: string;
  contratoHasta: string;
}

export interface Unidad {
  id: string;
  condominioId: string;
  codigo: string;
  torre: string;
  piso: number;
  tipo: 'Departamento' | 'Casa' | 'Local';
  estado: 'Ocupada' | 'Desocupada' | 'Morosa';
}

export interface ResidenteUnidad {
  id: string;
  condominioId: string;
  unidadId: string;
  unidadCodigo: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  relacion: 'Propietario' | 'Arrendatario' | 'Familiar';
  estado: 'Activo' | 'Pendiente' | 'Inactivo';
  vehiculos: number;
}

export interface Guardia {
  id: string;
  condominioId: string;
  usuarioId: string;
  nombre: string;
  email: string;
  rut: string;
  telefono: string;
  puesto: string;
  puestoId?: string;
  turnoActual: 'Diurno' | 'Nocturno' | 'Libre';
  estado: 'En turno' | 'Fuera de turno' | 'Licencia';
  ultimaActividad: string;
  credencialVence: string;
}
export interface Puesto {
  id: string;
  condominioId: string;
  nombre: string;
  tipo: 'Portería' | 'Ronda' | 'Control central' | 'Estacionamientos';
  requeridos: number;
  cubiertos: number;
  foto_guardia_actual?: string | null;
  nombre_guardia_actual?: string | null;
  hora_relevo?: string | null;
}

export type EstadoVisita =
  | 'Programada'
  | 'Autorizada'
  | 'En el condominio'
  | 'Finalizada'
  | 'Vencida'
  | 'Rechazada'
  | 'Cancelada';

export interface Visita {
  id: string;
  condominioId: string;
  visitante: string;
  rut: string;
  unidadCodigo: string;
  residente: string;
  motivo: 'Familiar' | 'Delivery' | 'Servicio técnico' | 'Mudanza' | 'Profesional' | 'Otro';
  ventanaDesde: string;
  ventanaHasta: string;
  estado: EstadoVisita;
  vehiculoPatente?: string;
  qrCodigo?: string;
  creadaPor: string;
}

export interface AutorizacionQR {
  id: string;
  condominioId: string;
  codigo: string;
  visitante: string;
  unidadCodigo: string;
  emitidoPor: string;
  validoDesde: string;
  validoHasta: string;
  usosMax: number;
  usosActuales: number;
  estado: 'Vigente' | 'Usado' | 'Vencido' | 'Revocado';
}

export interface Movimiento {
  id: string;
  condominioId: string;
  hora: string;
  tipo: 'Entrada' | 'Salida';
  persona: string;
  categoria: 'Visita' | 'Residente' | 'Proveedor' | 'Vehículo';
  unidadCodigo: string;
  puesto: string;
  guardia: string;
  patente?: string;
  metodo: 'QR' | 'Manual' | 'Residente';
}

export interface Vehiculo {
  id: string;
  condominioId: string;
  patente: string;
  marca: string;
  modelo: string;
  color: string;
  unidadCodigo: string;
  propietario: string;
  tipo: 'Residente' | 'Visita';
  estacionamiento: string;
  estado: 'Registrado' | 'En el condominio' | 'Bloqueado';
}

export type Severidad = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export interface Incidencia {
  id: string;
  condominioId: string;
  titulo: string;
  categoria: 'Acceso indebido' | 'Daño a propiedad' | 'Ruidos molestos' | 'Vehículo sospechoso' | 'Falla técnica' | 'Emergencia médica';
  severidad: Severidad;
  estado: 'Abierta' | 'En revisión' | 'Resuelta' | 'Cerrada';
  reportadaPor: string;
  fecha: string;
  lugar: string;
  descripcion: string;
  evidencias: number;
  responsable: string;
}

export interface Evidencia {
  id: string;
  incidenciaId: string;
  nombre: string;
  tipo: 'Foto' | 'Video' | 'Documento';
  tamano: string;
  subidaPor: string;
  fecha: string;
}

export interface AlertaPanico {
  id: string;
  condominioId: string;
  origen: string;
  ubicacion: string;
  fecha: string;
  estado: 'Activa' | 'Atendida' | 'Cerrada';
  respondio?: string;
  tiempoRespuesta?: string;
  resultado?: 'Confirmada' | 'Falsa alarma';
}

export interface Turno {
  id: string;
  condominioId: string;
  guardia: string;
  puesto: string;
  dia: number; // 0=lun .. 6=dom
  tipo: 'Diurno' | 'Nocturno';
  horario: string;
  estado: 'Programado' | 'En curso' | 'Completado' | 'Ausente';
}

export interface LugarCondominio {
  id: string;
  condominioId: string;
  nombre: string;
  tipo: 'Acceso' | 'Área común' | 'Estacionamiento' | 'Perímetro' | 'Sala técnica';
  aforo: number | null;
  reservable: boolean;
  camaras: number;
  restringido: boolean;
}

export interface Camara {
  id: string;
  condominioId: string;
  nombre: string;
  lugar: string;
  estado: 'En línea' | 'Sin señal' | 'Mantención';
  resolucion: string;
  grabacion: boolean;
  ultimaConexion: string;
}

export interface Conversacion {
  id: string;
  condominioId: string;
  asunto: string;
  participantes: string;
  ultimoMensaje: string;
  hora: string;
  noLeidos: number;
  tipo: 'Directa' | 'Grupo' | 'Aviso';
}

export interface Mensaje {
  id: string;
  conversacionId: string;
  autor: string;
  propio: boolean;
  texto: string;
  hora: string;
}

export interface Notificacion {
  id: string;
  condominioId: string;
  titulo: string;
  detalle: string;
  tipo: 'Visita' | 'Seguridad' | 'Aviso' | 'Sistema';
  hora: string;
  leida: boolean;
}

export interface AuditoriaRegistro {
  id: string;
  condominioId: string;
  fecha: string;
  actor: string;
  rol: Rol | 'sistema';
  accion: string;
  entidad: string;
  entidadId: string;
  ip: string;
  resultado: 'Exitoso' | 'Denegado' | 'Error';
}