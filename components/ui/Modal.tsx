'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  descripcion?: string;
  ancho?: boolean;
  children: React.ReactNode;
  pie?: React.ReactNode;
}

export function Modal({ abierto, onCerrar, titulo, descripcion, ancho, children, pie }: Props) {
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="wg-overlay is-center" onClick={onCerrar} role="presentation">
      <div 
        className={`wg-modal ${ancho ? 'is-wide' : ''}`} 
        role="dialog" 
        aria-modal="true" 
        aria-label={titulo} 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: 'calc(100vw - 32px)', // <-- El arreglo: nunca más ancho que la pantalla
          width: '100%' 
        }}
      >
        <div className="wg-modal-head">
          <div>
            <div className="wg-modal-title">{titulo}</div>
            {descripcion ? <div className="wg-modal-desc">{descripcion}</div> : null}
          </div>
          <button type="button" className="wg-icon-btn is-ghost" onClick={onCerrar} aria-label="Cerrar"><X size={16} /></button>
        </div>
        <div className="wg-modal-body">{children}</div>
        {pie ? <div className="wg-modal-foot">{pie}</div> : null}
      </div>
    </div>
  );
}

interface ConfirmProps {
  abierto: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
  titulo: string;
  descripcion: string;
  etiquetaConfirmar: string;
  peligro?: boolean;
}

export function ConfirmModal({ abierto, onCerrar, onConfirmar, titulo, descripcion, etiquetaConfirmar, peligro }: ConfirmProps) {
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={titulo}
      descripcion={descripcion}
      pie={
        <>
          <button type="button" className="wg-btn" onClick={onCerrar}>Cancelar</button>
          <button type="button" className={`wg-btn ${peligro ? 'is-danger' : 'is-primary'}`} onClick={() => { onConfirmar(); onCerrar(); }}>
            {etiquetaConfirmar}
          </button>
        </>
      }
    >
      <div className="wg-banner" style={{ marginBottom: 0 }}>
        <span>Modo demostración: la acción no modifica datos reales.</span>
      </div>
    </Modal>
  );
}

interface DrawerProps {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  subtitulo?: React.ReactNode;
  children: React.ReactNode;
  pie?: React.ReactNode;
}

export function DetailDrawer({ abierto, onCerrar, titulo, subtitulo, children, pie }: DrawerProps) {
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="wg-overlay is-right" onClick={onCerrar} role="presentation">
      <aside className="wg-drawer" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="wg-drawer-head">
          <div>
            <div className="wg-drawer-title">{titulo}</div>
            {subtitulo ? <div style={{ marginTop: 6 }}>{subtitulo}</div> : null}
          </div>
          <button type="button" className="wg-icon-btn is-ghost" onClick={onCerrar} aria-label="Cerrar panel"><X size={16} /></button>
        </div>
        <div className="wg-drawer-body">{children}</div>
        {pie ? <div className="wg-drawer-foot">{pie}</div> : null}
      </aside>
    </div>
  );
}