'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Building2, CalendarClock, CarFront, History, Home, MessageSquare, QrCode, UserPlus } from 'lucide-react';
import { ToastProvider } from '../ui/Toasts';
import { ResInicio } from './ResInicio';
import { ResAutorizar } from './ResAutorizar';
import { ResVisitas } from './ResVisitas';
import { ResVehiculos } from './ResVehiculos';
import { ResNotificaciones } from './ResNotificaciones';
import { ResInfo } from './ResInfo';
import { servicios } from '../../lib/services';

type Vista = 'inicio' | 'autorizar' | 'visitas' | 'historial' | 'vehiculos' | 'notificaciones' | 'conversaciones' | 'info';

const TITULOS: Record<Vista, string> = {
  inicio: 'Inicio', autorizar: 'Autorizar visita', visitas: 'Visitas previstas', historial: 'Historial',
  vehiculos: 'Mis vehículos', notificaciones: 'Notificaciones', conversaciones: 'Conversaciones', info: 'Mi condominio',
};

export function PanelResidente() {
  const [vista, setVista] = useState<Vista>('inicio');
  const [condominioId, setCondominioId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const unidad = 'Unidad 1'; // Luego lo sacaremos del usuario logueado

  useEffect(() => {
    const cargar = async () => {
      const id = await servicios.obtenerCondominioDelUsuario();
      setCondominioId(id);
      setCargando(false);
    };
    cargar();
  }, []);

  if (cargando) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)' }}>Cargando panel...</div>;
  }

  if (!condominioId) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)' }}>No tenés un condominio asignado.</div>;
  }

  const tabs: Array<{ id: Vista; etiqueta: string; icono: typeof Home; badge?: number }> = [
    { id: 'inicio', etiqueta: 'Inicio', icono: Home },
    { id: 'visitas', etiqueta: 'Visitas', icono: CalendarClock },
    { id: 'autorizar', etiqueta: 'Autorizar', icono: UserPlus },
    { id: 'notificaciones', etiqueta: 'Avisos', icono: Bell },
  ];

  const render = () => {
    switch (vista) {
      case 'inicio': return <ResInicio condominioId={condominioId} unidad={unidad} ir={(v) => setVista(v as Vista)} />;
      case 'autorizar': return <ResAutorizar condominioId={condominioId} unidad={unidad} onTerminar={() => setVista('visitas')} />;
      case 'visitas': return <ResVisitas condominioId={condominioId} modo="previstas" onAutorizar={() => setVista('autorizar')} onHistorial={() => setVista('historial')} />;
      case 'historial': return <ResVisitas condominioId={condominioId} modo="historial" onAutorizar={() => setVista('autorizar')} onHistorial={() => setVista('visitas')} />;
      case 'vehiculos': return <ResVehiculos condominioId={condominioId} unidad={unidad} />;
      case 'notificaciones': return <ResNotificaciones condominioId={condominioId} />;
      case 'info': return <ResInfo condominioId={condominioId} />;
      default: return null;
    }
  };

  const enTab = tabs.some((t) => t.id === vista);

  return (
    <ToastProvider>
      <div className="wg-res-shell">
        <div className="wg-res-frame">
          <header className="wg-res-top">
            {enTab ? (
              <div className="wg-brand-mark"><Building2 size={18} /></div>
            ) : (
              <button type="button" className="wg-btn is-sm" onClick={() => setVista('inicio')}>Volver</button>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{TITULOS[vista]}</div>
              <div className="wg-cell-sub">Mi condominio · Unidad {unidad}</div>
            </div>
          </header>
          <div className="wg-res-scroll wg-fade-in" key={vista}>{render()}</div>
          <nav className="wg-tabbar" aria-label="Navegación del residente">
            {tabs.map((t) => (
              <button key={`tab-${t.id}`} type="button" className={`wg-tab ${vista === t.id ? 'is-active' : ''}`} onClick={() => setVista(t.id)} aria-current={vista === t.id ? 'page' : undefined}>
                <t.icono size={20} />
                {t.etiqueta}
                {t.badge ? <span className="wg-nav-badge">{t.badge}</span> : null}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </ToastProvider>
  );
}

export const _iconosReservados = { QrCode, History, CarFront };