'use client';
import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonLista } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Conversacion, Mensaje } from '../../lib/types';

export function ResConversaciones({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const c = useServicio<Conversacion[]>(() => servicios.conversaciones(condominioId), [], [condominioId]);
  const [activaId, setActivaId] = useState<string | null>(null);
  const m = useServicio<Mensaje[]>(() => (activaId ? servicios.mensajes(activaId) : Promise.resolve([])), [], [activaId]);
  const [texto, setTexto] = useState('');
  const [local, setLocal] = useState<Mensaje[]>([]);

  if (c.error) return <ErrorState mensaje={c.error} onReintentar={c.recargar} />;
  const activa = c.datos.find((x) => x.id === activaId) ?? null;
  const mensajes = [...m.datos, ...local.filter((x) => x.conversacionId === activaId)];

  const enviar = () => {
    if (!texto.trim() || !activaId) return;
    setLocal((l) => [...l, { id: `msg-res-${l.length + 1}`, conversacionId: activaId, autor: 'Yo', propio: true, texto: texto.trim(), hora: 'Ahora' }]);
    setTexto('');
    demo('Mensaje enviado (simulado)');
  };

  if (activa) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button type="button" className="wg-icon-btn" onClick={() => setActivaId(null)} aria-label="Volver a conversaciones"><ArrowLeft size={16} /></button>
          <div>
            <b>{activa.asunto}</b>
            <div className="wg-cell-sub">{activa.participantes}</div>
          </div>
        </div>
        <div className="wg-card" style={{ padding: 14, minHeight: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {m.cargando ? <div className="wg-skel" style={{ height: 40, width: '60%' }} /> : mensajes.map((x) => (
            <div key={`rm-${x.id}`} className={`wg-msg ${x.propio ? 'is-me' : ''}`}>
              {x.texto}
              <small>{x.autor} · {x.hora}</small>
            </div>
          ))}
        </div>
        {activa.tipo === 'Aviso' ? (
          <p className="wg-help" style={{ marginTop: 10 }}>Este canal es solo informativo. No admite respuestas.</p>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input className="wg-input is-lg" placeholder="Escribe un mensaje…" value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') enviar(); }} aria-label="Mensaje" />
            <button type="button" className="wg-btn is-primary is-lg" onClick={enviar} disabled={!texto.trim()} aria-label="Enviar mensaje"><Send size={17} /></button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {c.cargando ? <SkeletonLista /> : c.datos.length === 0 ? (
        <div className="wg-card"><EmptyState icono={MessageSquare} titulo="Sin conversaciones" descripcion="Escribe a conserjería o a la administración desde aquí cuando lo necesites." /></div>
      ) : c.datos.map((x) => (
        <button key={`rc-${x.id}`} type="button" className="wg-list-card" style={{ width: '100%', textAlign: 'left', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setActivaId(x.id)}>
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