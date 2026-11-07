'use client';
import React, { useState } from 'react';
import { Building2, Check, ChevronDown } from 'lucide-react';
import type { Condominio } from '../../lib/types';

interface Props {
  condominios: Condominio[];
  seleccionadoId: string;
  onSeleccionar: (id: string) => void;
}

export function CondominioSelector({ condominios, seleccionadoId, onSeleccionar }: Props) {
  const [abierto, setAbierto] = useState(false);
  const actual = condominios.find((c) => c.id === seleccionadoId) ?? condominios[0];
  
  if (!actual) return null;

  return (
    <div className="wg-select-wrap" style={{ position: 'relative' }}>
      <button type="button" className="wg-condo-btn" onClick={() => setAbierto((a) => !a)} aria-haspopup="listbox" aria-expanded={abierto}>
        <Building2 size={15} style={{ color: 'var(--primary)' }} />
        <span className="wg-hide-mobile">{actual.nombre}</span>
        <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
      </button>
      
      {abierto ? (
        <div 
          className="wg-menu" 
          role="listbox"
          style={{
            position: 'fixed',      // Se clava en la pantalla
            top: '70px',           // Justo debajo de la barra superior
            left: '50%',           // Centrado horizontal
            transform: 'translateX(-50%)', // Ajuste fino para centrar
            width: 'calc(100vw - 32px)',  // Nunca más ancho que la pantalla
            maxWidth: '320px',     // En compu no se estira de más
            zIndex: 9999
          }}
        >
          {condominios.map((c) => (
            <button
              key={`condosel-${c.id}`}
              type="button"
              role="option"
              aria-selected={c.id === seleccionadoId}
              className={`wg-menu-item ${c.id === seleccionadoId ? 'is-selected' : ''}`}
              onClick={() => { onSeleccionar(c.id); setAbierto(false); }}
            >
              <Building2 size={15} style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 600 }}>{c.nombre}</span>
                <span className="wg-menu-sub">{c.comuna} · {c.unidades} unidades</span>
              </span>
              {c.id === seleccionadoId ? <Check size={15} style={{ color: 'var(--primary)' }} /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}