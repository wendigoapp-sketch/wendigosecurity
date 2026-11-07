import React from 'react';
import { FlaskConical } from 'lucide-react';

export function DemoPill() {
  return (
    <span className="wg-demo-pill" title="Los datos son ficticios y las acciones no se guardan">
      <i /> Modo demostración
    </span>
  );
}

export function DemoNotice({ texto }: { texto: string }) {
  return (
    <div className="wg-banner">
      <FlaskConical size={16} />
      <span>{texto}</span>
    </div>
  );
}