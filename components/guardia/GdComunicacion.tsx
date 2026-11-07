'use client';
import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Radio, Send } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonLista } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Conversacion, Mensaje } from '../../lib/types';

const RAPIDOS = [
  'Visita en portería, solicito autorización',
  'Ronda perimetral completada sin novedades',
  'Necesito apoyo en acceso vehicular',
  'Portón con falla, se mantiene vigilancia manual',
];

export function GdComunicacion({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const c = useServicio<Conversacion[]>(() => servicios.conversaciones(condominioId), [], [condominioId]);
  const [activaId, setActivaId] = useState<string | null>(null);
  const m = useServicio<Mensaje[]>(() => (activaId ? servicios.mensajes(activaId) : Promise.resolve([])), [], [activaId]);
  const [texto, setTexto] = useState('');
  const [local, setLocal] = useState<Mensaje[]>([]);

  if (c.error) return <ErrorState mensaje={c.error} onReintentar={c.recargar} />;
  const activa = c.datos.find((x) => x.id === activaId) ?? null;
  const mensajes = [...m.datos, ...local.filter((x) => x.conversacionId === activaId)];

  const enviar = (contenido: string) => {
    if (!contenido.trim() || !activaId) return;
    setLocal((l) => [...l, { id: `msg-gd-${l.length + 1}`, conversacionId: activaId, autor: 'Yo', propio: true, texto: contenido.trim(), hora: 'Ahora' }]);
    setTexto('');
    demo('Mensaje enviado (simulado)');
  };

  if (activa) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button type="button" className="wg-btn is-sm" onClick={() => setActivaId(null)}><ArrowLeft size={16} /> Volver</button>
          <div>
            <b style={{ fontSize: 16 }}>{activa.asunto}</b>
            <div className="wg-cell-sub">{activa.participantes}</div>
          </div>
        </div>
        <div className="wg-card" style={{ minHeight: 280, display: 'flex', flexDirection: 'column', gap: 10, padding: 12 }}>
          {m.cargando ? <div className="wg-skel" style={{ height: 44, width: '60%' }} /> : mensajes.map((x) => (
            <div key={`gmsg-${x.id}`} className={`wg-msg ${x.propio ? 'is-me' : ''}`} style={{ fontSize: 14 }}>
              {x.texto}
              <small>{x.autor} · {x.hora}</small>
            </div>
          ))}
        </div>
        {activa.tipo === 'Aviso' ? (
          <p className="wg-help" style={{ marginTop: 10 }}>Canal informativo: no admite respuestas.</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '14px 0 10px' }}>
              {RAPIDOS.map((r) => <button key={`rap-${r}`} type="button" className="wg-chip" onClick={() => enviar(r)} style={{ fontSize: 11 }}>{r}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="wg-input" placeholder="Escribe un mensaje…" value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') enviar(texto); }} aria-label="Mensaje" />
              <button type="button" className="wg-btn is-primary" disabled={!texto.trim()} onClick={() => enviar(texto)} aria-label="Enviar mensaje"><Send size={18} /></button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* BOTONES APILADOS VERTICALMENTE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <button type="button" className="wg-btn is-xl" onClick={() => demo('Llamada a control central (simulada)')} style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 12, padding: 16 }}>
          <Radio size={24} /> <span style={{ fontSize: 16 }}>Llamar a central</span>
        </button>
        <button type="button" className="wg-btn is-xl" onClick={() => demo('Llamada al administrador (simulada)')} style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 12, padding: 16 }}>
          <MessageSquare size={24} /> <span style={{ fontSize: 16 }}>Llamar a administración</span>
        </button>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Conversaciones</h2>
      {c.cargando ? <SkeletonLista /> : c.datos.length === 0 ? (
        <div className="wg-card"><EmptyState icono={MessageSquare} titulo="Sin conversaciones" descripcion="Los mensajes de la central y los residentes aparecerán aquí." /></div>
      ) : c.datos.map((x) => (
        <button key={`gcv-${x.id}`} type="button" className="wg-visit-row" onClick={() => setActivaId(x.id)}>
          <div className="wg-avatar">{x.asunto.slice(0, 2).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <b className="wg-cell-trunc" style={{ fontSize: 14 }}>{x.asunto}</b>
              <span className="wg-feed-time">{x.hora}</span>
            </div>
            <div className="wg-cell-sub wg-cell-trunc">{x.ultimoMensaje}</div>
          </div>
          {x.noLeidos > 0 ? <span className="wg-nav-badge">{x.noLeidos}</span> : null}
        </button>
      ))}
    </div>
  );
}