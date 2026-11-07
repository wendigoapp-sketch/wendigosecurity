'use client';
import React, { useState } from 'react';
import { Camera, Maximize2, VideoOff, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Badge } from '../ui/Badge';
import { PageHeader } from '../ui/PageHeader';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';
import { DetailDrawer, Modal, ConfirmModal } from '../ui/Modal';
import { Field } from '../ui/Field';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Camara } from '../../lib/types';

interface FormCamara {
  nombre: string;
  ubicacion: string;
  direccion_host: string;
  puerto: string;
  estado: string;
}

export function ModuloCamaras({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const c = useServicio<Camara[]>(() => servicios.camaras(condominioId), [], [condominioId]);
  
  const [filtro, setFiltro] = useState<'todas' | 'En línea' | 'Sin señal' | 'Mantención'>('todas');
  const [detalle, setDetalle] = useState<Camara | null>(null);
  
  // Estados para el Modal de Creación y Borrado
  const [nueva, setNueva] = useState(false);
  const [borrando, setBorrando] = useState<Camara | null>(null);
  const [guardando, setGuardando] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormCamara>();

  if (c.error) return <ErrorState mensaje={c.error} onReintentar={c.recargar} />;
  const lista = c.datos.filter((x) => filtro === 'todas' || x.estado === filtro);
  const enLinea = c.datos.filter((x) => x.estado === 'En línea').length;

  const guardar = handleSubmit(async (data) => {
    setGuardando(true);
    try {
      await servicios.crearCamara(condominioId, data);
      setNueva(false);
      reset();
      demo('¡Cámara registrada!');
      window.location.reload();
    } catch (e) {
      demo('Error al registrar cámara');
      console.error(e);
    } finally {
      setGuardando(false);
    }
  });

  const confirmarBorrar = async () => {
    if (!borrando) return;
    try {
      await servicios.eliminarCamara(borrando.id);
      demo('Cámara eliminada');
      setBorrando(null);
      setDetalle(null); // Cerramos el detalle si estaba abierto
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <PageHeader
        titulo="Cámaras"
        descripcion="Estado y vista previa de las cámaras instaladas. La transmisión en vivo se conectará al servidor de video."
        vivo={`${enLinea} de ${c.datos.length} cámaras en línea`}
        acciones={<button type="button" className="wg-btn is-primary" onClick={() => setNueva(true)}><Plus size={15} /> Registrar cámara</button>}
      />
      <div className="wg-banner">
        <VideoOff size={16} />
        <span>Las vistas son marcadores de posición. Backend integration: conectar el flujo RTSP/HLS del NVR del condominio.</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['todas', 'En línea', 'Sin señal', 'Mantención'] as const).map((f) => (
          <button key={`cf-${f}`} type="button" className={`wg-chip ${filtro === f ? 'is-on' : ''}`} onClick={() => setFiltro(f)}>
            {f === 'todas' ? 'Todas' : f}
            <span className="wg-tnum">{f === 'todas' ? c.datos.length : c.datos.filter((x) => x.estado === f).length}</span>
          </button>
        ))}
      </div>

      {c.cargando ? (
        <div className="wg-grid-3">{['a', 'b', 'c', 'd', 'e', 'f'].map((k) => <div key={`skc-${k}`} className="wg-skel" style={{ aspectRatio: '16/10' }} />)}</div>
      ) : lista.length === 0 ? (
        <div className="wg-card"><EmptyState icono={Camera} titulo="No hay cámaras en este estado" descripcion="Prueba con otro filtro o registra una nueva cámara." /></div>
      ) : (
        <div className="wg-grid-3">
          {lista.map((x) => (
            <div key={`cam-${x.id}`} className="wg-card is-hover" style={{ padding: 12 }}>
              <div className="wg-cam">
                <span className="wg-cam-tag">CAM</span>
                {x.estado === 'En línea' ? <span className="wg-cam-live">EN VIVO</span> : <span className="wg-cam-off">{x.estado.toUpperCase()}</span>}
                {x.estado === 'En línea' ? <Camera size={30} /> : <VideoOff size={30} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="wg-cell-main wg-cell-trunc">{x.nombre}</div>
                  <div className="wg-cell-sub">{x.lugar}</div>
                </div>
                <Badge texto={x.estado} />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="button" className="wg-btn is-sm" style={{ flex: 1 }} onClick={() => setDetalle(x)}><Maximize2 size={13} /> Detalle</button>
                <button type="button" className="wg-btn is-sm" onClick={() => setBorrando(x)} style={{ color: 'var(--destructive)' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DetailDrawer abierto={detalle !== null} onCerrar={() => setDetalle(null)} titulo={detalle?.nombre ?? ''} subtitulo={detalle ? <Badge texto={detalle.estado} /> : null}>
        {detalle ? (
          <>
            <div className="wg-cam" style={{ marginBottom: 16 }}>
              <span className="wg-cam-tag">CAM</span>
              {detalle.estado === 'En línea' ? <span className="wg-cam-live">EN VIVO</span> : <span className="wg-cam-off">{detalle.estado.toUpperCase()}</span>}
              {detalle.estado === 'En línea' ? <Camera size={40} /> : <VideoOff size={40} />}
            </div>
            <dl className="wg-kv">
              <dt>Lugar</dt><dd>{detalle.lugar}</dd>
              <dt>Resolución</dt><dd className="wg-mono">{detalle.resolucion}</dd>
              <dt>Grabación</dt><dd>{detalle.grabacion ? <Badge texto="Grabando" tono="ok" /> : <Badge texto="Sin grabación" tono="mute" />}</dd>
              <dt>Última conexión</dt><dd className="wg-mono">{detalle.ultimaConexion}</dd>
            </dl>
            <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
              <button type="button" className="wg-btn" onClick={() => demo('Instantánea guardada (simulada)')} disabled={detalle.estado !== 'En línea'}>Capturar imagen</button>
              <button type="button" className="wg-btn" onClick={() => setBorrando(detalle)} style={{ color: 'var(--destructive)' }}>Eliminar cámara</button>
            </div>
          </>
        ) : null}
      </DetailDrawer>

      {/* MODAL PARA REGISTRAR CÁMARA */}
      <Modal
        abierto={nueva}
        onCerrar={() => setNueva(false)}
        titulo="Registrar cámara"
        descripcion="Ingresa los datos de la cámara de seguridad."
        ancho
        pie={
          <>
            <button type="button" className="wg-btn" onClick={() => setNueva(false)}>Cancelar</button>
            <button type="button" className="wg-btn is-primary" onClick={guardar} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Registrar cámara'}
            </button>
          </>
        }
      >
        <form className="wg-form-grid" onSubmit={guardar}>
          <Field etiqueta="Nombre de la cámara" requerido completo error={errors.nombre?.message}>
            <input className={`wg-input ${errors.nombre ? 'has-err' : ''}`} placeholder="Ej: CAM-01 Portería" {...register('nombre', { required: 'Requerido' })} />
          </Field>
          
          <Field etiqueta="Ubicación" requerido error={errors.ubicacion?.message}>
            <input className={`wg-input ${errors.ubicacion ? 'has-err' : ''}`} placeholder="Ej: Acceso principal" {...register('ubicacion', { required: 'Requerido' })} />
          </Field>
          
          <Field etiqueta="Estado" requerido error={errors.estado?.message}>
            <select className={`wg-input ${errors.estado ? 'has-err' : ''}`} defaultValue="activa" {...register('estado', { required: 'Requerido' })}>
              <option value="activa">En línea</option>
              <option value="inactiva">Sin señal</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
          </Field>

          <Field etiqueta="Host / IP (Opcional)" error={errors.direccion_host?.message} ayuda="Para futuro streaming">
            <input className={`wg-input wg-mono ${errors.direccion_host ? 'has-err' : ''}`} placeholder="192.168.1.100" {...register('direccion_host')} />
          </Field>

          <Field etiqueta="Puerto (Opcional)" error={errors.puerto?.message}>
            <input type="number" className={`wg-input wg-mono ${errors.puerto ? 'has-err' : ''}`} placeholder="554" {...register('puerto')} />
          </Field>
        </form>
      </Modal>

      <ConfirmModal
        abierto={borrando !== null}
        onCerrar={() => setBorrando(null)}
        onConfirmar={confirmarBorrar}
        titulo="Eliminar cámara"
        descripcion={`¿Estás seguro de que quieres eliminar la cámara "${borrando?.nombre}"?`}
        etiquetaConfirmar="Eliminar"
        peligro
      />
    </div>
  );
}