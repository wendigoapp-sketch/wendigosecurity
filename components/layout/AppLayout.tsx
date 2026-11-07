'use client';
import React, { useState } from 'react';
import { Sidebar, type GrupoNav } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastProvider } from '../ui/Toasts';
import type { Condominio } from '../../lib/types';

interface Props {
  grupos: GrupoNav[];
  moduloActivo: string;
  onModulo: (id: string) => void;
  condominios: Condominio[];
  condominioId: string;
  onCondominio: (id: string) => void;
  usuario: { nombre: string; rol: string };
  alertasActivas: number;
  children: React.ReactNode;
}

export function AppLayout({ grupos, moduloActivo, onModulo, condominios, condominioId, onCondominio, usuario, alertasActivas, children }: Props) {
  const [colapsado, setColapsado] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  return (
    <ToastProvider>
      <div className="wg-shell">
        <div className={`wg-scrim ${movilAbierto ? 'is-open' : ''}`} onClick={() => setMovilAbierto(false)} role="presentation" />
        <Sidebar
          grupos={grupos}
          moduloActivo={moduloActivo}
          onModulo={(id) => { onModulo(id); setMovilAbierto(false); }}
          colapsado={colapsado}
          movilAbierto={movilAbierto}
          usuario={usuario}
        />
        <div className="wg-main">
          <Topbar
            condominios={condominios}
            condominioId={condominioId}
            onCondominio={onCondominio}
            onAlternarSidebar={() => setColapsado((c) => !c)}
            onAbrirMovil={() => setMovilAbierto(true)}
            alertasActivas={alertasActivas}
            onVerAlertas={() => onModulo('panico')}
          />
          <main className="wg-content wg-fade-in">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}