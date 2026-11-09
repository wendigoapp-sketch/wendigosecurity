'use client';
import React, { useState } from 'react';
import { CalendarClock, History, QrCode, UserPlus, XCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { QRCode } from '../ui/QRCode';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonLista } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { Modal, ConfirmModal } from '../ui/Modal';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Visita } from '../../lib/types';

interface Props {
  condominioId: string;
  modo: 'previstas' | 'historial';
  onAutorizar: () => void;
  onHistorial: () => void;
}

export function ResVisitas({ condominioId, modo, onAutorizar, onHistorial }: Props) {
  const { demo } = useToasts();
  const v = useServicio<Visita[]>(() => servicios.visitas(condominioId), [], [condominioId]);
  const [qr, setQr] = useState<Visita | null>(null);
  const [cancelar, setCancelar] = useState<Visita | null>(null);

  if (v.error) return <ErrorState mensaje={v.error} onReintentar={v.recargar} />;
  
  // Filtros corregidos (sin duplicados)
  const previstas = v.datos.filter((x) => x.estado === 'Autorizada' || x.estado === 'Programada' || x.estado === 'En el condominio');
const historial = v.datos.filter((x) =>
  x.estado === 'Finalizada' ||
  x.estado === 'Vencida' ||
  x.estado === 'Rechazada' ||
  x.estado === 'Cancelada'
);  const lista = modo === 'previstas' ? previstas : historial;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button type="button" className={`wg-chip ${modo === 'previstas' ? 'is-on' : ''}`} onClick={modo === 'previstas' ? undefined : onHistorial}><CalendarClock size={13} /> Previstas ({previstas.length})</button>
        <button type="button" className={`wg-chip ${modo === 'historial' ? 'is-on' : ''}`} onClick={modo === 'historial' ? undefined : onHistorial}><History size={13} /> Historial ({historial.length})</button>
      </div>

      {v.cargando ? <SkeletonLista /> : lista.length === 0 ? (
        <div className="wg-card">
          <EmptyState
            icono={modo === 'previstas' ? CalendarClock : History}
            titulo={modo === 'previstas' ? 'No tienes visitas previstas' : 'Aún no hay visitas en tu historial'}
            descripcion={modo === 'previstas' ? 'Autoriza una visita para generar un QR que el guardia pueda validar en portería.' : 'Cuando tus visitas ingresen y salgan, quedarán registradas aquí.'}
            accion={modo === 'previstas' ? <button type="button" className="wg-btn is-primary" onClick={onAutorizar}><UserPlus size={15} /> Autorizar visita</button> : undefined}
          />
        </div>
      ) : lista.map((x) => (
        <div key={`rv-${x.id}`} className="wg-list-card" style={{ flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <div className="wg-feed-icon"><CalendarClock size={17} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <b className="wg-cell-trunc">{x.visitante}</b>
                <Badge texto={x.estado} />
              </div>
              <div className="wg-cell-sub">{x.motivo} · {x.ventanaDesde}</div>
              {x.vehiculoPatente ? <div className="wg-cell-sub wg-mono">Vehículo {x.vehiculoPatente}</div> : null}
            </div>
          </div>
          {modo === 'previstas' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button type="button" className="wg-btn is-sm" style={{ flex: 1 }} onClick={() => setQr(x)} disabled={!x.qrCodigo}><QrCode size={13} /> Ver QR</button>
                <button type="button" className="wg-btn is-sm is-ghost" onClick={() => setCancelar(x)} style={{ color: 'var(--destructive)' }}><XCircle size={13} /> Cancelar</button>
              </div>
              {x.qrCodigo ? (
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Hola, tu visita para el condominio está autorizada. Presentá este QR en la portería: ${x.qrCodigo}`)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="wg-btn is-sm is-primary"
                  style={{ width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Compartir por WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}

      <Modal abierto={qr !== null} onCerrar={() => setQr(null)} titulo="Código QR de la visita" descripcion={qr ? `${qr.visitante} · ${qr.ventanaDesde}` : ''}>
        {qr?.qrCodigo ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'grid', placeItems: 'center' }}><QRCode codigo={qr.qrCodigo} /></div>
            <div className="wg-mono" style={{ marginTop: 12, fontWeight: 600, letterSpacing: '0.08em' }}>{qr.qrCodigo}</div>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`Hola, tu visita para el condominio está autorizada. Presentá este QR en la portería: ${qr.qrCodigo}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="wg-btn is-block is-primary" 
              style={{ marginTop: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              Compartir por WhatsApp
            </a>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        abierto={cancelar !== null}
        onCerrar={() => setCancelar(null)}
        onConfirmar={async () => {
          if (!cancelar) return;
          try {
            await servicios.cancelarVisita(cancelar.id);
            demo('Visita cancelada');
            setCancelar(null);
            window.location.reload();
          } catch (e) {
            console.error(e);
            demo('Error al cancelar');
          }
        }}
        titulo="Cancelar autorización"
        descripcion={`El QR de ${cancelar?.visitante ?? ''} se revocará y el guardia no permitirá su ingreso.`}
        etiquetaConfirmar="Cancelar autorización"
        peligro
      />
    </div>
  );
}