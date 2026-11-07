/**
 * Capa de servicios. Hoy devuelve datos demo (con latencia simulada).
 * Para conectar el backend real, sustituir el cuerpo de cada función por
 * consultas a Supabase (respetando RLS por condominio) y mantener las firmas.
 * Nunca usar service_role en el navegador.
 */
import { isBackendConnected } from '../config/supabase';
import {
  CONDOS, UNIDADES, RESIDENTES, GUARDIAS, PUESTOS, VISITAS, QRS, MOVIMIENTOS, VEHICULOS, INCIDENCIAS, EVIDENCIAS,
  PANICOS, TURNOS, LUGARES, CAMARAS, CONVERSACIONES, MENSAJES, NOTIFICACIONES, AUDITORIA,
} from '../demo/data';
import type {
  Condominio, Unidad, ResidenteUnidad, Guardia, Puesto, Visita, AutorizacionQR, Movimiento, Vehiculo, Incidencia,
  Evidencia, AlertaPanico, Turno, LugarCondominio, Camara, Conversacion, Mensaje, Notificacion, AuditoriaRegistro,
} from '../types';

const delay = (ms = 250) => new Promise<void>((r) => setTimeout(r, ms));

function porCondominio<T extends { condominioId: string }>(rows: T[], condominioId: string): T[] {
  return rows.filter((r) => r.condominioId === condominioId);
}

// Backend integration: reemplazar cada `return` por supabase.from('<tabla>').select(...).eq('condominio_id', id)
export const servicios = {
  modoDemo: () => !isBackendConnected(),
  async condominios(): Promise<Condominio[]> { await delay(); return CONDOS; },
  async unidades(c: string): Promise<Unidad[]> { await delay(); return porCondominio(UNIDADES, c); },
  async residentes(c: string): Promise<ResidenteUnidad[]> { await delay(); return porCondominio(RESIDENTES, c); },
  async guardias(c: string): Promise<Guardia[]> { await delay(); return porCondominio(GUARDIAS, c); },
  async puestos(c: string): Promise<Puesto[]> { await delay(); return porCondominio(PUESTOS, c); },
  async visitas(c: string): Promise<Visita[]> { await delay(); return porCondominio(VISITAS, c); },
  async autorizacionesQR(c: string): Promise<AutorizacionQR[]> { await delay(); return porCondominio(QRS, c); },
  async movimientos(c: string): Promise<Movimiento[]> { await delay(); return porCondominio(MOVIMIENTOS, c); },
  async vehiculos(c: string): Promise<Vehiculo[]> { await delay(); return porCondominio(VEHICULOS, c); },
  async incidencias(c: string): Promise<Incidencia[]> { await delay(); return porCondominio(INCIDENCIAS, c); },
  async evidencias(incidenciaId: string): Promise<Evidencia[]> { await delay(120); return EVIDENCIAS.filter((e) => e.incidenciaId === incidenciaId); },
  async alertasPanico(c: string): Promise<AlertaPanico[]> { await delay(); return porCondominio(PANICOS, c); },
  async turnos(c: string): Promise<Turno[]> { await delay(); return porCondominio(TURNOS, c); },
  async lugares(c: string): Promise<LugarCondominio[]> { await delay(); return porCondominio(LUGARES, c); },
  async camaras(c: string): Promise<Camara[]> { await delay(); return porCondominio(CAMARAS, c); },
  async conversaciones(c: string): Promise<Conversacion[]> { await delay(); return porCondominio(CONVERSACIONES, c); },
  async mensajes(conversacionId: string): Promise<Mensaje[]> { await delay(120); return MENSAJES.filter((m) => m.conversacionId === conversacionId); },
  async notificaciones(c: string): Promise<Notificacion[]> { await delay(); return porCondominio(NOTIFICACIONES, c); },
  async auditoria(c: string): Promise<AuditoriaRegistro[]> { await delay(); return porCondominio(AUDITORIA, c); },
};

export type { };