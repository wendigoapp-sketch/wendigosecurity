'use client';
import React, { useState } from 'react';
import { Download, Eye, ScrollText } from 'lucide-react';
import { DataTable, type Columna } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { DetailDrawer } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';
import { SkeletonTabla } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { AuditoriaRegistro } from '../../lib/types';

export function ModuloAuditoria({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const a = useServicio<AuditoriaRegistro[]>(() => servicios.auditoria(condominioId), [], [condominioId]);
  const [detalle, setDetalle] = useState<AuditoriaRegistro | null>(null);

  const columnas: Columna<AuditoriaRegistro>[] = [
    { clave: 'fecha', titulo: 'Fecha y hora', ordenable: true, valor: (x) => x.fecha, render: (x) => <span className="wg-mono">{x.fecha}</span> },
    { clave: 'actor', titulo: 'Actor', ordenable: true, valor: (x) => x.actor, render: (x) => <span className="wg-cell-main">{x.actor}</span> },
    { clave: 'rol', titulo: 'Rol', render: (x) => <Badge texto={x.rol === 'sistema' ? 'Sistema' : x.rol.charAt(0).toUpperCase() + x.rol.slice(1)} tono="info" punto={false} /> },
    { clave: 'accion', titulo: 'Acción', render: (x) => x.accion },
    { clave: 'entidad', titulo: 'Tabla', render: (x) => <span className="wg-mono">{x.entidad}</span> },
    { clave: 'entidadId', titulo: 'Registro', render: (x) => <span className="wg-mono">{x.entidadId}</span> },
    { clave: 'ip', titulo: 'Origen IP', render: (x) => <span className="wg-mono">{x.ip}</span> },
    { clave: 'resultado', titulo: 'Resultado', render: (x) => <Badge texto={x.resultado} /> },
  ];

  if (a.error) return <ErrorState mensaje={a.error} onReintentar={a.recargar} />;
  const denegados = a.datos.filter((x) => x.resultado !== 'Exitoso').length;

  return (
    <div>
      <PageHeader
        titulo="Auditoría"
        descripcion="Registro inmutable de acciones sensibles: quién hizo qué, sobre qué registro y desde dónde."
        vivo={`${denegados} eventos denegados o con error en el periodo`}
        acciones={<button type="button" className="wg-btn" onClick={() => demo('Auditoría exportada (simulado)')}><Download size={14} /> Exportar registro</button>}
      />
      {a.cargando ? <SkeletonTabla columnas={8} /> : (
        <DataTable
          filas={a.datos}
          columnas={columnas}
          idDe={(x) => x.id}
          textoBusqueda={(x) => `${x.actor} ${x.accion} ${x.entidad} ${x.entidadId} ${x.ip}`}
          filtros={[
            { clave: 'resultado', etiqueta: 'Resultado', opciones: ['Exitoso', 'Denegado', 'Error'], coincide: (x, v) => x.resultado === v },
            { clave: 'rol', etiqueta: 'Rol', opciones: ['administrador', 'guardia', 'residente', 'sistema'], coincide: (x, v) => x.rol === v },
            { clave: 'entidad', etiqueta: 'Tabla', opciones: ['visitas', 'autorizaciones_qr', 'incidencias', 'alertas_panico', 'movimientos', 'turnos', 'camaras', 'condominios'], coincide: (x, v) => x.entidad === v },
          ]}
          acciones={[{ etiqueta: 'Ver detalle', icono: Eye, onClick: (x) => setDetalle(x) }]}
          onFila={(x) => setDetalle(x)}
          filaSeleccionadaId={detalle?.id}
          vacioIcono={ScrollText}
          vacioTitulo="Sin eventos de auditoría"
          vacioDescripcion="Las acciones sensibles realizadas en el sistema quedarán registradas aquí automáticamente."
          placeholderBusqueda="Buscar por actor, acción, tabla o IP…"
          porPaginaInicial={15}
        />
      )}

      <DetailDrawer abierto={detalle !== null} onCerrar={() => setDetalle(null)} titulo={detalle?.accion ?? ''} subtitulo={detalle ? <Badge texto={detalle.resultado} /> : null}>
        {detalle ? (
          <>
            <dl className="wg-kv">
              <dt>Fecha y hora</dt><dd className="wg-mono">{detalle.fecha}</dd>
              <dt>Actor</dt><dd>{detalle.actor}</dd>
              <dt>Rol</dt><dd>{detalle.rol}</dd>
              <dt>Tabla</dt><dd className="wg-mono">{detalle.entidad}</dd>
              <dt>Registro</dt><dd className="wg-mono">{detalle.entidadId}</dd>
              <dt>Origen IP</dt><dd className="wg-mono">{detalle.ip}</dd>
            </dl>
            {detalle.resultado !== 'Exitoso' ? (
              <div className="wg-banner" style={{ marginTop: 18, marginBottom: 0 }}>
                <span>Este evento fue {detalle.resultado === 'Denegado' ? 'denegado por las políticas de acceso (RLS / permisos de rol)' : 'registrado como error del sistema'}. Revísalo si se repite.</span>
              </div>
            ) : null}
          </>
        ) : null}
      </DetailDrawer>
    </div>
  );
}