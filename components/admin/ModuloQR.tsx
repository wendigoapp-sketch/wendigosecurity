'use client';
import React, { useState } from 'react';
import { Eye, QrCode, ShieldOff } from 'lucide-react';
import { DataTable, type Columna } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { DetailDrawer, ConfirmModal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';
import { SkeletonTabla } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { QRCode } from '../ui/QRCode';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { AutorizacionQR } from '../../lib/types';

export function ModuloQR({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const q = useServicio<AutorizacionQR[]>(() => servicios.autorizacionesQR(condominioId), [], [condominioId]);
  const [detalle, setDetalle] = useState<AutorizacionQR | null>(null);
  const [revocar, setRevocar] = useState<AutorizacionQR | null>(null);

  const columnas: Columna<AutorizacionQR>[] = [
    { clave: 'codigo', titulo: 'Código', ordenable: true, valor: (x) => x.codigo, render: (x) => (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}><QRCode codigo={x.codigo} pequeno /><span className="wg-mono wg-cell-main">{x.codigo}</span></span>) },
    { clave: 'visitante', titulo: 'Visitante', ordenable: true, valor: (x) => x.visitante, render: (x) => x.visitante },
    { clave: 'unidad', titulo: 'Unidad', render: (x) => <span className="wg-mono">{x.unidadCodigo}</span> },
    { clave: 'emitido', titulo: 'Emitido por', render: (x) => x.emitidoPor },
    { clave: 'validez', titulo: 'Validez', render: (x) => <span className="wg-mono">{x.validoDesde} → {x.validoHasta.replace(/^(Hoy|Ayer|Mañana) /, '')}</span> },
    { clave: 'usos', titulo: 'Usos', alinear: 'right', render: (x) => <span className="wg-tnum">{x.usosActuales}/{x.usosMax}</span> },
    { clave: 'estado', titulo: 'Estado', render: (x) => <Badge texto={x.estado} /> },
  ];

  if (q.error) return <ErrorState mensaje={q.error} onReintentar={q.recargar} />;
  const vigentes = q.datos.filter((x) => x.estado === 'Vigente').length;

  return (
    <div>
      <PageHeader
        titulo="Autorizaciones QR"
        descripcion="Códigos emitidos por residentes y administración, con ventana horaria y límite de usos."
        vivo={`${vigentes} QR vigentes en este momento`}
      />
      {q.cargando ? <SkeletonTabla columnas={7} /> : (
        <DataTable
          filas={q.datos}
          columnas={columnas}
          idDe={(x) => x.id}
          textoBusqueda={(x) => `${x.codigo} ${x.visitante} ${x.unidadCodigo} ${x.emitidoPor}`}
          filtros={[{ clave: 'estado', etiqueta: 'Estado', opciones: ['Vigente', 'Usado', 'Vencido', 'Revocado'], coincide: (x, v) => x.estado === v }]}
          acciones={[
            { etiqueta: 'Ver QR', icono: Eye, onClick: (x) => setDetalle(x) },
            { etiqueta: 'Revocar QR', icono: ShieldOff, onClick: (x) => setRevocar(x), peligro: true },
          ]}
          onFila={(x) => setDetalle(x)}
          filaSeleccionadaId={detalle?.id}
          vacioIcono={QrCode}
          vacioTitulo="Aún no hay autorizaciones QR"
          vacioDescripcion="Cuando un residente autorice una visita se generará un QR que aparecerá en este listado."
          placeholderBusqueda="Buscar por código, visitante o unidad…"
        />
      )}

      <DetailDrawer
        abierto={detalle !== null}
        onCerrar={() => setDetalle(null)}
        titulo={detalle?.codigo ?? ''}
        subtitulo={detalle ? <Badge texto={detalle.estado} /> : null}
        pie={detalle?.estado === 'Vigente' ? <button type="button" className="wg-btn is-danger" onClick={() => setRevocar(detalle)}><ShieldOff size={14} /> Revocar QR</button> : undefined}
      >
        {detalle ? (
          <>
            <div style={{ display: 'grid', placeItems: 'center', padding: '8px 0 18px' }}>
              <QRCode codigo={detalle.codigo} />
              <p className="wg-help" style={{ marginTop: 10, textAlign: 'center' }}>Representación de demostración, no escaneable.</p>
            </div>
            <dl className="wg-kv">
              <dt>Visitante</dt><dd>{detalle.visitante}</dd>
              <dt>Unidad</dt><dd className="wg-mono">{detalle.unidadCodigo}</dd>
              <dt>Emitido por</dt><dd>{detalle.emitidoPor}</dd>
              <dt>Válido desde</dt><dd className="wg-mono">{detalle.validoDesde}</dd>
              <dt>Válido hasta</dt><dd className="wg-mono">{detalle.validoHasta}</dd>
              <dt>Usos</dt><dd className="wg-tnum">{detalle.usosActuales} de {detalle.usosMax}</dd>
            </dl>
          </>
        ) : null}
      </DetailDrawer>

      <ConfirmModal
        abierto={revocar !== null}
        onCerrar={() => setRevocar(null)}
        onConfirmar={() => demo(`QR revocado: ${revocar?.codigo ?? ''}`)}
        titulo="Revocar autorización QR"
        descripcion={`El código ${revocar?.codigo ?? ''} dejará de ser válido de inmediato. Si el visitante intenta ingresar, el guardia verá el acceso denegado.`}
        etiquetaConfirmar="Revocar QR"
        peligro
      />
    </div>
  );
}