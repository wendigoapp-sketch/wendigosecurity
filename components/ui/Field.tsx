import React from 'react';

interface Props {
  etiqueta: string;
  requerido?: boolean;
  ayuda?: string;
  error?: string;
  completo?: boolean;
  children: React.ReactNode;
}

export function Field({ etiqueta, requerido, ayuda, error, completo, children }: Props) {
  return (
    <div className={`wg-field ${completo ? 'is-full' : ''}`}>
      <label className="wg-label">
        {etiqueta}{requerido ? <em>*</em> : null}
      </label>
      {ayuda ? <p className="wg-help">{ayuda}</p> : null}
      {children}
      {error ? <p className="wg-err" role="alert">{error}</p> : null}
    </div>
  );
}