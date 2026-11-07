'use client';
import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, Eye, FileImage, FileText, FileVideo, UserCheck } from 'lucide-react';
import { DataTable, type Columna } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { DetailDrawer, Modal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { PageHeader } from '../ui/PageHeader';
import { SkeletonTabla } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Evidencia, Incidencia } from '../../lib/types';

function IconoEvidencia({ tipo }: { tipo: Evidencia['tipo'] }) {
  if (tipo === 'Foto') return <FileImage size={15} />;
  if (tipo === 'Video') return <FileVideo size={15} />;
  return <FileText size={15} />;
}

export function ModuloIncidencias({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const inc = useServicio<Incidencia[]>(() => servicios.incidencias(condominioId), [], [condominioId]);
  const [detalle, setDetalle] = useState<Incidencia | null>(null);
  const evi = useServicio<Evidencia[]>(() => (detalle ? servicios.evidencias(detalle.id) : Promise.resolve([])), [], [detalle?.id]);
  
  // Estados para el modal de asignar responsable
  const [asignando, setAsignando] = useState<Incidencia | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [responsable, setResponsable] = useState('');

  const columnas: Columna<Incidencia>[] = [
    { clave: 'titulo', titulo: 'Incidencia', ordenable: true, valor: (x) => x.titulo, render: (x) => (<div><div className="wg-cell-main wg-cell-trunc">{x.titulo}</div><div className="wg-cell-sub">{x.categoria}</div></div>) },
    { clave: 'severidad', titulo: 'Severidad', ordenable: true, valor: (x) => ['Baja', 'Media', 'Alta', 'Crítica'].indexOf(x.severidad), render: (x) => <Badge texto={x.severidad} /> },
    { clave: 'estado', titulo: 'Estado', render: (x) => <Badge texto={x.estado} /> },
    { clave: 'lugar', titulo: 'Lugar', render: (x) => <span className="wg-cell-trunc" style={{ display: 'block' }}>{x.lugar}</span> },
    { clave: 'reporta', titulo: 'Reportada por', render: (x) => x.reportadaPor },
    { clave: 'resp', titulo: 'Responsable', render: (x) => (x.responsable === 'Sin asignar' ? <span style={{ color: 'var(--warning)' }}>Sin asignar</span> : x.responsable) },
    { clave: 'fecha', titulo: 'Fecha', render: (x) => <span className="wg-mono">{x.fecha}</span> },
    { clave: 'evidencias', titulo: 'Evid.', alinear: 'right', ordenable: true, valor: (x) => x.evidencias, render: (x) => <span className="wg-tnum">{x.evidencias}</span> },
  ];

  const abrirAsignar = (incidencia: Incidencia) => {
    setAsignando(incidencia);
    setResponsable(incidencia.responsable === 'Sin asignar' ? '' : incidencia.responsable);
  };

  const guardarResponsable = async () => {
    if (!asignando) return;
    setGuardando(true);
    try {
      await servicios.actualizarIncidencia(asignando.id, { responsable });
      demo('Responsable asignado');
      setAsignando(null);
      window.location.reload();
    } catch (e) {
      demo('Error al asignar');
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  const marcarResuelta = async (incidencia: Incidencia) => {
    try {
      await servicios.actualizarIncidencia(incidencia.id, { estado: 'resuelta' });
      demo('Incidencia marcada como resuelta');
      setDetalle(null);
      window.location.reload();
    } catch (e) {
      demo('Error al actualizar');
      console.error(e);
    }
  };

  if (inc.error) return <ErrorState mensaje={inc.error} onReintentar={inc.recargar} />;
  const abiertas = inc.datos.filter((x) => x.estado === 'Abierta' || x.estado === 'En revisión').length;

  return (
    <div>
      <PageHeader
        titulo="Incidencias y evidencias"
        descripcion="Eventos reportados por guardias y residentes, con evidencia fotográfica, video y documentos."
        vivo={`${abiertas} incidencias abiertas o en revisión`}
      />
      {inc.cargando ? <SkeletonTabla columnas={8} /> : (
        <DataTable
          filas={inc.datos}
          columnas={columnas}
          idDe={(x) => x.id}
          textoBusqueda={(x) => `${x.titulo} ${x.categoria} ${x.lugar} ${x.reportadaPor} ${x.responsable}`}
          filtros={[
            { clave: 'estado', etiqueta: 'Estado', opciones: ['Abierta', 'En revisión', 'Resuelta', 'Cerrada'], coincide: (x, v) => x.estado === v },
            { clave: 'severidad', etiqueta: 'Severidad', opciones: ['Baja', 'Media', 'Alta', 'Crítica'], coincide: (x, v) => x.severidad === v },
          ]}
          acciones={[
            { etiqueta: 'Ver detalle', icono: Eye, onClick: (x) => setDetalle(x) },
            { etiqueta: 'Asignar responsable', icono: UserCheck, onClick: (x) => abrirAsignar(x) },
            { etiqueta: 'Marcar como resuelta', icono: CheckCircle2, onClick: (x) => marcarResuelta(x) },
          ]}
          onFila={(x) => setDetalle(x)}
          filaSeleccionadaId={detalle?.id}
          vacioIcono={AlertOctagon}
          vacioTitulo="No hay incidencias registradas"
          vacioDescripcion="Cuando un guardia o residente reporte un evento, quedará documentado aquí con su evidencia."
          placeholderBusqueda="Buscar por título, lugar o responsable…"
        />
      )}

      <DetailDrawer
        abierto={detalle !== null}
        onCerrar={() => setDetalle(null)}
        titulo={detalle?.titulo ?? ''}
        subtitulo={detalle ? <span style={{ display: 'flex', gap: 6 }}><Badge texto={detalle.severidad} /><Badge texto={detalle.estado} /></span> : null}
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => detalle && abrirAsignar(detalle)}><UserCheck size={14} /> Asignar responsable</button>
            <button type="button" className="wg-btn is-primary" onClick={() => detalle && marcarResuelta(detalle)}><CheckCircle2 size={14} /> Marcar como resuelta</button>
          </>
        }
      >
        {detalle ? (
          <>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--secondary-foreground)' }}>{detalle.descripcion}</p>
            <div className="wg-section-label">Datos del evento</div>
            <dl className="wg-kv">
              <dt>Categoría</dt><dd>{detalle.categoria}</dd>
              <dt>Lugar</dt><dd>{detalle.lugar}</dd>
              <dt>Reportada por</dt><dd>{detalle.reportadaPor}</dd>
              <dt>Fecha</dt><dd className="wg-mono">{detalle.fecha}</dd>
              <dt>Responsable</dt><dd>{detalle.responsable}</dd>
            </dl>
            <div className="wg-section-label">Evidencias ({detalle.evidencias})</div>
            {evi.cargando ? (
              <div className="wg-skel" style={{ height: 48 }} />
            ) : evi.datos.length === 0 ? (
              <p className="wg-help">Esta incidencia no tiene evidencias adjuntas todavía.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {evi.datos.map((e) => (
                  <div key={`evi-${e.id}`} className="wg-thumb">
                    <IconoEvidencia tipo={e.tipo} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="wg-cell-trunc wg-mono" style={{ display: 'block', fontWeight: 500 }}>{e.nombre}</span>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 11.5 }}>{e.tipo} · {e.tamano} · {e.subidaPor} · {e.fecha}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : null}
      </DetailDrawer>

      {/* MODAL PARA ASIGNAR RESPONSABLE */}
      <Modal
        abierto={asignando !== null}
        onCerrar={() => setAsignando(null)}
        titulo="Asignar responsable"
        descripcion={`Asigna a un guardia o administrador para que resuelva la incidencia: "${asignando?.titulo}"`}
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setAsignando(null)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" onClick={guardarResponsable} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Asignar'}
            </button>
          </>
        }
      >
        <Field etiqueta="Nombre del responsable" requerido completo>
          <input className="wg-input" value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Ej: Jorge Ramírez" />
        </Field>
      </Modal>
    </div>
  );
}