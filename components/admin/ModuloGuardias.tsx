'use client';
import React, { useState } from 'react';
import { Eye, Pencil, Plus, ShieldCheck, UserMinus } from 'lucide-react';
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
import type { Guardia } from '../../lib/types';

interface FormGuardia { 
  nombre: string; 
  email: string; 
  telefono: string; 
  codigoInterno: string; 
}

export function ModuloGuardias({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const g = useServicio<Guardia[]>(() => servicios.guardias(condominioId), [], [condominioId]);
  const p = useServicio(() => servicios.puestos(condominioId), [], [condominioId]);
  const [detalle, setDetalle] = useState<Guardia | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [baja, setBaja] = useState<Guardia | null>(null);
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormGuardia>();

  const columnas: Columna<Guardia>[] = [
    { clave: 'nombre', titulo: 'Guardia', ordenable: true, valor: (x) => x.nombre, render: (x) => (<div><div className="wg-cell-main">{x.nombre}</div><div className="wg-cell-sub wg-mono">{x.telefono}</div></div>) },
    { clave: 'puesto', titulo: 'Puesto asignado', ordenable: true, valor: (x) => x.puesto, render: (x) => x.puesto },
    { clave: 'turno', titulo: 'Turno', render: (x) => <Badge texto={x.turnoActual} tono="info" punto={false} /> },
    { clave: 'estado', titulo: 'Estado', render: (x) => <Badge texto={x.estado} /> },
    { clave: 'actividad', titulo: 'Última actividad', render: (x) => <span className="wg-mono">{x.ultimaActividad}</span> },
    { clave: 'credencial', titulo: 'Credencial OS-10 vence', ordenable: true, valor: (x) => x.credencialVence.split('/').reverse().join('-'), render: (x) => <span className="wg-mono">{x.credencialVence}</span> },
  ];

 const guardar = handleSubmit(async (data) => {
  setGuardando(true);
  try {
    await servicios.crearGuardia({
      condominioId: condominioId,
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      codigoInterno: data.codigoInterno
    });
    setNuevo(false);
    reset();
    demo('¡Guardia registrado en Supabase!');
    g.recargar();
  } catch (e: unknown) {
    demo('Error al registrar guardia');
    console.error(e);
  } finally {
    setGuardando(false);
  }
});

  if (g.error) return <ErrorState mensaje={g.error} onReintentar={g.recargar} />;

  return (
    <div>
      <PageHeader
        titulo="Guardias"
        descripcion="Personal de seguridad asignado a este condominio, con estado de turno y vigencia de credencial."
        acciones={<button type="button" className="wg-btn is-primary" onClick={() => setNuevo(true)}><Plus size={15} /> Registrar guardia</button>}
      />
      {g.cargando ? <SkeletonTabla columnas={6} /> : (
        <DataTable
          filas={g.datos}
          columnas={columnas}
          idDe={(x) => x.id}
          textoBusqueda={(x) => `${x.nombre} ${x.telefono} ${x.puesto}`}
          filtros={[
            { clave: 'estado', etiqueta: 'Estado', opciones: ['En turno', 'Fuera de turno', 'Licencia'], coincide: (x, v) => x.estado === v },
            { clave: 'turno', etiqueta: 'Turno', opciones: ['Diurno', 'Nocturno', 'Libre'], coincide: (x, v) => x.turnoActual === v },
          ]}
          acciones={[
            { etiqueta: 'Ver ficha', icono: Eye, onClick: (x) => setDetalle(x) },
            { etiqueta: 'Editar guardia', icono: Pencil, onClick: () => demo('Edición de guardia (simulada)') },
            { etiqueta: 'Desvincular guardia', icono: UserMinus, onClick: (x) => setBaja(x), peligro: true },
          ]}
          onFila={(x) => setDetalle(x)}
          filaSeleccionadaId={detalle?.id}
          vacioIcono={ShieldCheck}
          vacioTitulo="Sin guardias asignados"
          vacioDescripcion="Registra a los guardias de este condominio para asignarlos a puestos y turnos."
          vacioAccion={<button type="button" className="wg-btn is-primary" onClick={() => setNuevo(true)}><Plus size={15} /> Registrar guardia</button>}
          placeholderBusqueda="Buscar por nombre, teléfono o puesto…"
        />
      )}

      <DetailDrawer
        abierto={detalle !== null}
        onCerrar={() => setDetalle(null)}
        titulo={detalle?.nombre ?? ''}
        subtitulo={detalle ? <Badge texto={detalle.estado} /> : null}
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => demo('Edición de guardia (simulada)')}><Pencil size={14} /> Editar</button>
            <button type="button" className="wg-btn" onClick={() => demo('Mensaje enviado al guardia (simulado)')}>Enviar mensaje</button>
          </>
        }
      >
        {detalle ? (
          <>
            <dl className="wg-kv">
              <dt>RUT</dt><dd className="wg-mono">{detalle.rut}</dd>
              <dt>Teléfono</dt><dd className="wg-mono">{detalle.telefono}</dd>
              <dt>Puesto</dt><dd>{detalle.puesto}</dd>
              <dt>Turno actual</dt><dd>{detalle.turnoActual}</dd>
              <dt>Última actividad</dt><dd className="wg-mono">{detalle.ultimaActividad}</dd>
              <dt>Credencial vence</dt><dd className="wg-mono">{detalle.credencialVence}</dd>
            </dl>
            <div className="wg-section-label">Cobertura del puesto</div>
            {p.datos.filter((x) => x.nombre === detalle.puesto).map((x) => (
              <div key={`pc-${x.id}`} className="wg-card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                  <span>{x.nombre}</span><b className="wg-tnum">{x.cubiertos}/{x.requeridos}</b>
                </div>
                <div className={`wg-bar ${x.cubiertos < x.requeridos ? 't-warn' : ''}`} style={{ marginTop: 10 }}><i style={{ width: `${(x.cubiertos / x.requeridos) * 100}%` }} /></div>
              </div>
            ))}
          </>
        ) : null}
      </DetailDrawer>

      <ConfirmModal
        abierto={baja !== null}
        onCerrar={() => setBaja(null)}
        onConfirmar={async () => {
          if (!baja) return;
          try {
await servicios.eliminarGuardia(baja.id, baja.usuarioId, condominioId);
            demo('Guardia desvinculado del condominio');
            setBaja(null);
            g.recargar(); // <-- REFRESCA LA TABLA AL INSTANTE
          } catch (e) {
            demo('Error al desvincular');
            console.error(e);
          }
        }}
        titulo="Desvincular guardia del condominio"
        descripcion={`${baja?.nombre ?? ''} dejará de tener acceso al panel de guardia de este condominio y sus turnos futuros quedarán sin asignar.`}
        etiquetaConfirmar="Desvincular"
        peligro
      />

      <Modal
        abierto={nuevo}
        onCerrar={() => setNuevo(false)}
        titulo="Registrar guardia"
        descripcion="Crea un usuario y lo asigna como guardia a este condominio en Supabase. La contraseña por defecto es Wendigo123!"
        ancho
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setNuevo(false)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" onClick={guardar} disabled={guardando} style={{ minWidth: 150 }}>
              {guardando ? 'Guardando…' : 'Registrar guardia'}
            </button>
          </>
        }
      >
        <form className="wg-form-grid" onSubmit={guardar}>
          <Field etiqueta="Nombre completo" requerido completo error={errors.nombre?.message}>
            <input className={`wg-input ${errors.nombre ? 'has-err' : ''}`} {...register('nombre', { required: 'Ingresa el nombre completo' })} />
          </Field>

          <Field etiqueta="Email" requerido error={errors.email?.message} ayuda="Servirá para iniciar sesión.">
            <input type="email" className={`wg-input ${errors.email ? 'has-err' : ''}`} {...register('email', { required: 'Ingresa el email' })} />
          </Field>

          <Field etiqueta="Teléfono" requerido error={errors.telefono?.message} ayuda="Número de contacto.">
            <input className={`wg-input ${errors.telefono ? 'has-err' : ''}`} {...register('telefono', { required: 'Ingresa un teléfono' })} />
          </Field>

          <Field etiqueta="Código interno" requerido completo error={errors.codigoInterno?.message} ayuda="Identificador único del guardia en el condominio.">
            <input className={`wg-input wg-mono ${errors.codigoInterno ? 'has-err' : ''}`} placeholder="Ej: G-001" {...register('codigoInterno', { required: 'Ingresa el código interno' })} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}