import React from 'react';

export type Tono = 'ok' | 'warn' | 'bad' | 'info' | 'mute';

const MAPA: Record<string, Tono> = {
  // visitas
  Programada: 'info', Autorizada: 'ok', 'En el condominio': 'warn', Finalizada: 'mute', Vencida: 'mute', Rechazada: 'bad',
  // qr
  Vigente: 'ok', Usado: 'info', Vencido: 'mute', Revocado: 'bad',
  // incidencias
  Abierta: 'bad', 'En revisión': 'warn', Resuelta: 'ok', Cerrada: 'mute',
  Baja: 'info', Media: 'warn', Alta: 'bad', 'Crítica': 'bad',
  // panico
  Activa: 'bad', Atendida: 'warn', Confirmada: 'ok', 'Falsa alarma': 'mute',
  // guardias / turnos
  'En turno': 'ok', 'Fuera de turno': 'mute', Licencia: 'warn', Completado: 'mute', 'En curso': 'ok', Ausente: 'bad',
  // generico
  Activo: 'ok', Pendiente: 'warn', Inactivo: 'mute', Suspendido: 'bad', Implementacion: 'info',
  Ocupada: 'ok', Desocupada: 'mute', Morosa: 'bad',
  Registrado: 'info', Bloqueado: 'bad',
  'En línea': 'ok', 'Sin señal': 'bad', 'Mantención': 'warn',
  Exitoso: 'ok', Denegado: 'bad', Error: 'warn',
  Entrada: 'ok', Salida: 'info',
};

export function Badge({ texto, tono, punto = true }: { texto: string; tono?: Tono; punto?: boolean }) {
  const t = tono ?? MAPA[texto] ?? 'info';
  return (
    <span className={`wg-badge t-${t}`}>
      {punto ? <i /> : null}
      {texto}
    </span>
  );
}