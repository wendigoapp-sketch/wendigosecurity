'use client';
import React, { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { DataTable, type Columna } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { Modal, ConfirmModal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { PageHeader } from '../ui/PageHeader';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { LugarCondominio } from '../../lib/types';
import { ErrorState } from '../ui/ErrorState'; // <-- Agregá esta línea

interface FormLugar {
  nombre: string;
  tipo: string;
  descripcion: string;
  horario: string;
  reglas: string;
}

export function ModuloLugares({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const lugares = useServicio<LugarCondominio[]>(() => servicios.lugares(condominioId), [], [condominioId]);
  
  const [nuevo, setNuevo] = useState(false);
  const [borrando, setBorrando] = useState<LugarCondominio | null>(null);
  const [guardando, setGuardando] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormLugar>();

  // Usamos 'any' en los renders para acceder a los campos que agregamos en services
  const columnas: Columna<LugarCondominio>[] = [
    { clave: 'nombre', titulo: 'Lugar', ordenable: true, render: (l: any) => <span className="wg-cell-main">{l.nombre}</span> },
    { clave: 'tipo', titulo: 'Tipo', ordenable: true, render: (l: any) => <Badge texto={l.tipo} tono="info" punto={false} /> },
    { clave: 'descripcion', titulo: 'Descripción', render: (l: any) => l.descripcion || '-' },
    { clave: 'horario', titulo: 'Horario', render: (l: any) => <span className="wg-mono">{l.horario || 'Sin horario'}</span> },
  ];

  const guardar = handleSubmit(async (data) => {
    setGuardando(true);
    try {
      await servicios.crearLugar(condominioId, data);
      setNuevo(false);
      reset();
      demo('¡Lugar creado en Supabase!');
      window.location.reload();
    } catch (e) {
      demo('Error al crear lugar');
      console.error(e);
    } finally {
      setGuardando(false);
    }
  });

  const confirmarBorrar = async () => {
    if (!borrando) return;
    try {
      await servicios.eliminarLugar(borrando.id);
      demo('Lugar eliminado');
      setBorrando(null);
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  if (lugares.error) return <ErrorState mensaje={lugares.error} onReintentar={lugares.recargar} />;

  return (
    <div>
      <PageHeader
        titulo="Lugares del condominio"
        descripcion="Define los accesos, áreas comunes y zonas del condominio."
        acciones={<button type="button" className="wg-btn is-primary" onClick={() => setNuevo(true)}><Plus size={15} /> Agregar lugar</button>}
      />
      
      <DataTable
        filas={lugares.datos}
        columnas={columnas}
        idDe={(l) => l.id}
        textoBusqueda={(l) => `${l.nombre} ${l.tipo}`}
        acciones={[
          { etiqueta: 'Eliminar lugar', icono: Trash2, onClick: (l) => setBorrando(l), peligro: true },
        ]}
        vacioIcono={MapPin}
        vacioTitulo="No hay lugares registrados"
        vacioDescripcion="Agrega el primer lugar, como la piscina o el quincho."
        vacioAccion={<button type="button" className="wg-btn is-primary" onClick={() => setNuevo(true)}><Plus size={15} /> Agregar lugar</button>}
        placeholderBusqueda="Buscar lugar…"
      />

      <Modal
        abierto={nuevo}
        onCerrar={() => setNuevo(false)}
        titulo="Agregar lugar"
        descripcion="Define un acceso, área común o zona del condominio."
        ancho
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setNuevo(false)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Agregar lugar'}
            </button>
          </>
        }
      >
        <form className="wg-form-grid" onSubmit={guardar}>
          <Field etiqueta="Nombre del lugar" requerido completo error={errors.nombre?.message}>
            <input className={`wg-input ${errors.nombre ? 'has-err' : ''}`} placeholder="Ej: Quincho, Piscina, Portón Norte" {...register('nombre', { required: 'Requerido' })} />
          </Field>
          
                   <Field etiqueta="Tipo" requerido error={errors.tipo?.message}>
            <select className={`wg-input ${errors.tipo ? 'has-err' : ''}`} defaultValue="" {...register('tipo', { required: 'Requerido' })}>
              <option value="" disabled>Selecciona…</option>
              <option value="entrada">Entrada</option>
              <option value="garita">Garita</option>
              <option value="estacionamiento">Estacionamiento</option>
              <option value="sum">SUM (Salón de usos múltiples)</option>
              <option value="piscina">Piscina</option>
              <option value="gimnasio">Gimnasio</option>
              <option value="parrilla">Parrilla / Quincho</option>
              <option value="jardin">Jardín</option>
              <option value="sector_comun">Sector común</option>
              <option value="otro">Otro</option>
            </select>
          </Field>
          
          <Field etiqueta="Horario" error={errors.horario?.message} ayuda="Ej: 08:00 a 22:00">
            <input className={`wg-input wg-mono ${errors.horario ? 'has-err' : ''}`} placeholder="08:00 a 22:00" {...register('horario')} />
          </Field>

          <Field etiqueta="Descripción" completo error={errors.descripcion?.message}>
            <input className={`wg-input ${errors.descripcion ? 'has-err' : ''}`} placeholder="Breve descripción del lugar" {...register('descripcion')} />
          </Field>

          <Field etiqueta="Reglas de uso" completo error={errors.reglas?.message}>
            <textarea className={`wg-input ${errors.reglas ? 'has-err' : ''}`} rows={3} placeholder="Ej: No se permite vidrio, máximo 10 personas..." {...register('reglas')} />
          </Field>
        </form>
      </Modal>

      <ConfirmModal
        abierto={borrando !== null}
        onCerrar={() => setBorrando(null)}
        onConfirmar={confirmarBorrar}
        titulo="Eliminar lugar"
        descripcion={`¿Estás seguro de que quieres eliminar "${borrando?.nombre}"?`}
        etiquetaConfirmar="Eliminar"
        peligro
      />
    </div>
  );
}