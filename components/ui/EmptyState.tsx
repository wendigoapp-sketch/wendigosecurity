import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  accion?: React.ReactNode;
}

export function EmptyState({ icono, titulo, descripcion, accion }: Props) {
  const Icono = icono;
  return (
    <div className="wg-empty">
      <div className="wg-empty-icon"><Icono size={22} /></div>
      <h4>{titulo}</h4>
      <p>{descripcion}</p>
      {accion ? <div style={{ marginTop: 10 }}>{accion}</div> : null}
    </div>
  );
}