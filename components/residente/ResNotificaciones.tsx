'use client';
import React, { useState } from 'react';
import { Bell, CalendarClock, CheckCheck, Megaphone, Settings2, ShieldAlert } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonLista } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { Toggle } from '../ui/Toggle';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Notificacion } from '../../lib/types';

function icono(tipo: Notificacion['tipo']) {
  if (tipo === 'Visita') return CalendarClock;
  if (tipo === 'Seguridad') return ShieldAlert;
  if (tipo === 'Aviso') return Megaphone;
  return Settings2;
}

export function ResNotificaciones({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const n = useServicio<Notificacion[]>(() => servicios.notificaciones(condominioId), [], [condominioId]);
  const [leidas, setLeidas] = useState<string[]>([]);
  const [prefVisita, setPrefVisita] = useState(true);
  const [prefAviso, setPrefAviso] = useState(true);

  if (n.error) return <ErrorState mensaje={n.error} onReintentar={n.recargar} />;
  const noLeidas = n.datos.filter((x) => !x.leida && !leidas.includes(x.id)).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span className="wg-help">{noLeidas} sin leer</span>
        <button type="button" className="wg-btn is-sm" onClick={() => { setLeidas(n.datos.map((x) => x.id)); demo('Notificaciones marcadas como leídas'); }} disabled={noLeidas === 0}><CheckCheck size={13} /> Marcar todas</button>
      </div>

      {n.cargando ? <SkeletonLista /> : n.datos.length === 0 ? (
        <div className="wg-card"><EmptyState icono={Bell} titulo="No tienes notificaciones" descripcion="Te avisaremos cuando una visita ingrese, salga o cuando la administración publique un comunicado." /></div>
      ) : n.datos.map((x) => {
        const Icono = icono(x.tipo);
        const sinLeer = !x.leida && !leidas.includes(x.id);
        return (
          <button key={`rn-${x.id}`} type="button" className="wg-list-card" style={{ width: '100%', textAlign: 'left', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', borderColor: sinLeer ? 'color-mix(in srgb, var(--primary) 40%, var(--border))' : undefined }} onClick={() => setLeidas((l) => [...l, x.id])}>
            <div className={`wg-feed-icon ${x.tipo === 'Seguridad' ? 't-warn' : sinLeer ? 't-ok' : ''}`}><Icono size={17} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <b style={{ fontSize: 14 }}>{x.titulo}</b>
                <span className="wg-feed-time">{x.hora}</span>
              </div>
              <div className="wg-cell-sub" style={{ marginTop: 3, lineHeight: 1.45 }}>{x.detalle}</div>
            </div>
            {sinLeer ? <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} /> : null}
          </button>
        );
      })}

      <div className="wg-section-label">Preferencias</div>
      <div className="wg-card" style={{ padding: '4px 16px' }}>
        <div className="wg-toggle-row">
          <div><div className="wg-label">Avisarme cuando mi visita ingrese</div><p className="wg-help">Notificación inmediata en la app.</p></div>
          <Toggle activo={prefVisita} onChange={setPrefVisita} etiqueta="Avisos de ingreso de visitas" />
        </div>
        <div className="wg-toggle-row">
          <div><div className="wg-label">Comunicados de la administración</div><p className="wg-help">Cortes de servicio, reuniones y normas.</p></div>
          <Toggle activo={prefAviso} onChange={setPrefAviso} etiqueta="Comunicados de administración" />
        </div>
      </div>
    </div>
  );
}