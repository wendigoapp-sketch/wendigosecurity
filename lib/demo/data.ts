import type {
  Condominio, Unidad, ResidenteUnidad, Guardia, Puesto, Visita, AutorizacionQR, Movimiento, Vehiculo,
  Incidencia, Evidencia, AlertaPanico, Turno, LugarCondominio, Camara, Conversacion, Mensaje,
  Notificacion, AuditoriaRegistro,
} from '../types';

/**
 * DATOS FICTICIOS — Modo demostración.
 * Todos los nombres, RUT, patentes y teléfonos son inventados.
 * Este archivo se reemplaza por consultas reales en src/lib/services/*.
 */

export const CONDOS: Condominio[] = [
  { id: 'condo-001', nombre: 'Parque Los Aromos', direccion: 'Av. Las Industrias 4820', comuna: 'Ñuñoa', unidades: 248, guardiasActivos: 7, puestos: 4, estado: 'Activo', administrador: 'Marcela Opazo', contratoHasta: '31/03/2027' },
  { id: 'condo-002', nombre: 'Altos del Canelo', direccion: 'Camino El Canelo 1290', comuna: 'La Reina', unidades: 112, guardiasActivos: 4, puestos: 3, estado: 'Activo', administrador: 'Rodrigo Valdivia', contratoHasta: '30/11/2026' },
  { id: 'condo-003', nombre: 'Torres del Sur', direccion: 'Gran Avenida 8810', comuna: 'San Miguel', unidades: 320, guardiasActivos: 9, puestos: 5, estado: 'Activo', administrador: 'Camila Retamal', contratoHasta: '15/08/2027' },
  { id: 'condo-004', nombre: 'Villa Las Lilas', direccion: 'Los Almendros 330', comuna: 'Peñalolén', unidades: 64, guardiasActivos: 0, puestos: 2, estado: 'Implementacion', administrador: 'Héctor Salinas', contratoHasta: '20/02/2028' },
];

const U = (id: string, condominioId: string, codigo: string, torre: string, piso: number, tipo: Unidad['tipo'], estado: Unidad['estado']): Unidad => ({ id, condominioId, codigo, torre, piso, tipo, estado });
export const UNIDADES: Unidad[] = [
  U('unidad-001', 'condo-001', 'A-101', 'Torre A', 1, 'Departamento', 'Ocupada'),
  U('unidad-002', 'condo-001', 'A-304', 'Torre A', 3, 'Departamento', 'Ocupada'),
  U('unidad-003', 'condo-001', 'B-502', 'Torre B', 5, 'Departamento', 'Morosa'),
  U('unidad-004', 'condo-001', 'B-808', 'Torre B', 8, 'Departamento', 'Ocupada'),
  U('unidad-005', 'condo-001', 'C-201', 'Torre C', 2, 'Departamento', 'Desocupada'),
  U('unidad-006', 'condo-001', 'C-1205', 'Torre C', 12, 'Departamento', 'Ocupada'),
  U('unidad-007', 'condo-002', 'Casa 14', 'Pasaje 2', 1, 'Casa', 'Ocupada'),
  U('unidad-008', 'condo-002', 'Casa 27', 'Pasaje 4', 1, 'Casa', 'Ocupada'),
  U('unidad-009', 'condo-003', 'T1-902', 'Torre 1', 9, 'Departamento', 'Ocupada'),
  U('unidad-010', 'condo-003', 'T2-415', 'Torre 2', 4, 'Departamento', 'Ocupada'),
];

const R = (id: string, condominioId: string, unidadId: string, unidadCodigo: string, nombre: string, rut: string, email: string, telefono: string, relacion: ResidenteUnidad['relacion'], estado: ResidenteUnidad['estado'], vehiculos: number): ResidenteUnidad => ({ id, condominioId, unidadId, unidadCodigo, nombre, rut, email, telefono, relacion, estado, vehiculos });
export const RESIDENTES: ResidenteUnidad[] = [
  R('res-001', 'condo-001', 'unidad-001', 'A-101', 'Valentina Soto Parra', '16.482.119-3', 'v.soto@correo.demo', '+56 9 5120 4417', 'Propietario', 'Activo', 1),
  R('res-002', 'condo-001', 'unidad-002', 'A-304', 'Andrés Maldonado Ríos', '14.205.883-K', 'a.maldonado@correo.demo', '+56 9 6633 1208', 'Arrendatario', 'Activo', 2),
  R('res-003', 'condo-001', 'unidad-002', 'A-304', 'Paula Maldonado Vega', '19.871.004-6', 'p.maldonado@correo.demo', '+56 9 7745 9021', 'Familiar', 'Activo', 0),
  R('res-004', 'condo-001', 'unidad-003', 'B-502', 'Ignacio Fuentes Lara', '12.940.562-1', 'i.fuentes@correo.demo', '+56 9 8812 3350', 'Propietario', 'Activo', 1),
  R('res-005', 'condo-001', 'unidad-004', 'B-808', 'Francisca Araya Muñoz', '17.336.790-8', 'f.araya@correo.demo', '+56 9 4098 6672', 'Propietario', 'Activo', 1),
  R('res-006', 'condo-001', 'unidad-006', 'C-1205', 'Tomás Guerrero Núñez', '18.552.341-2', 't.guerrero@correo.demo', '+56 9 3321 8845', 'Arrendatario', 'Pendiente', 1),
  R('res-007', 'condo-001', 'unidad-005', 'C-201', 'Beatriz Contreras Ibáñez', '9.761.220-4', 'b.contreras@correo.demo', '+56 9 2276 1093', 'Propietario', 'Inactivo', 0),
  R('res-008', 'condo-002', 'unidad-007', 'Casa 14', 'Matías Orellana Silva', '15.094.377-5', 'm.orellana@correo.demo', '+56 9 5509 7714', 'Propietario', 'Activo', 2),
  R('res-009', 'condo-002', 'unidad-008', 'Casa 27', 'Daniela Pizarro Cea', '16.710.455-9', 'd.pizarro@correo.demo', '+56 9 6104 2289', 'Arrendatario', 'Activo', 1),
  R('res-010', 'condo-003', 'unidad-009', 'T1-902', 'Sergio Bravo Toledo', '13.288.906-7', 's.bravo@correo.demo', '+56 9 7390 5561', 'Propietario', 'Activo', 1),
  R('res-011', 'condo-003', 'unidad-010', 'T2-415', 'Carolina Espinoza Mella', '17.920.113-0', 'c.espinoza@correo.demo', '+56 9 8021 4432', 'Arrendatario', 'Activo', 1),
];

const G = (id: string, condominioId: string, nombre: string, rut: string, telefono: string, puesto: string, turnoActual: Guardia['turnoActual'], estado: Guardia['estado'], ultimaActividad: string, credencialVence: string): Guardia => ({ id, condominioId, nombre, rut, telefono, puesto, turnoActual, estado, ultimaActividad, credencialVence });
export const GUARDIAS: Guardia[] = [
  G('guardia-001', 'condo-001', 'Jorge Ramírez Cáceres', '11.845.230-6', '+56 9 9012 3344', 'Portería principal', 'Diurno', 'En turno', 'Hace 3 min', '12/09/2027'),
  G('guardia-002', 'condo-001', 'Luis Becerra Tapia', '13.102.884-1', '+56 9 8741 2290', 'Portería vehicular', 'Diurno', 'En turno', 'Hace 11 min', '04/05/2027'),
  G('guardia-003', 'condo-001', 'Claudia Navarrete Rojas', '15.667.219-4', '+56 9 7633 0981', 'Ronda perimetral', 'Diurno', 'En turno', 'Hace 18 min', '21/01/2027'),
  G('guardia-004', 'condo-001', 'Ernesto Villalobos Pino', '10.554.031-8', '+56 9 6420 7715', 'Portería principal', 'Nocturno', 'Fuera de turno', 'Ayer 06:02', '30/10/2026'),
  G('guardia-005', 'condo-001', 'Rosa Maturana Leiva', '14.390.677-2', '+56 9 5118 3902', 'Control central', 'Nocturno', 'Fuera de turno', 'Ayer 06:00', '17/03/2027'),
  G('guardia-006', 'condo-001', 'Patricio Zúñiga Olivares', '12.008.455-9', '+56 9 4309 6658', 'Ronda perimetral', 'Libre', 'Licencia', '12/10/2026', '08/12/2026'),
  G('guardia-007', 'condo-002', 'Mauricio Henríquez Soto', '13.776.120-5', '+56 9 3211 9084', 'Portería principal', 'Diurno', 'En turno', 'Hace 6 min', '02/06/2027'),
  G('guardia-008', 'condo-003', 'Gabriela Torres Aedo', '16.240.998-3', '+56 9 2087 4413', 'Control central', 'Diurno', 'En turno', 'Hace 1 min', '19/07/2027'),
];

export const PUESTOS: Puesto[] = [
  { id: 'puesto-001', condominioId: 'condo-001', nombre: 'Portería principal', tipo: 'Portería', requeridos: 2, cubiertos: 1 },
  { id: 'puesto-002', condominioId: 'condo-001', nombre: 'Portería vehicular', tipo: 'Portería', requeridos: 1, cubiertos: 1 },
  { id: 'puesto-003', condominioId: 'condo-001', nombre: 'Ronda perimetral', tipo: 'Ronda', requeridos: 2, cubiertos: 1 },
  { id: 'puesto-004', condominioId: 'condo-001', nombre: 'Control central', tipo: 'Control central', requeridos: 1, cubiertos: 0 },
  { id: 'puesto-005', condominioId: 'condo-002', nombre: 'Portería principal', tipo: 'Portería', requeridos: 1, cubiertos: 1 },
  { id: 'puesto-006', condominioId: 'condo-002', nombre: 'Ronda perimetral', tipo: 'Ronda', requeridos: 1, cubiertos: 0 },
  { id: 'puesto-007', condominioId: 'condo-003', nombre: 'Control central', tipo: 'Control central', requeridos: 1, cubiertos: 1 },
];

const V = (id: string, condominioId: string, visitante: string, rut: string, unidadCodigo: string, residente: string, motivo: Visita['motivo'], ventanaDesde: string, ventanaHasta: string, estado: Visita['estado'], creadaPor: string, vehiculoPatente?: string, qrCodigo?: string): Visita => ({ id, condominioId, visitante, rut, unidadCodigo, residente, motivo, ventanaDesde, ventanaHasta, estado, creadaPor, vehiculoPatente, qrCodigo });
export const VISITAS: Visita[] = [
  V('visita-001', 'condo-001', 'Camilo Henríquez Díaz', '17.440.288-1', 'A-101', 'Valentina Soto Parra', 'Familiar', 'Hoy 18:00', 'Hoy 23:00', 'Autorizada', 'Residente', 'KLRT-42', 'QR-7F3A91'),
  V('visita-002', 'condo-001', 'Repartidor Chilexpress', 'Sin RUT', 'A-304', 'Andrés Maldonado Ríos', 'Delivery', 'Hoy 17:30', 'Hoy 19:30', 'En el condominio', 'Residente', undefined, 'QR-2C84BD'),
  V('visita-003', 'condo-001', 'Marcos Tapia Henríquez', '12.775.309-4', 'B-808', 'Francisca Araya Muñoz', 'Servicio técnico', 'Hoy 15:00', 'Hoy 18:00', 'En el condominio', 'Residente', 'PQSD-19', 'QR-90E1AA'),
  V('visita-004', 'condo-001', 'Elena Cortés Barra', '16.003.552-7', 'C-1205', 'Tomás Guerrero Núñez', 'Profesional', 'Hoy 19:00', 'Hoy 21:00', 'Programada', 'Residente'),
  V('visita-005', 'condo-001', 'Nicolás Figueroa Poblete', '18.220.947-0', 'A-304', 'Paula Maldonado Vega', 'Familiar', 'Ayer 20:00', 'Ayer 23:59', 'Finalizada', 'Residente', 'HGTB-77', 'QR-51D0C2'),
  V('visita-006', 'condo-001', 'Mudanzas Andes Ltda.', '76.455.210-3', 'C-201', 'Beatriz Contreras Ibáñez', 'Mudanza', 'Ayer 09:00', 'Ayer 14:00', 'Vencida', 'Administrador', 'ZXCV-08', 'QR-A0B7E4'),
  V('visita-007', 'condo-001', 'Desconocido (sin identificar)', 'Sin RUT', 'B-502', 'Ignacio Fuentes Lara', 'Otro', 'Hoy 16:40', 'Hoy 16:45', 'Rechazada', 'Guardia'),
  V('visita-008', 'condo-001', 'Sofía Ibarra Quiroz', '19.115.678-5', 'A-101', 'Valentina Soto Parra', 'Familiar', 'Mañana 12:00', 'Mañana 16:00', 'Autorizada', 'Residente', undefined, 'QR-C3E912'),
  V('visita-009', 'condo-002', 'Electricista Pablo Rojas', '14.882.100-6', 'Casa 14', 'Matías Orellana Silva', 'Servicio técnico', 'Hoy 10:00', 'Hoy 13:00', 'Finalizada', 'Residente', 'RTYU-23', 'QR-44F2A0'),
  V('visita-010', 'condo-003', 'Karina Meza Leiva', '15.390.811-2', 'T1-902', 'Sergio Bravo Toledo', 'Familiar', 'Hoy 20:00', 'Hoy 23:30', 'Autorizada', 'Residente', undefined, 'QR-8D17BB'),
];

const Q = (id: string, condominioId: string, codigo: string, visitante: string, unidadCodigo: string, emitidoPor: string, validoDesde: string, validoHasta: string, usosMax: number, usosActuales: number, estado: AutorizacionQR['estado']): AutorizacionQR => ({ id, condominioId, codigo, visitante, unidadCodigo, emitidoPor, validoDesde, validoHasta, usosMax, usosActuales, estado });
export const QRS: AutorizacionQR[] = [
  Q('qr-001', 'condo-001', 'QR-7F3A91', 'Camilo Henríquez Díaz', 'A-101', 'Valentina Soto Parra', 'Hoy 18:00', 'Hoy 23:00', 2, 0, 'Vigente'),
  Q('qr-002', 'condo-001', 'QR-2C84BD', 'Repartidor Chilexpress', 'A-304', 'Andrés Maldonado Ríos', 'Hoy 17:30', 'Hoy 19:30', 1, 1, 'Usado'),
  Q('qr-003', 'condo-001', 'QR-90E1AA', 'Marcos Tapia Henríquez', 'B-808', 'Francisca Araya Muñoz', 'Hoy 15:00', 'Hoy 18:00', 2, 1, 'Vigente'),
  Q('qr-004', 'condo-001', 'QR-51D0C2', 'Nicolás Figueroa Poblete', 'A-304', 'Paula Maldonado Vega', 'Ayer 20:00', 'Ayer 23:59', 2, 2, 'Usado'),
  Q('qr-005', 'condo-001', 'QR-A0B7E4', 'Mudanzas Andes Ltda.', 'C-201', 'Administración', 'Ayer 09:00', 'Ayer 14:00', 4, 0, 'Vencido'),
  Q('qr-006', 'condo-001', 'QR-C3E912', 'Sofía Ibarra Quiroz', 'A-101', 'Valentina Soto Parra', 'Mañana 12:00', 'Mañana 16:00', 2, 0, 'Vigente'),
  Q('qr-007', 'condo-001', 'QR-0E55F1', 'Visita revocada B-502', 'B-502', 'Ignacio Fuentes Lara', 'Hoy 16:00', 'Hoy 20:00', 1, 0, 'Revocado'),
];

const M = (id: string, condominioId: string, hora: string, tipo: Movimiento['tipo'], persona: string, categoria: Movimiento['categoria'], unidadCodigo: string, puesto: string, guardia: string, metodo: Movimiento['metodo'], patente?: string): Movimiento => ({ id, condominioId, hora, tipo, persona, categoria, unidadCodigo, puesto, guardia, metodo, patente });
export const MOVIMIENTOS: Movimiento[] = [
  M('mov-001', 'condo-001', '18:27', 'Entrada', 'Marcos Tapia Henríquez', 'Proveedor', 'B-808', 'Portería vehicular', 'Luis Becerra', 'QR', 'PQSD-19'),
  M('mov-002', 'condo-001', '18:21', 'Salida', 'Francisca Araya Muñoz', 'Residente', 'B-808', 'Portería vehicular', 'Luis Becerra', 'Residente', 'LMNO-55'),
  M('mov-003', 'condo-001', '18:12', 'Entrada', 'Repartidor Chilexpress', 'Visita', 'A-304', 'Portería principal', 'Jorge Ramírez', 'QR'),
  M('mov-004', 'condo-001', '17:58', 'Entrada', 'Valentina Soto Parra', 'Residente', 'A-101', 'Portería principal', 'Jorge Ramírez', 'Residente'),
  M('mov-005', 'condo-001', '17:44', 'Salida', 'Andrés Maldonado Ríos', 'Residente', 'A-304', 'Portería vehicular', 'Luis Becerra', 'Residente', 'BCDF-31'),
  M('mov-006', 'condo-001', '17:30', 'Entrada', 'Técnico Gasfitería Norte', 'Proveedor', 'A-304', 'Portería principal', 'Jorge Ramírez', 'Manual'),
  M('mov-007', 'condo-001', '17:02', 'Salida', 'Nicolás Figueroa Poblete', 'Visita', 'A-304', 'Portería principal', 'Jorge Ramírez', 'QR', 'HGTB-77'),
  M('mov-008', 'condo-001', '16:48', 'Entrada', 'Tomás Guerrero Núñez', 'Residente', 'C-1205', 'Portería vehicular', 'Luis Becerra', 'Residente', 'WERT-62'),
  M('mov-009', 'condo-001', '16:15', 'Entrada', 'Elena Cortés Barra', 'Visita', 'C-1205', 'Portería principal', 'Jorge Ramírez', 'Manual'),
  M('mov-010', 'condo-001', '15:50', 'Salida', 'Ignacio Fuentes Lara', 'Residente', 'B-502', 'Portería vehicular', 'Luis Becerra', 'Residente', 'FDSA-14'),
  M('mov-011', 'condo-001', '15:22', 'Entrada', 'Camión de gas Lipigas', 'Proveedor', 'Bodega', 'Portería vehicular', 'Luis Becerra', 'Manual', 'GAS-901'),
  M('mov-012', 'condo-001', '14:37', 'Entrada', 'Sofía Ibarra Quiroz', 'Visita', 'A-101', 'Portería principal', 'Jorge Ramírez', 'QR'),
];

export const VEHICULOS: Vehiculo[] = [
  { id: 'veh-001', condominioId: 'condo-001', patente: 'KLRT-42', marca: 'Toyota', modelo: 'Yaris', color: 'Gris', unidadCodigo: 'A-101', propietario: 'Valentina Soto Parra', tipo: 'Residente', estacionamiento: 'E-014', estado: 'Registrado' },
  { id: 'veh-002', condominioId: 'condo-001', patente: 'BCDF-31', marca: 'Hyundai', modelo: 'Tucson', color: 'Blanco', unidadCodigo: 'A-304', propietario: 'Andrés Maldonado Ríos', tipo: 'Residente', estacionamiento: 'E-052', estado: 'Registrado' },
  { id: 'veh-003', condominioId: 'condo-001', patente: 'WERT-62', marca: 'Kia', modelo: 'Morning', color: 'Rojo', unidadCodigo: 'C-1205', propietario: 'Tomás Guerrero Núñez', tipo: 'Residente', estacionamiento: 'E-101', estado: 'En el condominio' },
  { id: 'veh-004', condominioId: 'condo-001', patente: 'FDSA-14', marca: 'Chevrolet', modelo: 'Sail', color: 'Negro', unidadCodigo: 'B-502', propietario: 'Ignacio Fuentes Lara', tipo: 'Residente', estacionamiento: 'E-077', estado: 'Registrado' },
  { id: 'veh-005', condominioId: 'condo-001', patente: 'LMNO-55', marca: 'Mazda', modelo: 'CX-5', color: 'Azul', unidadCodigo: 'B-808', propietario: 'Francisca Araya Muñoz', tipo: 'Residente', estacionamiento: 'E-091', estado: 'Registrado' },
  { id: 'veh-006', condominioId: 'condo-001', patente: 'PQSD-19', marca: 'Ford', modelo: 'Transit', color: 'Blanco', unidadCodigo: 'B-808', propietario: 'Marcos Tapia Henríquez', tipo: 'Visita', estacionamiento: 'V-03', estado: 'En el condominio' },
  { id: 'veh-007', condominioId: 'condo-001', patente: 'HGTB-77', marca: 'Suzuki', modelo: 'Swift', color: 'Plomo', unidadCodigo: 'A-304', propietario: 'Nicolás Figueroa Poblete', tipo: 'Visita', estacionamiento: 'V-01', estado: 'Registrado' },
  { id: 'veh-008', condominioId: 'condo-001', patente: 'ZXCV-08', marca: 'Camión', modelo: 'Mudanza 3/4', color: 'Blanco', unidadCodigo: 'C-201', propietario: 'Mudanzas Andes Ltda.', tipo: 'Visita', estacionamiento: 'V-05', estado: 'Bloqueado' },
  { id: 'veh-009', condominioId: 'condo-002', patente: 'RTYU-23', marca: 'Nissan', modelo: 'Versa', color: 'Gris', unidadCodigo: 'Casa 14', propietario: 'Matías Orellana Silva', tipo: 'Residente', estacionamiento: 'Casa 14', estado: 'Registrado' },
  { id: 'veh-010', condominioId: 'condo-003', patente: 'JKLM-90', marca: 'Peugeot', modelo: '208', color: 'Blanco', unidadCodigo: 'T1-902', propietario: 'Sergio Bravo Toledo', tipo: 'Residente', estacionamiento: 'S-221', estado: 'Registrado' },
];

const I = (id: string, condominioId: string, titulo: string, categoria: Incidencia['categoria'], severidad: Incidencia['severidad'], estado: Incidencia['estado'], reportadaPor: string, fecha: string, lugar: string, descripcion: string, evidencias: number, responsable: string): Incidencia => ({ id, condominioId, titulo, categoria, severidad, estado, reportadaPor, fecha, lugar, descripcion, evidencias, responsable });
export const INCIDENCIAS: Incidencia[] = [
  I('inc-001', 'condo-001', 'Portón vehicular no cierra completamente', 'Falla técnica', 'Alta', 'Abierta', 'Luis Becerra', 'Hoy 17:48', 'Acceso vehicular norte', 'El portón queda abierto unos 30 cm tras el ciclo de cierre. Se mantiene vigilancia manual hasta que llegue el técnico.', 3, 'Marcela Opazo'),
  I('inc-002', 'condo-001', 'Persona intentó ingresar siguiendo a un residente', 'Acceso indebido', 'Crítica', 'En revisión', 'Jorge Ramírez', 'Hoy 16:40', 'Portería principal', 'Una persona sin autorización intentó entrar detrás de un residente. Fue detenida en el control; se revisan cámaras para identificarla.', 4, 'Marcela Opazo'),
  I('inc-003', 'condo-001', 'Ruidos molestos pasado el horario permitido', 'Ruidos molestos', 'Baja', 'Resuelta', 'Claudia Navarrete', 'Ayer 23:50', 'Torre B, piso 5', 'Música alta tras las 23:00. Se solicitó bajar el volumen y la unidad acató.', 0, 'Claudia Navarrete'),
  I('inc-004', 'condo-001', 'Vehículo desconocido estacionado en zona de visitas', 'Vehículo sospechoso', 'Media', 'En revisión', 'Claudia Navarrete', 'Hoy 14:05', 'Estacionamiento visitas', 'Vehículo sin patente registrada permanece más de 3 horas. Se consulta con unidades vecinas.', 2, 'Jorge Ramírez'),
  I('inc-005', 'condo-001', 'Daño en espejo de vehículo residente', 'Daño a propiedad', 'Media', 'Abierta', 'Rosa Maturana', 'Ayer 03:20', 'Estacionamiento subterráneo', 'Residente reporta espejo roto por la mañana. Se solicita revisión de cámaras del subterráneo.', 2, 'Sin asignar'),
  I('inc-006', 'condo-001', 'Residente con malestar en gimnasio', 'Emergencia médica', 'Alta', 'Cerrada', 'Ernesto Villalobos', 'Hace 3 días', 'Gimnasio', 'Se coordinó ambulancia y se acompañó al residente hasta la salida.', 1, 'Marcela Opazo'),
  I('inc-007', 'condo-002', 'Cerco perimetral con tramo caído', 'Daño a propiedad', 'Alta', 'Abierta', 'Mauricio Henríquez', 'Hoy 09:15', 'Perímetro oriente', 'Un tramo de cerco quedó caído tras el viento. Se cinta la zona y se refuerzan las rondas.', 2, 'Rodrigo Valdivia'),
];

export const EVIDENCIAS: Evidencia[] = [
  { id: 'evi-001', incidenciaId: 'inc-001', nombre: 'porton_norte_1748.jpg', tipo: 'Foto', tamano: '2,4 MB', subidaPor: 'Luis Becerra', fecha: 'Hoy 17:50' },
  { id: 'evi-002', incidenciaId: 'inc-001', nombre: 'porton_ciclo_cierre.mp4', tipo: 'Video', tamano: '18,1 MB', subidaPor: 'Luis Becerra', fecha: 'Hoy 17:53' },
  { id: 'evi-003', incidenciaId: 'inc-001', nombre: 'orden_servicio_porton.pdf', tipo: 'Documento', tamano: '310 KB', subidaPor: 'Marcela Opazo', fecha: 'Hoy 18:10' },
  { id: 'evi-004', incidenciaId: 'inc-002', nombre: 'camara_porteria_1640.mp4', tipo: 'Video', tamano: '42,7 MB', subidaPor: 'Jorge Ramírez', fecha: 'Hoy 16:52' },
  { id: 'evi-005', incidenciaId: 'inc-002', nombre: 'captura_rostro.jpg', tipo: 'Foto', tamano: '1,1 MB', subidaPor: 'Jorge Ramírez', fecha: 'Hoy 16:55' },
  { id: 'evi-006', incidenciaId: 'inc-004', nombre: 'vehiculo_sin_patente.jpg', tipo: 'Foto', tamano: '3,0 MB', subidaPor: 'Claudia Navarrete', fecha: 'Hoy 14:10' },
  { id: 'evi-007', incidenciaId: 'inc-005', nombre: 'espejo_dañado.jpg', tipo: 'Foto', tamano: '2,2 MB', subidaPor: 'Rosa Maturana', fecha: 'Ayer 03:30' },
];

export const PANICOS: AlertaPanico[] = [
  { id: 'pan-001', condominioId: 'condo-001', origen: 'Residente B-502 · Ignacio Fuentes', ubicacion: 'Torre B, piso 5', fecha: 'Hoy 18:31', estado: 'Activa' },
  { id: 'pan-002', condominioId: 'condo-001', origen: 'Guardia Claudia Navarrete', ubicacion: 'Ronda perimetral, sector poniente', fecha: 'Ayer 21:14', estado: 'Cerrada', respondio: 'Jorge Ramírez', tiempoRespuesta: '1 min 48 s', resultado: 'Confirmada' },
  { id: 'pan-003', condominioId: 'condo-001', origen: 'Residente A-304 · Paula Maldonado', ubicacion: 'Estacionamiento subterráneo', fecha: 'Hace 2 días', estado: 'Cerrada', respondio: 'Luis Becerra', tiempoRespuesta: '2 min 30 s', resultado: 'Falsa alarma' },
  { id: 'pan-004', condominioId: 'condo-001', origen: 'Residente C-1205 · Tomás Guerrero', ubicacion: 'Hall Torre C', fecha: 'Hace 5 días', estado: 'Atendida', respondio: 'Rosa Maturana', tiempoRespuesta: '3 min 05 s' },
  { id: 'pan-005', condominioId: 'condo-002', origen: 'Guardia Mauricio Henríquez', ubicacion: 'Portería principal', fecha: 'Hace 9 días', estado: 'Cerrada', respondio: 'Rodrigo Valdivia', tiempoRespuesta: '2 min 12 s', resultado: 'Falsa alarma' },
];

const T = (id: string, guardia: string, puesto: string, dia: number, tipo: Turno['tipo'], estado: Turno['estado']): Turno => ({ id, condominioId: 'condo-001', guardia, puesto, dia, tipo, horario: tipo === 'Diurno' ? '07:00 – 19:00' : '19:00 – 07:00', estado });
export const TURNOS: Turno[] = [
  T('turno-001', 'Jorge Ramírez', 'Portería principal', 0, 'Diurno', 'Completado'),
  T('turno-002', 'Jorge Ramírez', 'Portería principal', 1, 'Diurno', 'Completado'),
  T('turno-003', 'Jorge Ramírez', 'Portería principal', 2, 'Diurno', 'En curso'),
  T('turno-004', 'Jorge Ramírez', 'Portería principal', 3, 'Diurno', 'Programado'),
  T('turno-005', 'Luis Becerra', 'Portería vehicular', 0, 'Diurno', 'Completado'),
  T('turno-006', 'Luis Becerra', 'Portería vehicular', 1, 'Diurno', 'Completado'),
  T('turno-007', 'Luis Becerra', 'Portería vehicular', 2, 'Diurno', 'En curso'),
  T('turno-008', 'Luis Becerra', 'Portería vehicular', 3, 'Diurno', 'Programado'),
  T('turno-009', 'Claudia Navarrete', 'Ronda perimetral', 1, 'Diurno', 'Completado'),
  T('turno-010', 'Claudia Navarrete', 'Ronda perimetral', 2, 'Diurno', 'En curso'),
  T('turno-011', 'Claudia Navarrete', 'Ronda perimetral', 4, 'Diurno', 'Programado'),
  T('turno-012', 'Ernesto Villalobos', 'Portería principal', 0, 'Nocturno', 'Completado'),
  T('turno-013', 'Ernesto Villalobos', 'Portería principal', 1, 'Nocturno', 'Completado'),
  T('turno-014', 'Ernesto Villalobos', 'Portería principal', 2, 'Nocturno', 'Programado'),
  T('turno-015', 'Rosa Maturana', 'Control central', 0, 'Nocturno', 'Completado'),
  T('turno-016', 'Rosa Maturana', 'Control central', 1, 'Nocturno', 'Ausente'),
  T('turno-017', 'Rosa Maturana', 'Control central', 3, 'Nocturno', 'Programado'),
];

export const LUGARES: LugarCondominio[] = [
  { id: 'lugar-001', condominioId: 'condo-001', nombre: 'Acceso peatonal principal', tipo: 'Acceso', aforo: null, reservable: false, camaras: 2, restringido: true },
  { id: 'lugar-002', condominioId: 'condo-001', nombre: 'Acceso vehicular norte', tipo: 'Acceso', aforo: null, reservable: false, camaras: 3, restringido: true },
  { id: 'lugar-003', condominioId: 'condo-001', nombre: 'Estacionamiento subterráneo', tipo: 'Estacionamiento', aforo: 160, reservable: false, camaras: 4, restringido: true },
  { id: 'lugar-004', condominioId: 'condo-001', nombre: 'Estacionamiento de visitas', tipo: 'Estacionamiento', aforo: 24, reservable: false, camaras: 1, restringido: false },
  { id: 'lugar-005', condominioId: 'condo-001', nombre: 'Quincho y terraza', tipo: 'Área común', aforo: 40, reservable: true, camaras: 1, restringido: false },
  { id: 'lugar-006', condominioId: 'condo-001', nombre: 'Gimnasio', tipo: 'Área común', aforo: 18, reservable: false, camaras: 1, restringido: false },
  { id: 'lugar-007', condominioId: 'condo-001', nombre: 'Piscina', tipo: 'Área común', aforo: 35, reservable: true, camaras: 2, restringido: false },
  { id: 'lugar-008', condominioId: 'condo-001', nombre: 'Perímetro poniente', tipo: 'Perímetro', aforo: null, reservable: false, camaras: 3, restringido: true },
  { id: 'lugar-009', condominioId: 'condo-001', nombre: 'Sala de bombas y CCTV', tipo: 'Sala técnica', aforo: 4, reservable: false, camaras: 1, restringido: true },
];

const C = (id: string, condominioId: string, nombre: string, lugar: string, estado: Camara['estado'], resolucion: string, grabacion: boolean, ultimaConexion: string): Camara => ({ id, condominioId, nombre, lugar, estado, resolucion, grabacion, ultimaConexion });
export const CAMARAS: Camara[] = [
  C('cam-001', 'condo-001', 'CAM-01 Acceso peatonal', 'Acceso peatonal principal', 'En línea', '2560×1440', true, 'Ahora'),
  C('cam-002', 'condo-001', 'CAM-02 Acceso peatonal', 'Acceso peatonal principal', 'En línea', '1920×1080', true, 'Ahora'),
  C('cam-003', 'condo-001', 'CAM-03 Portón norte', 'Acceso vehicular norte', 'En línea', '2560×1440', true, 'Ahora'),
  C('cam-004', 'condo-001', 'CAM-04 Portón norte lateral', 'Acceso vehicular norte', 'Sin señal', '1920×1080', false, 'Hace 42 min'),
  C('cam-005', 'condo-001', 'CAM-05 Subterráneo A', 'Estacionamiento subterráneo', 'En línea', '1920×1080', true, 'Ahora'),
  C('cam-006', 'condo-001', 'CAM-06 Subterráneo B', 'Estacionamiento subterráneo', 'En línea', '1920×1080', true, 'Ahora'),
  C('cam-007', 'condo-001', 'CAM-07 Quincho', 'Quincho y terraza', 'Mantención', '1280×720', false, 'Hace 2 días'),
  C('cam-008', 'condo-001', 'CAM-08 Perímetro poniente', 'Perímetro poniente', 'En línea', '1920×1080', true, 'Ahora'),
];

export const CONVERSACIONES: Conversacion[] = [
  { id: 'conv-001', condominioId: 'condo-001', asunto: 'Conserjería · Portería principal', participantes: 'Portería principal', ultimoMensaje: 'Su visita Camilo Henríquez ya ingresó.', hora: '18:27', noLeidos: 1, tipo: 'Directa' },
  { id: 'conv-002', condominioId: 'condo-001', asunto: 'Administración', participantes: 'Marcela Opazo', ultimoMensaje: 'El corte de agua será mañana de 10:00 a 12:00.', hora: '16:02', noLeidos: 0, tipo: 'Directa' },
  { id: 'conv-003', condominioId: 'condo-001', asunto: 'Comunidad Torre A', participantes: '48 participantes', ultimoMensaje: 'Recordatorio: no dejar bolsas en el pasillo.', hora: 'Ayer', noLeidos: 3, tipo: 'Grupo' },
  { id: 'conv-004', condominioId: 'condo-001', asunto: 'Avisos de seguridad', participantes: 'Central de seguridad', ultimoMensaje: 'Se refuerzan las rondas nocturnas esta semana.', hora: 'Ayer', noLeidos: 0, tipo: 'Aviso' },
  { id: 'conv-005', condominioId: 'condo-001', asunto: 'Control central', participantes: 'Rosa Maturana', ultimoMensaje: 'Recibido, queda registrado.', hora: 'Lun', noLeidos: 0, tipo: 'Directa' },
];

export const MENSAJES: Mensaje[] = [
  { id: 'msg-001', conversacionId: 'conv-001', autor: 'Portería principal', propio: false, texto: 'Buenas tardes, llegó un repartidor para el A-304. ¿Lo autoriza?', hora: '17:55' },
  { id: 'msg-002', conversacionId: 'conv-001', autor: 'Yo', propio: true, texto: 'Sí, lo autorizo. Que suba directo.', hora: '17:56' },
  { id: 'msg-003', conversacionId: 'conv-001', autor: 'Portería principal', propio: false, texto: 'Registrado. Gracias.', hora: '17:57' },
  { id: 'msg-004', conversacionId: 'conv-001', autor: 'Portería principal', propio: false, texto: 'Su visita Camilo Henríquez ya ingresó.', hora: '18:27' },
  { id: 'msg-005', conversacionId: 'conv-002', autor: 'Marcela Opazo', propio: false, texto: 'Se informa corte de agua programado para mañana.', hora: '15:58' },
  { id: 'msg-006', conversacionId: 'conv-002', autor: 'Marcela Opazo', propio: false, texto: 'El corte de agua será mañana de 10:00 a 12:00.', hora: '16:02' },
  { id: 'msg-007', conversacionId: 'conv-003', autor: 'Vecina A-401', propio: false, texto: 'Recordatorio: no dejar bolsas en el pasillo.', hora: 'Ayer' },
  { id: 'msg-008', conversacionId: 'conv-004', autor: 'Central de seguridad', propio: false, texto: 'Se refuerzan las rondas nocturnas esta semana.', hora: 'Ayer' },
  { id: 'msg-009', conversacionId: 'conv-005', autor: 'Rosa Maturana', propio: false, texto: 'Recibido, queda registrado.', hora: 'Lun' },
];

export const NOTIFICACIONES: Notificacion[] = [
  { id: 'not-001', condominioId: 'condo-001', titulo: 'Tu visita ingresó', detalle: 'Camilo Henríquez Díaz entró por Portería principal a las 18:27.', tipo: 'Visita', hora: '18:27', leida: false },
  { id: 'not-002', condominioId: 'condo-001', titulo: 'QR próximo a vencer', detalle: 'El QR de Sofía Ibarra vence mañana a las 16:00.', tipo: 'Visita', hora: '17:10', leida: false },
  { id: 'not-003', condominioId: 'condo-001', titulo: 'Corte de agua programado', detalle: 'Mañana de 10:00 a 12:00 en Torre A y B.', tipo: 'Aviso', hora: '16:02', leida: true },
  { id: 'not-004', condominioId: 'condo-001', titulo: 'Refuerzo de rondas nocturnas', detalle: 'La central de seguridad aumenta las rondas esta semana.', tipo: 'Seguridad', hora: 'Ayer', leida: true },
  { id: 'not-005', condominioId: 'condo-001', titulo: 'Vehículo agregado', detalle: 'La patente KLRT-42 fue registrada en tu unidad.', tipo: 'Sistema', hora: 'Lun', leida: true },
];

const A = (id: string, fecha: string, actor: string, rol: AuditoriaRegistro['rol'], accion: string, entidad: string, entidadId: string, ip: string, resultado: AuditoriaRegistro['resultado']): AuditoriaRegistro => ({ id, condominioId: 'condo-001', fecha, actor, rol, accion, entidad, entidadId, ip, resultado });
export const AUDITORIA: AuditoriaRegistro[] = [
  A('aud-001', 'Hoy 18:31:04', 'Ignacio Fuentes Lara', 'residente', 'Activó alerta de pánico', 'alertas_panico', 'pan-001', '190.45.12.88', 'Exitoso'),
  A('aud-002', 'Hoy 18:27:40', 'Luis Becerra', 'guardia', 'Registró entrada con QR', 'movimientos', 'mov-001', '10.0.4.21', 'Exitoso'),
  A('aud-003', 'Hoy 18:11:09', 'Marcela Opazo', 'administrador', 'Asignó responsable a incidencia', 'incidencias', 'inc-002', '181.72.9.140', 'Exitoso'),
  A('aud-004', 'Hoy 17:58:33', 'Valentina Soto Parra', 'residente', 'Emitió autorización QR', 'autorizaciones_qr', 'qr-001', '186.11.201.7', 'Exitoso'),
  A('aud-005', 'Hoy 17:40:12', 'Jorge Ramírez', 'guardia', 'Intentó validar QR vencido', 'autorizaciones_qr', 'qr-005', '10.0.4.18', 'Denegado'),
  A('aud-006', 'Hoy 16:44:50', 'Jorge Ramírez', 'guardia', 'Rechazó visita sin autorización', 'visitas', 'visita-007', '10.0.4.18', 'Exitoso'),
  A('aud-007', 'Hoy 15:20:01', 'Marcela Opazo', 'administrador', 'Revocó autorización QR', 'autorizaciones_qr', 'qr-007', '181.72.9.140', 'Exitoso'),
  A('aud-008', 'Hoy 12:03:27', 'Sistema', 'sistema', 'Cámara sin señal detectada', 'camaras', 'cam-004', '—', 'Error'),
  A('aud-009', 'Ayer 21:16:22', 'Jorge Ramírez', 'guardia', 'Cerró alerta de pánico', 'alertas_panico', 'pan-002', '10.0.4.18', 'Exitoso'),
  A('aud-010', 'Ayer 09:15:48', 'Marcela Opazo', 'administrador', 'Editó turno', 'turnos', 'turno-016', '181.72.9.140', 'Exitoso'),
  A('aud-011', 'Ayer 08:02:11', 'Desconocido', 'residente', 'Intento de acceso a otro condominio', 'condominios', 'condo-003', '200.14.77.3', 'Denegado'),
];

/** Gráficos: movimientos por hora (últimas 12 h). */
export const MOVS_POR_HORA = [
  { hora: '07', entradas: 18, salidas: 6 },
  { hora: '08', entradas: 34, salidas: 12 },
  { hora: '09', entradas: 14, salidas: 41 },
  { hora: '10', entradas: 9, salidas: 22 },
  { hora: '11', entradas: 12, salidas: 11 },
  { hora: '12', entradas: 21, salidas: 16 },
  { hora: '13', entradas: 17, salidas: 19 },
  { hora: '14', entradas: 11, salidas: 8 },
  { hora: '15', entradas: 15, salidas: 10 },
  { hora: '16', entradas: 19, salidas: 13 },
  { hora: '17', entradas: 28, salidas: 14 },
  { hora: '18', entradas: 36, salidas: 17 },
];

export const INCIDENCIAS_POR_CATEGORIA = [
  { categoria: 'Acceso indebido', total: 3 },
  { categoria: 'Falla técnica', total: 5 },
  { categoria: 'Vehículo sospechoso', total: 4 },
  { categoria: 'Daño a propiedad', total: 2 },
  { categoria: 'Ruidos molestos', total: 7 },
  { categoria: 'Emergencia médica', total: 1 },
];

export const TIEMPO_RESPUESTA = [
  { dia: 'Lun', segundos: 142 },
  { dia: 'Mar', segundos: 118 },
  { dia: 'Mié', segundos: 175 },
  { dia: 'Jue', segundos: 96 },
  { dia: 'Vie', segundos: 130 },
  { dia: 'Sáb', segundos: 204 },
  { dia: 'Dom', segundos: 158 },
];