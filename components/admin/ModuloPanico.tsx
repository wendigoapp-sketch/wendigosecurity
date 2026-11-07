'use client';
import React, { useState } from 'react';
import { CheckCheck, MapPin, ShieldAlert, Siren } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { DataTable, type Columna } from '../ui/DataTable';
import { PageHeader } from '../ui/PageHeader';
import { SkeletonTabla } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { ConfirmModal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { AlertaPanico } from '../../lib/types';

export function ModuloPanico({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const p = useServicio<AlertaPanico[]>(() => servicios.alertasPanico(condominioId), [], [condominioId]);
  const [cerrar, setCerrar] = useState<AlertaPanico | null>(null);

  if (p.error) return <ErrorState mensaje={p.error} onReintentar={p.recargar} />;
  const activas = p.datos.filter((x) => x.estado === 'Activa');

  const columnas: Columna<AlertaPanico>[] = [
    { clave: 'fecha', titulo: 'Fecha y hora', ordenable: true, valor: (x) => x.fecha, render: (x) => <span className="wg-mono wg-cell-main">{x.fecha}</span> },
    { clave: 'origen', titulo: 'Origen', render: (x) => x.origen },
    { clave: 'ubicacion', titulo: 'Ubicación', render: (x) => x.ubicacion },
    { clave: 'estado', titulo: 'Estado', render: (x) => <Badge texto={x.estado} /> },
    { clave: 'respondio', titulo: 'Respondió', render: (x) => x.respondio ?? <span style={{ color: 'var(--muted-foreground)' }}>—</span> },
    { clave: 'tiempo', titulo: 'Tiempo de respuesta', render: (x) => (x.tiempoRespuesta ? <span className="wg-mono">{x.tiempoRespuesta}</span> : <span style={{ color: 'var(--muted-foreground)' }}>—</span>) },
    { clave: 'resultado', titulo: 'Resultado', render: (x) => (x.resultado ? <Badge texto={x.resultado} /> : <span style={{ color: 'var(--muted-foreground)' }}>—</span>) },
  ];

  return (
    <div>
      <PageHeader
        titulo="Alertas de pánico"
        descripcion="Alertas emitidas por residentes y guardias. Las activas requieren atención inmediata."
        vivo={activas.length > 0 ? `${activas.length} alerta activa sin atender` : 'Sin alertas activas'}
      />

      {p.cargando ? <SkeletonTabla columnas={7} /> : (
        <>
          {activas.length === 0 ? (
            <div className="wg-card is-ok" style={{ marginBottom: 16 }}>
              <EmptyState icono={ShieldAlert} titulo="No hay alertas de pánico activas" descripcion="Cuando un residente o guardia presione el botón de pánico, la alerta aparecerá aquí en tiempo real." />
            </div>
          ) : activas.map((a) => (
            <div key={`activa-${a.id}`} className="wg-card is-alert wg-pulse-ring" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div className="wg-feed-icon t-bad" style={{ width: 48, height: 48 }}><Siren size={24} /></div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <b style={{ fontSize: 17 }}>Alerta de pánico activa</b>
                    <Badge texto="Activa" />
                  </div>
                  <div style={{ marginTop: 6, fontSize: 14 }}>{a.origen}</div>
                  <div className="wg-metric-hint"><MapPin size={14} /> {a.ubicacion} · {a.fecha}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    <button type="button" className="wg-btn is-danger" onClick={() => demo('Alerta marcada como atendida (simulado)')}>Marcar como atendida</button>
                    <button type="button" className="wg-btn" onClick={() => demo('Guardia notificado por radio (simulado)')}>Notificar al guardia más cercano</button>
                    <button type="button" className="wg-btn" onClick={() => demo('Llamada a residente iniciada (simulado)')}>Llamar al residente</button>
                    <button type="button" className="wg-btn is-ghost" onClick={() => setCerrar(a)}><CheckCheck size={14} /> Cerrar como falsa alarma</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="wg-section-label" style={{ marginTop: 4 }}>Historial de alertas</div>
          <DataTable
            filas={p.datos}
            columnas={columnas}
            idDe={(x) => x.id}
            textoBusqueda={(x) => `${x.origen} ${x.ubicacion} ${x.respondio ?? ''}`}
            filtros={[
              { clave: 'estado', etiqueta: 'Estado', opciones: ['Activa', 'Atendida', 'Cerrada'], coincide: (x, v) => x.estado === v },
              { clave: 'resultado', etiqueta: 'Resultado', opciones: ['Confirmada', 'Falsa alarma'], coincide: (x, v) => x.resultado === v },
            ]}
            vacioIcono={ShieldAlert}
            vacioTitulo="Sin historial de alertas"
            vacioDescripcion="Las alertas atendidas y cerradas quedan registradas aquí para su análisis."
            placeholderBusqueda="Buscar por origen, ubicación o responsable…"
          />
        </>
      )}

      <ConfirmModal
        abierto={cerrar !== null}
        onCerrar={() => setCerrar(null)}
        onConfirmar={() => demo('Alerta cerrada como falsa alarma (simulado)')}
        titulo="Cerrar como falsa alarma"
        descripcion="La alerta quedará registrada en el historial y en auditoría como falsa alarma. Confirma que no existe riesgo para las personas."
        etiquetaConfirmar="Cerrar alerta"
      />
    </div>
  );
}