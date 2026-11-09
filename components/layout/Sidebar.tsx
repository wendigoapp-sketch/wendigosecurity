'use client';
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ItemNav {
  id: string;
  etiqueta: string;
  icono: LucideIcon;
  badge?: number;
  badgeSuave?: boolean;
}
export interface GrupoNav {
  titulo: string;
  items: ItemNav[];
}

interface Props {
  grupos: GrupoNav[];
  moduloActivo: string;
  onModulo: (id: string) => void;
  colapsado: boolean;
  movilAbierto: boolean;
  usuario: { nombre: string; rol: string };
}

export function Sidebar({ grupos, moduloActivo, onModulo, colapsado, movilAbierto, usuario }: Props) {
  const iniciales = usuario.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('');
  return (
    <aside className={`wg-sidebar ${colapsado ? 'is-collapsed' : ''} ${movilAbierto ? 'is-open' : ''}`} aria-label="Navegación principal">
      <div className="wg-sidebar-head">
        <div className="wg-brand-mark"><ShieldCheck size={19} /></div>
        <div className="wg-brand-text">
          <div className="wg-brand-name">WendigoSecurity</div>
          <div className="wg-brand-sub">Centro de control</div>
        </div>
      </div>
      <nav className="wg-sidebar-scroll">
        {grupos.map((g) => (
          <div key={`grp-${g.titulo}`} className="wg-nav-group">
            <div className="wg-nav-group-title">{g.titulo}</div>
            {g.items.map((it) => (
              <button
                key={`nav-${it.id}`}
                type="button"
                className={`wg-nav-item ${moduloActivo === it.id ? 'is-active' : ''}`}
                onClick={() => onModulo(it.id)}
                aria-current={moduloActivo === it.id ? 'page' : undefined}
              >
                <it.icono size={17} />
                <span className="wg-nav-label">{it.etiqueta}</span>
                {it.badge ? <span className={`wg-nav-badge ${it.badgeSuave ? 'is-soft' : ''}`}>{it.badge}</span> : null}
                <span className="wg-tip">{it.etiqueta}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="wg-sidebar-foot">
        <div className="wg-avatar">{iniciales}</div>
        <div className="wg-user-meta">
          <div className="wg-user-name">{usuario.nombre}</div>
          <div className="wg-user-role">{usuario.rol}</div>
        </div>
      </div>
    </aside>
  );
}