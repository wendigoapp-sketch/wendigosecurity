'use client';
import React, { useState } from 'react';
import { Megaphone, MessageSquare, Send } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { PageHeader } from '../ui/PageHeader';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { Modal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Conversacion, Mensaje } from '../../lib/types';

export function ModuloComunicacion({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const c = useServicio<Conversacion[]>(() => servicios.conversaciones(condominioId), [], [condominioId]);
  const [activaId, setActivaId] = useState<string | null>(null);
  const m = useServicio<Mensaje[]>(() => (activaId ? servicios.mensajes(activaId) : Promise.resolve([])), [], [activaId]);
  const [texto, setTexto] = useState('');
  const [local, setLocal] = useState<Mensaje[]>([]);
  const [aviso, setAviso] = useState(false);
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');

  if (c.error) return <ErrorState mensaje={c.error} onReintentar={c.recargar} />;
  const activa = c.datos.find((x) => x.id === activaId) ?? null;
  const mensajes = [...m.datos, ...local.filter((x) => x.conversacionId === activaId)];

  const enviar = () => {
    if (!texto.trim() || !activaId) return;
    setLocal((l) => [...l, { id: `msg-local-${l.length + 1}`, conversacionId: activaId, autor: 'Yo', propio: true, texto: texto.trim(), hora: 'Ahora' }]);
    setTexto('');
    demo('Mensaje enviado (simulado)');
  };

  return (
    <div>
      <PageHeader
        titulo="Comunicación"
        descripcion="Conversaciones con residentes y guardias, y avisos generales a toda la comunidad."
        acciones={<button type="button" className="wg-btn is-primary" onClick={() => setAviso(true)}><Megaphone size={15} /> Enviar aviso general</button>}
      />
      {c.cargando ? (
        <div className="wg-skel" style={{ height: 520 }} />
      ) : c.datos.length === 0 ? (
        <div className="wg-card"><EmptyState icono={MessageSquare} titulo="Aún no hay conversaciones" descripcion="Cuando un residente o guardia te escriba, la conversación aparecerá aquí." /></div>
      ) : (
        <div className="wg-chat">
          <div className={`wg-chat-list ${activa ? 'is-hidden-mobile' : ''}`}>
            {c.datos.map((x) => (
              <div key={`conv-${x.id}`} className={`wg-chat-item ${x.id === activaId ? 'is-active' : ''}`} onClick={() => setActivaId(x.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setActivaId(x.id); }}>
                <div className="wg-avatar">{x.asunto.slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <b className="wg-cell-trunc" style={{ fontSize: 13.5 }}>{x.asunto}</b>
                    <span className="wg-feed-time">{x.hora}</span>
                  </div>
                  <div className="wg-cell-sub wg-cell-trunc">{x.ultimoMensaje}</div>
                </div>
                {x.noLeidos > 0 ? <span className="wg-nav-badge">{x.noLeidos}</span> : null}
              </div>
            ))}
          </div>
          <div className={`wg-chat-pane ${activa ? '' : 'is-hidden-mobile'}`}>
            {activa ? (
              <>
                <div className="wg-chat-head">
                  <button type="button" className="wg-btn is-sm is-ghost" onClick={() => setActivaId(null)}>Volver</button>
                  <div style={{ flex: 1 }}>
                    <b>{activa.asunto}</b>
                    <div className="wg-cell-sub">{activa.participantes}</div>
                  </div>
                  <Badge texto={activa.tipo} tono="info" punto={false} />
                </div>
                <div className="wg-chat-body">
                  {m.cargando ? <div className="wg-skel" style={{ height: 40, width: '60%' }} /> : mensajes.map((x) => (
                    <div key={`m-${x.id}`} className={`wg-msg ${x.propio ? 'is-me' : ''}`}>
                      {x.texto}
                      <small>{x.autor} · {x.hora}</small>
                    </div>
                  ))}
                </div>
                <div className="wg-chat-compose">
                  <input className="wg-input" placeholder="Escribe un mensaje…" value={texto} onChange={(e) => setTexto(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') enviar(); }} aria-label="Mensaje" />
                  <button type="button" className="wg-btn is-primary" onClick={enviar} disabled={!texto.trim()}><Send size={15} /> Enviar</button>
                </div>
              </>
            ) : (
              <EmptyState icono={MessageSquare} titulo="Selecciona una conversación" descripcion="Elige una conversación de la lista para leer y responder mensajes." />
            )}
          </div>
        </div>
      )}

      <Modal
        abierto={aviso}
        onCerrar={() => setAviso(false)}
        titulo="Enviar aviso general"
        descripcion="Se enviará como notificación a todos los residentes del condominio. En modo demostración no se envía."
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setAviso(false)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" disabled={!asunto.trim() || !cuerpo.trim()} onClick={() => { setAviso(false); setAsunto(''); setCuerpo(''); demo('Aviso general enviado (simulado)'); }}>Enviar aviso</button>
          </>
        }
      >
        <div className="wg-form-grid">
          <Field etiqueta="Asunto" requerido completo>
            <input className="wg-input" value={asunto} onChange={(e) => setAsunto(e.target.value)} />
          </Field>
          <Field etiqueta="Mensaje" requerido completo>
            <textarea className="wg-textarea" value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}