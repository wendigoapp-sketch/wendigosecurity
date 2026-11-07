'use client';
import React, { useState } from 'react';
import { CarFront, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonLista } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { Modal, ConfirmModal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Vehiculo } from '../../lib/types';

interface FormVeh { patente: string; marca: string; modelo: string; color: string; }

export function ResVehiculos({ condominioId, unidad }: { condominioId: string; unidad: string }) {
  const { demo } = useToasts();
  const v = useServicio<Vehiculo[]>(() => servicios.vehiculos(condominioId), [], [condominioId]);
  const [nuevo, setNuevo] = useState(false);
  const [quitar, setQuitar] = useState<Vehiculo | null>(null);
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormVeh>();

  const mios = v.datos.filter((x) => x.unidadCodigo === unidad && x.tipo === 'Residente');

  const guardar = handleSubmit(async () => {
    setGuardando(true);
    await new Promise((r) => setTimeout(r, 700));
    setGuardando(false);
    setNuevo(false);
    reset();
    demo('Vehículo agregado (simulado)');
  });

  if (v.error) return <ErrorState mensaje={v.error} onReintentar={v.recargar} />;

  return (
    <div>
      <button type="button" className="wg-btn is-primary is-lg is-block" style={{ marginBottom: 16 }} onClick={() => setNuevo(true)}><Plus size={16} /> Agregar vehículo</button>
      {v.cargando ? <SkeletonLista filas={2} /> : mios.length === 0 ? (
        <div className="wg-card"><EmptyState icono={CarFront} titulo="No tienes vehículos registrados" descripcion="Registra tu patente para que el guardia te reconozca al ingresar por portería vehicular." /></div>
      ) : mios.map((x) => (
        <div key={`rveh-${x.id}`} className="wg-list-card">
          <div className="wg-feed-icon"><CarFront size={18} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="wg-mono" style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.12em' }}>{x.patente}</div>
            <div className="wg-cell-sub">{x.marca} {x.modelo} · {x.color}</div>
            <div className="wg-cell-sub">Estacionamiento <span className="wg-mono">{x.estacionamiento}</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <Badge texto={x.estado} />
            <button type="button" className="wg-icon-btn is-danger" onClick={() => setQuitar(x)} aria-label={`Quitar vehículo ${x.patente}`}><Trash2 size={15} /></button>
          </div>
        </div>
      ))}

      <ConfirmModal
        abierto={quitar !== null}
        onCerrar={() => setQuitar(null)}
        onConfirmar={() => demo(`Vehículo quitado: ${quitar?.patente ?? ''}`)}
        titulo="Quitar vehículo"
        descripcion={`La patente ${quitar?.patente ?? ''} dejará de estar asociada a tu unidad y no se reconocerá al ingresar.`}
        etiquetaConfirmar="Quitar vehículo"
        peligro
      />

      <Modal
        abierto={nuevo}
        onCerrar={() => setNuevo(false)}
        titulo="Agregar vehículo"
        descripcion="Quedará asociado a tu unidad. En modo demostración no se guarda."
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setNuevo(false)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" onClick={guardar} disabled={guardando} style={{ minWidth: 130 }}>{guardando ? 'Guardando…' : 'Agregar'}</button>
          </>
        }
      >
        <form className="wg-form-grid" onSubmit={guardar}>
          <Field etiqueta="Patente" requerido completo error={errors.patente?.message} ayuda="Formato ABCD-12">
            <input className={`wg-input is-plate ${errors.patente ? 'has-err' : ''}`} {...register('patente', { required: 'Ingresa la patente', pattern: { value: /^[A-Za-z]{4}-?\d{2}$/, message: 'Patente inválida (ej: ABCD-12)' } })} />
          </Field>
          <Field etiqueta="Marca" requerido error={errors.marca?.message}>
            <input className={`wg-input ${errors.marca ? 'has-err' : ''}`} {...register('marca', { required: 'Indica la marca' })} />
          </Field>
          <Field etiqueta="Modelo" requerido error={errors.modelo?.message}>
            <input className={`wg-input ${errors.modelo ? 'has-err' : ''}`} {...register('modelo', { required: 'Indica el modelo' })} />
          </Field>
          <Field etiqueta="Color" requerido completo error={errors.color?.message}>
            <input className={`wg-input ${errors.color ? 'has-err' : ''}`} {...register('color', { required: 'Indica el color' })} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}