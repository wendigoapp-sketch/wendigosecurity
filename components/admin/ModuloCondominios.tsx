'use client';
import React, { useState } from 'react';
import { Building2, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { DataTable, type Columna } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Modal, DetailDrawer } from '../ui/Modal';
import { Field } from '../ui/Field';
import { PageHeader } from '../ui/PageHeader';
import { useToasts } from '../ui/Toasts';
import type { Condominio } from '../../lib/types';
import { servicios } from '../../lib/services';

interface FormCondo {
  nombre: string; direccion: string; comuna: string; unidades: number; administrador: string; contratoHasta: string;
}

// AGREGAMOS onRefrescar A LAS PROPS
export function ModuloCondominios({ condominios, onRefrescar }: { condominios: Condominio[], onRefrescar: () => void }) {
  const { demo } = useToasts();
  const [detalle, setDetalle] = useState<Condominio | null>(null);
  
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Condominio | null>(null);
  const [guardando, setGuardando] = useState(false);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormCondo>();

  const columnas: Columna<Condominio>[] = [
    { clave: 'nombre', titulo: 'Condominio', ordenable: true, valor: (c) => c.nombre, render: (c) => (<div><div className="wg-cell-main">{c.nombre}</div><div className="wg-cell-sub">{c.direccion}</div></div>) },
    { clave: 'comuna', titulo: 'Comuna', ordenable: true, valor: (c) => c.comuna, render: (c) => c.comuna },
    { clave: 'unidades', titulo: 'Unidades', ordenable: true, valor: (c) => c.unidades, alinear: 'right', render: (c) => <span className="wg-tnum">{c.unidades}</span> },
    { clave: 'puestos', titulo: 'Puestos', alinear: 'right', render: (c) => <span className="wg-tnum">{c.puestos}</span> },
    { clave: 'guardias', titulo: 'Guardias activos', ordenable: true, valor: (c) => c.guardiasActivos, alinear: 'right', render: (c) => <span className="wg-tnum">{c.guardiasActivos}</span> },
    { clave: 'admin', titulo: 'Administrador', render: (c) => c.administrador },
    { clave: 'contrato', titulo: 'Contrato hasta', render: (c) => <span className="wg-mono">{c.contratoHasta}</span> },
    { clave: 'estado', titulo: 'Estado', render: (c) => <Badge texto={c.estado === 'Implementacion' ? 'En implementación' : c.estado} tono={c.estado === 'Activo' ? 'ok' : c.estado === 'Suspendido' ? 'bad' : 'info'} /> },
  ];

  const abrirNuevo = () => {
    setEditando(null);
    reset({ nombre: '', direccion: '', comuna: '', unidades: 1, administrador: '', contratoHasta: '' });
    setModalAbierto(true);
  };

  const abrirEditar = (condo: Condominio) => {
    setEditando(condo);
    setValue('nombre', condo.nombre);
    setValue('direccion', condo.direccion);
    setValue('comuna', condo.comuna === '-' ? '' : condo.comuna);
    setValue('unidades', condo.unidades);
    setValue('administrador', condo.administrador === 'Sin asignar' ? '' : condo.administrador);
    setValue('contratoHasta', condo.contratoHasta === '-' ? '' : condo.contratoHasta);
    setModalAbierto(true);
  };

  const borrarCondominio = async (condo: Condominio) => {
    if (window.confirm(`¿Estás seguro de eliminar "${condo.nombre}"? Se borrarán también sus unidades y residentes.`)) {
      try {
        await servicios.eliminarCondominio(condo.id);
        demo('Condominio eliminado de Supabase');
        onRefrescar(); // <-- REFRESCA LA TABLA AL INSTANTE
      } catch (e) {
        demo('Error al eliminar el condominio');
        console.error(e);
      }
    }
  };

  const guardar = handleSubmit(async (data) => {
    setGuardando(true);
    try {
      if (editando) {
        await servicios.actualizarCondominio(editando.id, data);
        demo('¡Condominio actualizado!');
      } else {
        await servicios.crearCondominio(data);
        demo('¡Condominio y unidades creadas!');
      }
      setModalAbierto(false);
      reset();
      onRefrescar(); // <-- REFRESCA LA TABLA AL INSTANTE
    } catch (e) {
      demo('Error al guardar los datos');
      console.error(e);
    } finally {
      setGuardando(false);
    }
  });

  return (
    <div>
      <PageHeader
        titulo="Condominios"
        descripcion="Contratos de seguridad activos y en implementación. Cada condominio opera aislado por políticas RLS."
        acciones={<button type="button" className="wg-btn is-primary" onClick={abrirNuevo}><Plus size={15} /> Nuevo condominio</button>}
      />
      <DataTable
        filas={condominios}
        columnas={columnas}
        idDe={(c) => c.id}
        textoBusqueda={(c) => `${c.nombre} ${c.comuna} ${c.administrador} ${c.direccion}`}
        filtros={[{ clave: 'estado', etiqueta: 'Estado', opciones: ['Activo', 'Implementacion', 'Suspendido'], coincide: (c, v) => c.estado === v }]}
        acciones={[
          { etiqueta: 'Ver detalle', icono: Eye, onClick: (c) => setDetalle(c) },
          { etiqueta: 'Editar', icono: Pencil, onClick: (c) => abrirEditar(c) },
          { etiqueta: 'Eliminar', icono: Trash2, onClick: (c) => borrarCondominio(c), peligro: true },
        ]}
        onFila={(c) => setDetalle(c)}
        filaSeleccionadaId={detalle?.id}
        vacioIcono={Building2}
        vacioTitulo="No hay condominios que coincidan"
        vacioDescripcion="Ajusta la búsqueda o crea un nuevo condominio."
        placeholderBusqueda="Buscar por nombre, comuna o administrador…"
      />

      <DetailDrawer
        abierto={detalle !== null}
        onCerrar={() => setDetalle(null)}
        titulo={detalle?.nombre ?? ''}
        subtitulo={detalle ? <Badge texto={detalle.estado} /> : null}
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => detalle && abrirEditar(detalle)}><Pencil size={14} /> Editar</button>
            <button type="button" className="wg-btn is-danger" onClick={() => detalle && borrarCondominio(detalle)}><Trash2 size={14} /> Eliminar</button>
          </>
        }
      >
        {detalle ? (
          <>
            <dl className="wg-kv">
              <dt>Dirección</dt><dd>{detalle.direccion}, {detalle.comuna}</dd>
              <dt>Administrador</dt><dd>{detalle.administrador}</dd>
              <dt>Unidades</dt><dd className="wg-tnum">{detalle.unidades}</dd>
              <dt>Contrato hasta</dt><dd className="wg-mono">{detalle.contratoHasta}</dd>
              <dt>Identificador</dt><dd className="wg-mono">{detalle.id}</dd>
            </dl>
          </>
        ) : null}
      </DetailDrawer>

      <Modal
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        titulo={editando ? "Editar condominio" : "Nuevo condominio"}
        descripcion={editando ? "Modifica los datos del condominio." : "Registra un nuevo condominio y crea sus unidades."}
        ancho
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setModalAbierto(false)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" onClick={guardar} disabled={guardando} style={{ minWidth: 150 }}>
              {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear condominio'}
            </button>
          </>
        }
      >
        <form className="wg-form-grid" onSubmit={guardar}>
          <Field etiqueta="Nombre del condominio" requerido completo error={errors.nombre?.message}>
            <input className={`wg-input ${errors.nombre ? 'has-err' : ''}`} {...register('nombre', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Dirección" requerido error={errors.direccion?.message}>
            <input className={`wg-input ${errors.direccion ? 'has-err' : ''}`} {...register('direccion', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Comuna" requerido error={errors.comuna?.message}>
            <input className={`wg-input ${errors.comuna ? 'has-err' : ''}`} {...register('comuna', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Cantidad de unidades" requerido error={errors.unidades?.message}>
            <input type="number" className={`wg-input ${errors.unidades ? 'has-err' : ''}`} {...register('unidades', { required: 'Requerido', valueAsNumber: true })} />
          </Field>
          <Field etiqueta="Administrador" requerido error={errors.administrador?.message}>
            <input className={`wg-input ${errors.administrador ? 'has-err' : ''}`} {...register('administrador', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Contrato hasta" requerido completo error={errors.contratoHasta?.message}>
            <input type="date" className={`wg-input ${errors.contratoHasta ? 'has-err' : ''}`} {...register('contratoHasta', { required: 'Requerido' })} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}