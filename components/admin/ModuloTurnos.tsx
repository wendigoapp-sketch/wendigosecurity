'use client';
import React, { useState } from 'react';
import { CalendarDays, Plus, MapPin, Pencil, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { DataTable, type Columna } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Modal, ConfirmModal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { PageHeader } from '../ui/PageHeader';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Turno, Puesto, Guardia } from '../../lib/types';

interface FormPuesto { nombre: string; tipo: string; }
interface FormTurno { guardiaId: string; puestoId: string; inicio: string; fin: string; tipo: string; }

export function ModuloTurnos({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const turnos = useServicio<Turno[]>(() => servicios.turnos(condominioId), [], [condominioId]);
  const puestos = useServicio<Puesto[]>(() => servicios.puestos(condominioId), [], [condominioId]);
  const guardias = useServicio<Guardia[]>(() => servicios.guardias(condominioId), [], [condominioId]);
  
  const [vista, setVista] = useState<'turnos' | 'puestos'>('turnos');
  
  const [nuevoPuesto, setNuevoPuesto] = useState(false);
  const [editandoPuesto, setEditandoPuesto] = useState<Puesto | null>(null);
  const [borrandoPuesto, setBorrandoPuesto] = useState<Puesto | null>(null);
  
  const [nuevoTurno, setNuevoTurno] = useState(false);
  const [editandoTurno, setEditandoTurno] = useState<Turno | null>(null);
  const [borrandoTurno, setBorrandoTurno] = useState<Turno | null>(null);
  
  const [guardando, setGuardando] = useState(false);

  const formP = useForm<FormPuesto>();
  const formT = useForm<FormTurno>();

  const columnasPuestos: Columna<Puesto>[] = [
    { clave: 'nombre', titulo: 'Puesto', render: (p) => <span className="wg-cell-main">{p.nombre}</span> },
    { clave: 'tipo', titulo: 'Tipo', render: (p) => p.tipo },
  ];

  const columnasTurnos: Columna<Turno>[] = [
    { clave: 'guardia', titulo: 'Guardia', render: (t) => <span className="wg-mono">{guardias.datos.find(g => g.id === t.guardia)?.nombre || 'Desconocido'}</span> },
    { clave: 'puesto', titulo: 'Puesto', render: (t) => puestos.datos.find(p => p.id === t.puesto)?.nombre || 'N/A' },
    { clave: 'tipo', titulo: 'Turno', render: (t) => <Badge texto={t.tipo} tono="info" punto={false} /> },
    { clave: 'horario', titulo: 'Fecha/Hora', render: (t) => <span className="wg-mono">{t.horario}</span> },
  ];

  const abrirEditarPuesto = (puesto: Puesto) => {
    setEditandoPuesto(puesto);
    formP.setValue('nombre', puesto.nombre);
    formP.setValue('tipo', puesto.tipo);
    setNuevoPuesto(true);
  };

  const abrirEditarTurno = (turno: Turno) => {
    setEditandoTurno(turno);
    formT.setValue('guardiaId', turno.guardia);
    formT.setValue('puestoId', turno.puesto);
    formT.setValue('tipo', turno.tipo);
    setNuevoTurno(true); 
  };

  const guardarPuesto = formP.handleSubmit(async (data) => {
    setGuardando(true);
    try {
      if (editandoPuesto) {
        await servicios.actualizarPuesto(editandoPuesto.id, data.nombre, data.tipo);
        demo('¡Puesto actualizado!');
      } else {
        await servicios.crearPuesto(condominioId, data.nombre, data.tipo);
        demo('¡Puesto creado!');
      }
      setNuevoPuesto(false);
      setEditandoPuesto(null);
      formP.reset();
      window.location.reload();
    } catch (e) { console.error(e); } finally { setGuardando(false); }
  });

  const confirmarBorrarPuesto = async () => {
    if (!borrandoPuesto) return;
    try {
      await servicios.eliminarPuesto(borrandoPuesto.id);
      demo('Puesto eliminado');
      setBorrandoPuesto(null);
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  const guardarTurno = formT.handleSubmit(async (data) => {
    setGuardando(true);
    try {
      if (editandoTurno) {
        await servicios.actualizarTurno(editandoTurno.id, {
          guardiaId: data.guardiaId,
          puestoId: data.puestoId,
          inicio: data.inicio,
          fin: data.fin,
          tipo: data.tipo
        });
        demo('¡Turno actualizado!');
      } else {
        await servicios.crearTurno({
          condominioId,
          guardiaId: data.guardiaId,
          puestoId: data.puestoId,
          inicio: data.inicio,
          fin: data.fin,
          tipo: data.tipo
        });
        demo('¡Turno asignado!');
      }
      setNuevoTurno(false);
      setEditandoTurno(null);
      formT.reset();
      window.location.reload();
    } catch (e) { console.error(e); } finally { setGuardando(false); }
  });

  const confirmarBorrarTurno = async () => {
    if (!borrandoTurno) return;
    try {
      await servicios.eliminarTurno(borrandoTurno.id);
      demo('Turno eliminado');
      setBorrandoTurno(null);
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <PageHeader
        titulo="Puestos y turnos"
        descripcion="Configura los puestos de vigilancia y asigna los turnos a tu personal."
        acciones={
          vista === 'turnos'
            ? <button type="button" className="wg-btn is-primary" onClick={() => { setEditandoTurno(null); formT.reset(); setNuevoTurno(true); }}><Plus size={15} /> Asignar turno</button>
            : <button type="button" className="wg-btn is-primary" onClick={() => { setEditandoPuesto(null); formP.reset(); setNuevoPuesto(true); }}><Plus size={15} /> Nuevo puesto</button>
        }
      />
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button type="button" className={`wg-chip ${vista === 'turnos' ? 'is-on' : ''}`} onClick={() => setVista('turnos')}>Turnos ({turnos.datos.length})</button>
        <button type="button" className={`wg-chip ${vista === 'puestos' ? 'is-on' : ''}`} onClick={() => setVista('puestos')}>Puestos ({puestos.datos.length})</button>
      </div>

      {vista === 'turnos' ? (
        <DataTable 
          filas={turnos.datos} 
          columnas={columnasTurnos} 
          idDe={(t) => t.id} 
          textoBusqueda={(t) => t.horario} 
          acciones={[
            { etiqueta: 'Editar turno', icono: Pencil, onClick: (t) => abrirEditarTurno(t) },
            { etiqueta: 'Eliminar turno', icono: Trash2, onClick: (t) => setBorrandoTurno(t), peligro: true },
          ]}
          vacioIcono={CalendarDays} 
          vacioTitulo="No hay turnos asignados" 
          vacioDescripcion="Asigna el primer turno." 
        />
      ) : (
        <DataTable 
          filas={puestos.datos} 
          columnas={columnasPuestos} 
          idDe={(p) => p.id} 
          textoBusqueda={(p) => p.nombre} 
          acciones={[
            { etiqueta: 'Editar puesto', icono: Pencil, onClick: (p) => abrirEditarPuesto(p) },
            { etiqueta: 'Eliminar puesto', icono: Trash2, onClick: (p) => setBorrandoPuesto(p), peligro: true },
          ]}
          vacioIcono={MapPin} 
          vacioTitulo="No hay puestos creados" 
          vacioDescripcion="Crea un puesto." 
        />
      )}

      {/* MODAL PUESTO (CREAR Y EDITAR) */}
      <Modal abierto={nuevoPuesto} onCerrar={() => { setNuevoPuesto(false); setEditandoPuesto(null); }} titulo={editandoPuesto ? "Editar puesto" : "Nuevo puesto"} pie={
        <>
          <button type="button" className="wg-btn" onClick={() => { setNuevoPuesto(false); setEditandoPuesto(null); }}>Cancelar</button>
          <button type="button" className="wg-btn is-primary" onClick={guardarPuesto} disabled={guardando}>{editandoPuesto ? 'Guardar cambios' : 'Guardar'}</button>
        </>
      }>
        <form className="wg-form-grid" onSubmit={guardarPuesto}>
          <Field etiqueta="Nombre del puesto" requerido completo error={formP.formState.errors.nombre?.message}>
            <input className="wg-input" {...formP.register('nombre', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Tipo de puesto" requerido completo error={formP.formState.errors.tipo?.message}>
            <select className="wg-input" defaultValue="Portería" {...formP.register('tipo', { required: 'Requerido' })}>
              <option value="Portería">Portería</option>
              <option value="Ronda">Ronda</option>
              <option value="Control central">Control central</option>
              <option value="Estacionamiento">Estacionamiento</option>
            </select>
          </Field>
        </form>
      </Modal>

      {/* MODAL TURNO (CREAR Y EDITAR) */}
      <Modal abierto={nuevoTurno} onCerrar={() => { setNuevoTurno(false); setEditandoTurno(null); }} titulo={editandoTurno ? "Editar turno" : "Asignar turno"} ancho pie={
        <>
          <button type="button" className="wg-btn" onClick={() => { setNuevoTurno(false); setEditandoTurno(null); }}>Cancelar</button>
          <button type="button" className="wg-btn is-primary" onClick={guardarTurno} disabled={guardando}>{editandoTurno ? 'Guardar cambios' : 'Guardar'}</button>
        </>
      }>
        <form className="wg-form-grid" onSubmit={guardarTurno}>
          <Field etiqueta="Guardia" requerido completo error={formT.formState.errors.guardiaId?.message}>
            <select className="wg-input" defaultValue="" {...formT.register('guardiaId', { required: 'Requerido' })}>
              <option value="" disabled>Selecciona guardia…</option>
              {guardias.datos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          </Field>
          <Field etiqueta="Puesto" requerido completo error={formT.formState.errors.puestoId?.message}>
            <select className="wg-input" defaultValue="" {...formT.register('puestoId', { required: 'Requerido' })}>
              <option value="" disabled>Selecciona puesto…</option>
              {puestos.datos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </Field>
          
          <Field etiqueta="Tipo de turno" requerido error={formT.formState.errors.tipo?.message}>
            <select className="wg-input" defaultValue="" {...formT.register('tipo', { required: 'Requerido' })}>
              <option value="" disabled>Selecciona…</option>
              <option value="Diurno">Diurno</option>
              <option value="Nocturno">Nocturno</option>
            </select>
          </Field>
          
          <Field etiqueta="Inicio del turno" requerido error={formT.formState.errors.inicio?.message}>
            <input type="datetime-local" className="wg-input" {...formT.register('inicio', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Fin del turno" requerido error={formT.formState.errors.fin?.message}>
            <input type="datetime-local" className="wg-input" {...formT.register('fin', { required: 'Requerido' })} />
          </Field>
        </form>
      </Modal>

      <ConfirmModal
        abierto={borrandoPuesto !== null}
        onCerrar={() => setBorrandoPuesto(null)}
        onConfirmar={confirmarBorrarPuesto}
        titulo="Eliminar puesto"
        descripcion={`¿Estás seguro de que quieres eliminar el puesto "${borrandoPuesto?.nombre}"?`}
        etiquetaConfirmar="Eliminar"
        peligro
      />

      <ConfirmModal
        abierto={borrandoTurno !== null}
        onCerrar={() => setBorrandoTurno(null)}
        onConfirmar={confirmarBorrarTurno}
        titulo="Eliminar turno"
        descripcion="¿Estás seguro de que quieres eliminar este turno?"
        etiquetaConfirmar="Eliminar"
        peligro
      />
    </div>
  );
}