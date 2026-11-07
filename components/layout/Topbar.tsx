'use client';
import React from 'react';
import { Bell, Menu, PanelLeft, Search } from 'lucide-react';
import { CondominioSelector } from '../ui/CondominioSelector';
import type { Condominio } from '../../lib/types';

interface Props {
  condominios: Condominio[];
  condominioId: string;
  onCondominio: (id: string) => void;
  onAlternarSidebar: () => void;
  onAbrirMovil: () => void;
  alertasActivas: number;
  onVerAlertas: () => void;
}

export function Topbar({ condominios, condominioId, onCondominio, onAlternarSidebar, onAbrirMovil, alertasActivas, onVerAlertas }: Props) {
  return (
    <header className="wg-topbar">
      <button type="button" className="wg-icon-btn wg-mobile-menu-btn" onClick={onAbrirMovil} aria-label="Abrir menú"><Menu size={17} /></button>
      <button type="button" className="wg-icon-btn wg-hide-mobile" onClick={onAlternarSidebar} aria-label="Contraer menú lateral"><PanelLeft size={17} /></button>
      <CondominioSelector condominios={condominios} seleccionadoId={condominioId} onSeleccionar={onCondominio} />
      <div className="wg-search">
        <Search size={15} />
        <input placeholder="Buscar residente, patente, visita…" aria-label="Búsqueda global" />
        <span className="wg-kbd">Ctrl K</span>
      </div>
      <div className="wg-spacer" />
      {/* DemoPill eliminado para limpiar la interfaz */}
      <button type="button" className="wg-icon-btn" onClick={onVerAlertas} aria-label={`Alertas de pánico activas: ${alertasActivas}`}>
        <Bell size={17} />
        {alertasActivas > 0 ? <span className="wg-dot" /> : null}
      </button>
    </header>
  );
}