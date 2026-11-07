import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  etiqueta: string;
  valor: string | number;
  unidad?: string;
  pista?: React.ReactNode;
  icono: LucideIcon;
  tono?: 'neutro' | 'alerta' | 'aviso' | 'ok';
  ancho?: boolean;
  filaDoble?: boolean;
  extra?: React.ReactNode;
}

export function MetricCard({ etiqueta, valor, unidad, pista, icono, tono = 'neutro', ancho, filaDoble, extra }: Props) {
  const Icono = icono;
  const clase = tono === 'alerta' ? 'is-alert' : tono === 'aviso' ? 'is-warn' : tono === 'ok' ? 'is-ok' : '';
  const color = tono === 'alerta' ? 'var(--destructive)' : tono === 'aviso' ? 'var(--warning)' : tono === 'ok' ? 'var(--primary)' : 'var(--muted-foreground)';
  return (
    <div className={`wg-card is-hover ${clase} ${ancho ? 'wg-span-2' : ''} ${filaDoble ? 'wg-row-2' : ''} ${tono === 'alerta' ? 'wg-pulse-ring' : ''}`}>
      <div className="wg-card-head" style={{ marginBottom: 0 }}>
        <span className="wg-card-title">{etiqueta}</span>
        <Icono size={17} style={{ color }} />
      </div>
      <div className="wg-metric">
        {valor}
        {unidad ? <span className="wg-metric-unit">{unidad}</span> : null}
      </div>
      {pista ? <div className="wg-metric-hint">{pista}</div> : null}
      {extra}
    </div>
  );
}