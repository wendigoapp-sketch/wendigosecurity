'use client';
import React from 'react';

export function Toggle({ activo, onChange, etiqueta }: { activo: boolean; onChange: (v: boolean) => void; etiqueta: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      className={`wg-toggle ${activo ? 'is-on' : ''}`}
      onClick={() => onChange(!activo)}
    />
  );
}