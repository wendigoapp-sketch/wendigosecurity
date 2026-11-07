'use client';
import React, { useState } from 'react';
import { CarFront, Eye, Lock, Plus, Unlock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { DataTable, type Columna } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { DetailDrawer, Modal, ConfirmModal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { PageHeader } from '../ui/PageHeader';
import { SkeletonTabla } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Vehiculo } from '../../lib/types';


interface FormVeh { patente: string; marca: string; modelo: string; color: string; unidad: string; estacionamiento: string; }

export function ModuloVehiculos({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const v = useServicio<Vehiculo[]>(() => servicios.vehiculos(condominioId), [], [condominioId]);
  const [detalle, setDetalle] = useState<Vehiculo | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [bloquear, setBloquear] = useState<Vehiculo | null>(null);
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormVeh>();

  const columnas: Columna<Vehiculo>[] = [
    { clave: 'patente', titulo: 'Patente', ordenable: true, valor: (x) => x.patente, render: (x) => <span className="wg-mono wg-cell-main" style={{ letterSpacing: '0.1em' }}>{x.patente}</span> },
    { clave: 'vehiculo', titulo: 'Vehículo', render: (x) => (<div><div className="wg-cell-main">{x.marca} {x.modelo}</div><div className="wg-cell-sub">{x.color}</div></div>) },
    { clave: 'unidad', titulo: 'Unidad', ordenable: true, valor: (x) => x.unidadCodigo, render: (x) => <span className="wg-mono">{x.unidadCodigo}</span> },
    { clave: 'propietario', titulo: 'Propietario / visita de', render: (x) => x.propietario },
    { clave: 'tipo', titulo: 'Tipo', render: (x) => <Badge texto={x.tipo} tono={x.tipo === 'Residente' ? 'info' : 'warn'} punto={false} /> },
    { clave: 'estac', titulo: 'Estacionamiento', render: (x) => <span className="wg-mono">{x.estacionamiento}</span> },
    { clave: 'estado', titulo: 'Estado', render: (x) => <Badge texto={x.estado} tono={x.estado === 'En el condominio' ? 'warn' : undefined} /> },
  ];

  const guardar = handleSubmit(async () => {
    setGuardando(true);
    await new Promise((r) => setTimeout(r, 700));
    setGuardando(false);
    setNuevo(false);
    reset();
    demo('Vehículo registrado (simulado)');
  });

  if (v.error) return <ErrorState mensaje={v.error} onReintentar={v.recargar} />;

  return (
    <div>
      <PageHeader
        titulo="Vehículos"
        descripcion="Registro de vehículos de residentes y visitas con patente, unidad y estacionamiento."
        acciones={<button type="button" className="wg-btn is-primary" onClick={() => setNuevo(true)}><Plus size={15} /> Registrar vehículo</button>}
      />
      {v.cargando ? <SkeletonTabla columnas={7} /> : (
        <DataTable
          filas={v.datos}
          columnas={columnas}
          idDe={(x) => x.id}
          textoBusqueda={(x) => `${x.patente} ${x.marca} ${x.modelo} ${x.unidadCodigo} ${x.propietario}`}
          filtros={[
            { clave: 'tipo', etiqueta: 'Tipo', opciones: ['Residente', 'Visita'], coincide: (x, val) => x.tipo === val },
            { clave: 'estado', etiqueta: 'Estado', opciones: ['Registrado', 'En el condominio', 'Bloqueado'], coincide: (x, val) => x.estado === val },
          ]}
          acciones={[
            { etiqueta: 'Ver detalle', icono: Eye, onClick: (x) => setDetalle(x) },
            { etiqueta: 'Bloquear / desbloquear', icono: Lock, onClick: (x) => setBloquear(x), peligro: true },
          ]}
          onFila={(x) => setDetalle(x)}
          filaSeleccionadaId={detalle?.id}
          vacioIcono={CarFront}
          vacioTitulo="No hay vehículos registrados"
          vacioDescripcion="Registra la patente de cada vehículo para agilizar el ingreso en portería vehicular."
          vacioAccion={<button type="button" className="wg-btn is-primary" onClick={() => setNuevo(true)}><Plus size={15} /> Registrar vehículo</button>}
          placeholderBusqueda="Buscar patente, marca, unidad o propietario…"
        />
      )}

      <DetailDrawer
        abierto={detalle !== null}
        onCerrar={() => setDetalle(null)}
        titulo={detalle?.patente ?? ''}
        subtitulo={detalle ? <Badge texto={detalle.estado} /> : null}
        pie={detalle ? (
          <button type="button" className={`wg-btn ${detalle.estado === 'Bloqueado' ? '' : 'is-danger'}`} onClick={() => setBloquear(detalle)}>
            {detalle.estado === 'Bloqueado' ? <><Unlock size={14} /> Desbloquear</> : <><Lock size={14} /> Bloquear acceso</>}
          </button>
        ) : undefined}
      >
        {detalle ? (
          <dl className="wg-kv">
            <dt>Marca / modelo</dt><dd>{detalle.marca} {detalle.modelo}</dd>
            <dt>Color</dt><dd>{detalle.color}</dd>
            <dt>Unidad</dt><dd className="wg-mono">{detalle.unidadCodigo}</dd>
            <dt>Propietario</dt><dd>{detalle.propietario}</dd>
            <dt>Tipo</dt><dd>{detalle.tipo}</dd>
            <dt>Estacionamiento</dt><dd className="wg-mono">{detalle.estacionamiento}</dd>
          </dl>
        ) : null}
      </DetailDrawer>

      <ConfirmModal
        abierto={bloquear !== null}
        onCerrar={() => setBloquear(null)}
        onConfirmar={() => demo(`Estado de acceso modificado: ${bloquear?.patente ?? ''}`)}
        titulo={bloquear?.estado === 'Bloqueado' ? 'Desbloquear vehículo' : 'Bloquear acceso del vehículo'}
        descripcion={bloquear?.estado === 'Bloqueado' ? `El vehículo ${bloquear?.patente ?? ''} podrá volver a ingresar al condominio.` : `El vehículo ${bloquear?.patente ?? ''} será rechazado en portería hasta que se desbloquee.`}
        etiquetaConfirmar={bloquear?.estado === 'Bloqueado' ? 'Desbloquear' : 'Bloquear acceso'}
        peligro={bloquear?.estado !== 'Bloqueado'}
      />

      <Modal
        abierto={nuevo}
        onCerrar={() => setNuevo(false)}
        titulo="Registrar vehículo"
        descripcion="Asocia un vehículo a una unidad del condominio. En modo demostración no se guarda."
        ancho
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setNuevo(false)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" onClick={guardar} disabled={guardando} style={{ minWidth: 150 }}>
              {guardando ? 'Guardando…' : 'Registrar vehículo'}
            </button>
          </>
        }
      >
        <form className="wg-form-grid" onSubmit={guardar}>
          <Field etiqueta="Patente" requerido error={errors.patente?.message} ayuda="Formato ABCD-12">
            <input className={`wg-input wg-mono ${errors.patente ? 'has-err' : ''}`} {...register('patente', { required: 'Ingresa la patente', pattern: { value: /^[A-Za-z]{4}-?\d{2}$/, message: 'Patente inválida (ej: ABCD-12)' } })} />
          </Field>
          <Field etiqueta="Unidad" requerido error={errors.unidad?.message}>
            <input className={`wg-input ${errors.unidad ? 'has-err' : ''}`} placeholder="Ej: A-304" {...register('unidad', { required: 'Indica la unidad' })} />
          </Field>
          <Field etiqueta="Marca" requerido error={errors.marca?.message}>
            <input className={`wg-input ${errors.marca ? 'has-err' : ''}`} {...register('marca', { required: 'Indica la marca' })} />
          </Field>
          <Field etiqueta="Modelo" requerido error={errors.modelo?.message}>
            <input className={`wg-input ${errors.modelo ? 'has-err' : ''}`} {...register('modelo', { required: 'Indica el modelo' })} />
          </Field>
          <Field etiqueta="Color" requerido error={errors.color?.message}>
            <input className={`wg-input ${errors.color ? 'has-err' : ''}`} {...register('color', { required: 'Indica el color' })} />
          </Field>
          <Field etiqueta="Estacionamiento" error={errors.estacionamiento?.message}>
            <input className="wg-input" placeholder="Ej: E-014" {...register('estacionamiento')} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}