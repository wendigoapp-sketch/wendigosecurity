import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorState({ mensaje, onReintentar }: { mensaje: string; onReintentar: () => void }) {
  return (
    <div className="wg-errorbox" role="alert">
      <AlertTriangle size={18} style={{ color: 'var(--destructive)', flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <b>Error al cargar la información</b>
        <span>{mensaje}</span>
      </div>
      <button type="button" className="wg-btn is-sm" onClick={onReintentar}>
        <RefreshCw size={13} /> Reintentar
      </button>
    </div>
  );
}