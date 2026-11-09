'use client';
import React, { useState } from 'react';
import { Eye, Mail, Pencil, Plus, UserX, Users, Home, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { DataTable, type Columna } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Modal, DetailDrawer, ConfirmModal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { PageHeader } from '../ui/PageHeader';
import { SkeletonTabla } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { ResidenteUnidad, Unidad } from '../../lib/types';

interface FormRes { nombre: string; rut: string; email: string; telefono: string; unidadId: string; relacion: string; }
interface FormUni { identificador: string; tipo: string; }

export function ModuloResidentes({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const res = useServicio<ResidenteUnidad[]>(() => servicios.residentes(condominioId), [], [condominioId]);
  const uni = useServicio<Unidad[]>(() => servicios.unidades(condominioId), [], [condominioId]);
  const [vista, setVista] = useState<'residentes' | 'unidades'>('residentes');
  
  const [detalle, setDetalle] = useState<ResidenteUnidad | null>(null);
  const [nuevoRes, setNuevoRes] = useState(false);
  const [bajaRes, setBajaRes] = useState<ResidenteUnidad | null>(null);
  
  const [nuevaUni, setNuevaUni] = useState(false);
  const [bajaUni, setBajaUni] = useState<Unidad | null>(null);
  
  const [guardando, setGuardando] = useState(false);
  
  const formRes = useForm<FormRes>();
  const formUni = useForm<FormUni>();

  const columnasRes: Columna<ResidenteUnidad>[] = [
    { clave: 'nombre', titulo: 'Residente', ordenable: true, valor: (r) => r.nombre, render: (r) => (<div><div className="wg-cell-main">{r.nombre}</div><div className="wg-cell-sub wg-mono">{r.rut}</div></div>) },
    { clave: 'unidad', titulo: 'Unidad', ordenable: true, valor: (r) => r.unidadCodigo, render: (r) => <span className="wg-mono">{r.unidadCodigo}</span> },
    { clave: 'relacion', titulo: 'Relación', render: (r) => r.relacion },
    { clave: 'telefono', titulo: 'Teléfono', render: (r) => <span className="wg-mono">{r.telefono}</span> },
    { clave: 'estado', titulo: 'Estado', render: (r) => <Badge texto={r.estado} /> },
  ];

  const columnasUni: Columna<Unidad>[] = [
    { clave: 'codigo', titulo: 'Unidad', ordenable: true, valor: (u) => u.codigo, render: (u) => <span className="wg-cell-main wg-mono">{u.codigo}</span> },
    { clave: 'torre', titulo: 'Torre / sector', ordenable: true, valor: (u) => u.torre, render: (u) => u.torre },
    { clave: 'piso', titulo: 'Piso', ordenable: true, valor: (u) => u.piso, alinear: 'right', render: (u) => <span className="wg-tnum">{u.piso}</span> },
    { clave: 'tipo', titulo: 'Tipo', render: (u) => u.tipo },
    { clave: 'residentes', titulo: 'Residentes', alinear: 'right', render: (u) => <span className="wg-tnum">{res.datos.filter((r) => r.unidadId === u.id).length}</span> },
    { clave: 'estado', titulo: 'Estado', render: (u) => <Badge texto={u.estado} /> },
  ];

 // FUNCIÓN REAL PARA GUARDAR RESIDENTE
const guardarRes = formRes.handleSubmit(async (data) => {
  setGuardando(true);
  try {
    await servicios.crearResidente({
      condominioId,
      unidadId: data.unidadId,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      relacion: data.relacion,
      rut: data.rut
    });
    setNuevoRes(false);
    formRes.reset();
    demo('¡Residente registrado en Supabase!');
    window.location.reload();
  } catch (e: unknown) {
    demo('Error al registrar residente');
    console.error(e);
  } finally {
    setGuardando(false);
  }
});

  const guardarUni = formUni.handleSubmit(async (data) => {
    setGuardando(true);
    try {
      await servicios.crearUnidad(condominioId, data.identificador, data.tipo);
      setNuevaUni(false);
      formUni.reset();
      demo('¡Unidad creada!');
      window.location.reload();
    } catch (e) {
      demo('Error al crear unidad');
      console.error(e);
    } finally {
      setGuardando(false);
    }
  });

  const confirmarBajaRes = async () => {
    if (!bajaRes) return;
    try {
      await servicios.eliminarResidente(bajaRes.id);
      demo('Residente dado de baja');
      setBajaRes(null);
      window.location.reload();
    } catch (e) { demo('Error'); }
  };

  const confirmarBajaUni = async () => {
    if (!bajaUni) return;
    try {
      await servicios.eliminarUnidad(bajaUni.id);
      demo('Unidad eliminada');
      setBajaUni(null);
      window.location.reload();
    } catch (e) { demo('Error'); }
  };

  if (res.error) return <ErrorState mensaje={res.error} onReintentar={res.recargar} />;

  return (
    <div>
      <PageHeader
        titulo="Residentes y unidades"
        descripcion="Personas vinculadas a cada unidad y catálogo de unidades."
        acciones={
          vista === 'residentes' 
            ? <button type="button" className="wg-btn is-primary" onClick={() => setNuevoRes(true)}><Plus size={15} /> Registrar residente</button>
            : <button type="button" className="wg-btn is-primary" onClick={() => setNuevaUni(true)}><Plus size={15} /> Nueva unidad</button>
        }
      />
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button type="button" className={`wg-chip ${vista === 'residentes' ? 'is-on' : ''}`} onClick={() => setVista('residentes')}>Residentes ({res.datos.length})</button>
        <button type="button" className={`wg-chip ${vista === 'unidades' ? 'is-on' : ''}`} onClick={() => setVista('unidades')}>Unidades ({uni.datos.length})</button>
      </div>

      {res.cargando || uni.cargando ? <SkeletonTabla columnas={6} /> : vista === 'residentes' ? (
        <DataTable
          filas={res.datos}
          columnas={columnasRes}
          idDe={(r) => r.id}
          textoBusqueda={(r) => `${r.nombre} ${r.rut} ${r.unidadCodigo}`}
          acciones={[
            { etiqueta: 'Ver ficha', icono: Eye, onClick: (r) => setDetalle(r) },
            { etiqueta: 'Dar de baja', icono: UserX, onClick: (r) => setBajaRes(r), peligro: true },
          ]}
          onFila={(r) => setDetalle(r)}
          vacioIcono={Users}
          vacioTitulo="No hay residentes registrados"
          vacioDescripcion="Registra a los residentes de cada unidad."
          placeholderBusqueda="Buscar por nombre, RUT o unidad…"
        />
      ) : (
        <DataTable
          filas={uni.datos}
          columnas={columnasUni}
          idDe={(u) => u.id}
          textoBusqueda={(u) => `${u.codigo} ${u.torre}`}
          acciones={[
            { etiqueta: 'Eliminar unidad', icono: Trash2, onClick: (u) => setBajaUni(u), peligro: true },
          ]}
          vacioIcono={Home}
          vacioTitulo="No hay unidades cargadas"
          vacioDescripcion="Crea la primera unidad para poder asignarle residentes."
          vacioAccion={<button type="button" className="wg-btn is-primary" onClick={() => setNuevaUni(true)}><Plus size={15} /> Nueva unidad</button>}
          placeholderBusqueda="Buscar unidad o torre…"
        />
      )}

      {/* MODALES RESIDENTE */}
      <Modal
        abierto={nuevoRes}
        onCerrar={() => setNuevoRes(false)}
        titulo="Registrar residente"
        descripcion="Crea el usuario y lo vincula a la unidad. Contraseña: Wendigo123!"
        ancho
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setNuevoRes(false)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" onClick={guardarRes} disabled={guardando}>Registrar</button>
          </>
        }
      >
        <form className="wg-form-grid" onSubmit={guardarRes}>
          <Field etiqueta="Nombre completo" requerido completo error={formRes.formState.errors.nombre?.message}>
            <input className="wg-input" {...formRes.register('nombre', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="RUT" requerido error={formRes.formState.errors.rut?.message}>
            <input className="wg-input wg-mono" {...formRes.register('rut', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Teléfono" requerido error={formRes.formState.errors.telefono?.message}>
            <input className="wg-input" {...formRes.register('telefono', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Correo" requerido completo error={formRes.formState.errors.email?.message}>
            <input type="email" className="wg-input" {...formRes.register('email', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Unidad" requerido error={formRes.formState.errors.unidadId?.message}>
            <select className="wg-input" defaultValue="" {...formRes.register('unidadId', { required: 'Requerido' })}>
              <option value="" disabled>Selecciona…</option>
              {uni.datos.map((u) => <option key={u.id} value={u.id}>{u.codigo}</option>)}
            </select>
          </Field>
          <Field etiqueta="Relación" requerido error={formRes.formState.errors.relacion?.message}>
            <select className="wg-input" defaultValue="" {...formRes.register('relacion', { required: 'Requerido' })}>
              <option value="" disabled>Selecciona…</option>
              <option value="Propietario">Propietario</option>
              <option value="Arrendatario">Arrendatario</option>
              <option value="Familiar">Familiar</option>
            </select>
          </Field>
        </form>
      </Modal>

      {/* MODALES UNIDAD */}
      <Modal
        abierto={nuevaUni}
        onCerrar={() => setNuevaUni(false)}
        titulo="Crear unidad"
        descripcion="Agrega un nuevo departamento o casa a este condominio."
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setNuevaUni(false)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" onClick={guardarUni} disabled={guardando}>Guardar</button>
          </>
        }
      >
        <form className="wg-form-grid" onSubmit={guardarUni}>
          <Field etiqueta="Identificador (Ej: A-101)" requerido completo error={formUni.formState.errors.identificador?.message}>
            <input className="wg-input wg-mono" {...formUni.register('identificador', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Tipo" requerido completo error={formUni.formState.errors.tipo?.message}>
            <select className="wg-input" defaultValue="departamento" {...formUni.register('tipo', { required: 'Requerido' })}>
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="local">Local</option>
            </select>
          </Field>
        </form>
      </Modal>

      <ConfirmModal
        abierto={bajaRes !== null}
        onCerrar={() => setBajaRes(null)}
        onConfirmar={confirmarBajaRes}
        titulo="Dar de baja residente"
        descripcion={`¿Eliminar a ${bajaRes?.nombre}?`}
        etiquetaConfirmar="Eliminar"
        peligro
      />

      <ConfirmModal
        abierto={bajaUni !== null}
        onCerrar={() => setBajaUni(null)}
        onConfirmar={confirmarBajaUni}
        titulo="Eliminar unidad"
        descripcion={`¿Eliminar la unidad ${bajaUni?.codigo}?`}
        etiquetaConfirmar="Eliminar"
        peligro
      />
    </div>
  );
}