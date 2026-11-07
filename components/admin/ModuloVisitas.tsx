'use client';
import React, { useState } from 'react';
import { Ban, CalendarClock, Eye, QrCode, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { DataTable, type Columna } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { DetailDrawer, ConfirmModal, Modal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { PageHeader } from '../ui/PageHeader';
import { SkeletonTabla } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { QRCode } from '../ui/QRCode';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Visita } from '../../lib/types';

interface FormEditarVisita {
  motivo: string;
  ventanaDesde: string;
  ventanaHasta: string;
  vehiculoPatente: string;
}

export function ModuloVisitas({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const v = useServicio<Visita[]>(() => servicios.visitas(condominioId), [], [condominioId]);
  const [detalle, setDetalle] = useState<Visita | null>(null);
  const [rechazo, setRechazo] = useState<Visita | null>(null);
  
  // Estados para editar/eliminar
  const [editando, setEditando] = useState<Visita | null>(null);
  const [eliminando, setEliminando] = useState<Visita | null>(null);
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormEditarVisita>();

  const columnas: Columna<Visita>[] = [
    { clave: 'visitante', titulo: 'Visitante', ordenable: true, valor: (x) => x.visitante, render: (x) => (<div><div className="wg-cell-main">{x.visitante}</div><div className="wg-cell-sub wg-mono">{x.rut}</div></div>) },
    { clave: 'unidad', titulo: 'Unidad', ordenable: true, valor: (x) => x.unidadCodigo, render: (x) => <span className="wg-mono">{x.unidadCodigo}</span> },
    { clave: 'residente', titulo: 'Anfitrión', render: (x) => x.residente },
    { clave: 'motivo', titulo: 'Motivo', render: (x) => x.motivo },
    { clave: 'ventana', titulo: 'Ventana horaria', render: (x) => <span className="wg-mono">{x.ventanaDesde} → {x.ventanaHasta.replace(/^(Hoy|Ayer|Mañana) /, '')}</span> },
    { clave: 'estado', titulo: 'Estado', render: (x) => <Badge texto={x.estado} /> },
  ];

  const abrirEditar = (visita: Visita) => {
    setEditando(visita);
    setValue('motivo', visita.motivo);
    setValue('ventanaDesde', visita.ventanaDesde);
    setValue('ventanaHasta', visita.ventanaHasta);
    setValue('vehiculoPatente', visita.vehiculoPatente || '');
  };

  const guardarEdicion = handleSubmit(async (data) => {
    if (!editando) return;
    setGuardando(true);
    try {
      await servicios.actualizarVisita(editando.id, data);
      demo('Visita actualizada');
      setEditando(null);
      v.recargar(); // Refrescamos la tabla sin recargar la página entera
    } catch (e) {
      demo('Error al actualizar');
      console.error(e);
    } finally {
      setGuardando(false);
    }
  });

  const confirmarEliminar = async () => {
    if (!eliminando) return;
    try {
      await servicios.eliminarVisita(eliminando.id);
      demo('Visita eliminada');
      setEliminando(null);
      v.recargar(); // Refrescamos la tabla
    } catch (e) {
      demo('Error al eliminar');
      console.error(e);
    }
  };

  if (v.error) return <ErrorState mensaje={v.error} onReintentar={v.recargar} />;

  return (
    <div>
      <PageHeader
        titulo="Visitas"
        descripcion="Todas las visitas programadas, en curso y finalizadas del condominio."
        vivo={`${v.datos.filter((x) => x.estado === 'En el condominio').length} visitas dentro del condominio ahora`}
      />
      {v.cargando ? <SkeletonTabla columnas={6} /> : (
        <DataTable
          filas={v.datos}
          columnas={columnas}
          idDe={(x) => x.id}
          textoBusqueda={(x) => `${x.visitante} ${x.rut} ${x.unidadCodigo} ${x.residente} ${x.vehiculoPatente ?? ''}`}
          filtros={[
            { clave: 'estado', etiqueta: 'Estado', opciones: ['Programada', 'Autorizada', 'En el condominio', 'Finalizada', 'Vencida', 'Rechazada', 'Cancelada'], coincide: (x, val) => x.estado === val },
          ]}
          acciones={[
            { etiqueta: 'Ver detalle', icono: Eye, onClick: (x) => setDetalle(x) },
            { etiqueta: 'Editar', icono: Pencil, onClick: (x) => abrirEditar(x) },
            { etiqueta: 'Eliminar', icono: Trash2, onClick: (x) => setEliminando(x), peligro: true },
          ]}
          onFila={(x) => setDetalle(x)}
          filaSeleccionadaId={detalle?.id}
          vacioIcono={CalendarClock}
          vacioTitulo="No hay visitas registradas"
          vacioDescripcion="Las visitas aparecerán aquí cuando se registren."
          placeholderBusqueda="Buscar visitante, RUT, unidad o patente…"
        />
      )}

      {/* Panel de detalle (Ver) */}
      <DetailDrawer
        abierto={detalle !== null}
        onCerrar={() => setDetalle(null)}
        titulo={detalle?.visitante ?? ''}
        subtitulo={detalle ? <Badge texto={detalle.estado} /> : null}
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => detalle && abrirEditar(detalle)}><Pencil size={14} /> Editar</button>
            <button type="button" className="wg-btn is-danger" onClick={() => { if (detalle) setRechazo(detalle); }}><Ban size={14} /> Rechazar</button>
          </>
        }
      >
        {detalle ? (
          <>
            <dl className="wg-kv">
              <dt>RUT visitante</dt><dd className="wg-mono">{detalle.rut}</dd>
              <dt>Unidad destino</dt><dd className="wg-mono">{detalle.unidadCodigo}</dd>
              <dt>Anfitrión</dt><dd>{detalle.residente}</dd>
              <dt>Motivo</dt><dd>{detalle.motivo}</dd>
              <dt>Desde</dt><dd className="wg-mono">{detalle.ventanaDesde}</dd>
              <dt>Hasta</dt><dd className="wg-mono">{detalle.ventanaHasta}</dd>
            </dl>
          </>
        ) : null}
      </DetailDrawer>

      {/* Modal para Editar */}
      <Modal
        abierto={editando !== null}
        onCerrar={() => setEditando(null)}
        titulo="Editar visita"
        descripcion="Modifica los datos de la visita."
        ancho
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setEditando(null)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" onClick={guardarEdicion} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </>
        }
      >
        <form className="wg-form-grid" onSubmit={guardarEdicion}>
          <Field etiqueta="Motivo" requerido error={errors.motivo?.message}>
            <input className={`wg-input ${errors.motivo ? 'has-err' : ''}`} {...register('motivo', { required: 'Ingresa el motivo' })} />
          </Field>
          <Field etiqueta="Patente (opcional)" error={errors.vehiculoPatente?.message}>
            <input className={`wg-input wg-mono ${errors.vehiculoPatente ? 'has-err' : ''}`} {...register('vehiculoPatente')} />
          </Field>
          <Field etiqueta="Desde" requerido error={errors.ventanaDesde?.message}>
            <input className={`wg-input ${errors.ventanaDesde ? 'has-err' : ''}`} {...register('ventanaDesde', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Hasta" requerido error={errors.ventanaHasta?.message}>
            <input className={`wg-input ${errors.ventanaHasta ? 'has-err' : ''}`} {...register('ventanaHasta', { required: 'Requerido' })} />
          </Field>
        </form>
      </Modal>

      {/* Modal de Confirmación para Eliminar */}
      <ConfirmModal
        abierto={eliminando !== null}
        onCerrar={() => setEliminando(null)}
        onConfirmar={confirmarEliminar}
        titulo="Eliminar visita"
        descripcion={`¿Estás seguro de eliminar la visita de ${eliminando?.visitante ?? ''}? Esta acción no se puede deshacer.`}
        etiquetaConfirmar="Eliminar"
        peligro
      />

      <ConfirmModal
        abierto={rechazo !== null}
        onCerrar={() => setRechazo(null)}
        onConfirmar={() => demo(`Visita rechazada: ${rechazo?.visitante ?? ''}`)}
        titulo="Rechazar esta visita"
        descripcion={`${rechazo?.visitante ?? ''} no podrá ingresar.`}
        etiquetaConfirmar="Rechazar visita"
        peligro
      />
    </div>
  );
}

export const IconoQR = QrCode;