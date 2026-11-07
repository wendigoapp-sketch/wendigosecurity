'use client';
import React, { useState } from 'react';
import { Camera, ClipboardList, FileText, ImagePlus, Trash2, Video } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Badge } from '../ui/Badge';
import { Field } from '../ui/Field';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonLista } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Incidencia } from '../../lib/types';

interface FormInc { titulo: string; categoria: string; severidad: string; lugar: string; descripcion: string; }
interface Adjunto { id: string; nombre: string; tipo: 'Foto' | 'Video' | 'Documento'; }

export function GdIncidencias({ condominioId }: { condominioId: string }) {
  const { demo, notificar } = useToasts();
  const inc = useServicio<Incidencia[]>(() => servicios.incidencias(condominioId), [], [condominioId]);
  const [adjuntos, setAdjuntos] = useState<Adjunto[]>([]);
  const [guardando, setGuardando] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInc>();

  const agregar = (tipo: Adjunto['tipo']) => {
    // Backend integration: subir el archivo a Supabase Storage (bucket privado "evidencias") y registrar en la tabla evidencias.
    const n = adjuntos.length + 1;
    const nombre = tipo === 'Foto' ? `foto_evidencia_${n}.jpg` : tipo === 'Video' ? `video_evidencia_${n}.mp4` : `documento_${n}.pdf`;
    setAdjuntos((a) => [...a, { id: `adj-${n}-${tipo}`, nombre, tipo }]);
  };

  const enviar = handleSubmit(async () => {
    setGuardando(true);
    await new Promise((r) => setTimeout(r, 800));
    setGuardando(false);
    reset();
    setAdjuntos([]);
    notificar({ titulo: 'Incidencia registrada (demostración)', detalle: 'No se guardó ni se subieron archivos reales.', tipo: 'warn' });
  });

  if (inc.error) return <ErrorState mensaje={inc.error} onReintentar={inc.recargar} />;

  return (
    <div className="wg-gd-split">
      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 14 }}>Registrar incidencia</h2>
        <form className="wg-card" onSubmit={enviar}>
          <div className="wg-form-grid">
            <Field etiqueta="Título" requerido completo error={errors.titulo?.message}>
              <input className={`wg-input is-lg ${errors.titulo ? 'has-err' : ''}`} {...register('titulo', { required: 'Describe brevemente lo ocurrido' })} />
            </Field>
            <Field etiqueta="Categoría" requerido error={errors.categoria?.message}>
              <select className={`wg-input is-lg ${errors.categoria ? 'has-err' : ''}`} defaultValue="" {...register('categoria', { required: 'Selecciona una categoría' })}>
                <option value="" disabled>Selecciona…</option>
                {['Acceso indebido', 'Daño a propiedad', 'Ruidos molestos', 'Vehículo sospechoso', 'Falla técnica', 'Emergencia médica'].map((c) => <option key={`gc-${c}`} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field etiqueta="Severidad" requerido error={errors.severidad?.message}>
              <select className={`wg-input is-lg ${errors.severidad ? 'has-err' : ''}`} defaultValue="" {...register('severidad', { required: 'Selecciona la severidad' })}>
                <option value="" disabled>Selecciona…</option>
                {['Baja', 'Media', 'Alta', 'Crítica'].map((c) => <option key={`gs-${c}`} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field etiqueta="Lugar" requerido completo error={errors.lugar?.message}>
              <input className={`wg-input is-lg ${errors.lugar ? 'has-err' : ''}`} placeholder="Ej: Acceso vehicular norte" {...register('lugar', { required: 'Indica dónde ocurrió' })} />
            </Field>
            <Field etiqueta="Descripción" requerido completo error={errors.descripcion?.message}>
              <textarea className={`wg-textarea ${errors.descripcion ? 'has-err' : ''}`} {...register('descripcion', { required: 'Describe qué ocurrió', minLength: { value: 15, message: 'Agrega al menos 15 caracteres' } })} />
            </Field>
          </div>

          <div className="wg-section-label">Evidencia</div>
          <div className="wg-action-grid">
            <button type="button" className="wg-dropzone" onClick={() => agregar('Foto')}><Camera size={22} style={{ margin: '0 auto 6px', display: 'block' }} />Tomar foto</button>
            <button type="button" className="wg-dropzone" onClick={() => agregar('Video')}><Video size={22} style={{ margin: '0 auto 6px', display: 'block' }} />Grabar video</button>
            <button type="button" className="wg-dropzone" onClick={() => agregar('Documento')}><FileText size={22} style={{ margin: '0 auto 6px', display: 'block' }} />Adjuntar documento</button>
          </div>
          {adjuntos.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {adjuntos.map((a) => (
                <div key={`adj-${a.id}`} className="wg-thumb">
                  {a.tipo === 'Foto' ? <ImagePlus size={16} /> : a.tipo === 'Video' ? <Video size={16} /> : <FileText size={16} />}
                  <span className="wg-mono" style={{ flex: 1, minWidth: 0 }}>{a.nombre}</span>
                  <button type="button" className="wg-icon-btn is-danger" style={{ width: 30, height: 30 }} aria-label={`Quitar ${a.nombre}`} onClick={() => setAdjuntos((l) => l.filter((x) => x.id !== a.id))}><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          ) : (
            <p className="wg-help" style={{ marginTop: 10 }}>Aún no hay evidencia adjunta. Backend integration: los archivos se subirán a Storage con acceso restringido por RLS.</p>
          )}

          <button type="submit" className="wg-btn is-primary is-lg is-block" style={{ marginTop: 18 }} disabled={guardando}>
            {guardando ? 'Registrando…' : 'Registrar incidencia'}
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 14 }}>Incidencias recientes</h2>
        {inc.cargando ? <SkeletonLista /> : inc.datos.length === 0 ? (
          <div className="wg-card"><EmptyState icono={ClipboardList} titulo="Sin incidencias registradas" descripcion="Cuando registres un evento quedará documentado aquí con su evidencia." /></div>
        ) : inc.datos.slice(0, 5).map((x) => (
          <div key={`gi-${x.id}`} className="wg-list-card" style={{ flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, width: '100%' }}>
              <b style={{ fontSize: 14.5, minWidth: 0 }}>{x.titulo}</b>
              <Badge texto={x.severidad} />
            </div>
            <div className="wg-cell-sub">{x.categoria} · {x.lugar}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Badge texto={x.estado} />
              <span className="wg-feed-time">{x.fecha}</span>
              <span className="wg-help">{x.evidencias} evidencias</span>
            </div>
          </div>
        ))}
        <button type="button" className="wg-btn is-lg is-block" onClick={() => demo('Reporte de turno enviado a la central (simulado)')}>Enviar reporte de turno</button>
      </section>
    </div>
  );
}