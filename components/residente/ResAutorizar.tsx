'use client';
import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Field } from '../ui/Field';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import QRCode from 'react-qr-code';

interface FormVisita {
  nombre: string; rut: string; telefono: string; motivo: string; fecha: string; desde: string; hasta: string; patente: string;
}

export function ResAutorizar({ condominioId, unidad, onTerminar }: { condominioId: string; unidad: string; onTerminar: () => void }) {
  const { notificar } = useToasts();
  const [paso, setPaso] = useState(1);
  const [generando, setGenerando] = useState(false);
  const [codigo, setCodigo] = useState<string | null>(null);
  const { register, handleSubmit, trigger, getValues, formState: { errors } } = useForm<FormVisita>({ defaultValues: { motivo: 'Familiar' } });

  const campos: Record<number, Array<keyof FormVisita>> = {
    1: ['nombre', 'rut', 'telefono'],
    2: ['motivo', 'fecha', 'desde', 'hasta'],
    3: ['patente'],
  };

  const siguiente = async () => {
    const ok = await trigger(campos[paso]);
    if (ok) setPaso((p) => p + 1);
  };

 const emitir = handleSubmit(async (datos) => {
  setGenerando(true);
  try {
    const fechaHora = new Date(`${datos.fecha}T${datos.desde}:00`).toISOString();
    const sufijo = datos.rut.replace(/\D/g, '').slice(-6).padStart(6, '0');
    const nuevoCodigo = `QR-${sufijo}`;

    await servicios.crearVisita({
      condominioId,
      titulo: `${datos.nombre} (${datos.motivo})`,
      fecha: fechaHora,
      qrCodigo: nuevoCodigo
    });

    setCodigo(nuevoCodigo);
    setPaso(4);
    notificar({ titulo: '¡Visita Autorizada!', detalle: 'El guardia ya la puede ver en su panel.', tipo: 'ok' });
  } catch (e: unknown) {
    console.error("ERROR AL GUARDAR:", e);
    const mensaje = e instanceof Error ? e.message : 'Revisa la consola (F12)';
    notificar({ titulo: 'Error al guardar', detalle: mensaje, tipo: 'bad' });
  } finally {
    setGenerando(false);
  }
});
  const valores = getValues();

  return (
    <div>
      {paso < 4 ? (
        <p className="wg-help" style={{ marginBottom: 14 }}>Paso {paso} de 3 · Unidad {unidad}</p>
      ) : null}

      {paso === 1 ? (
        <form className="wg-form-grid" style={{ gridTemplateColumns: '1fr' }} onSubmit={(e) => { e.preventDefault(); void siguiente(); }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>¿Quién te visita?</h2>
          <Field etiqueta="Nombre completo" requerido error={errors.nombre?.message}>
            <input className="wg-input is-lg" {...register('nombre', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="RUT" requerido error={errors.rut?.message}>
            <input className="wg-input is-lg wg-mono" {...register('rut', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Teléfono" requerido error={errors.telefono?.message}>
            <input className="wg-input is-lg" {...register('telefono', { required: 'Requerido' })} />
          </Field>
        </form>
      ) : null}

      {paso === 2 ? (
        <div className="wg-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, gridColumn: '1 / -1' }}>¿Cuándo llega?</h2>
          <Field etiqueta="Fecha" requerido completo error={errors.fecha?.message}>
            <input type="date" className="wg-input is-lg" {...register('fecha', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Desde" requerido error={errors.desde?.message}>
            <input type="time" className="wg-input is-lg" {...register('desde', { required: 'Requerido' })} />
          </Field>
          <Field etiqueta="Hasta" requerido error={errors.hasta?.message}>
            <input type="time" className="wg-input is-lg" {...register('hasta', { required: 'Requerido' })} />
          </Field>
        </div>
      ) : null}

      {paso === 4 && codigo ? (
        <div style={{ textAlign: 'center' }} className="wg-fade-in">
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary)', color: 'var(--primary-foreground)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}><Check size={28} /></div>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Visita autorizada</h2>
          <p className="wg-page-sub" style={{ marginBottom: 18 }}>{valores.nombre} podrá ingresar el {valores.fecha} entre {valores.desde} y {valores.hasta}.</p>
          
          <div style={{ display: 'grid', placeItems: 'center', background: '#fff', padding: 16, borderRadius: 12, margin: '0 auto', width: 'fit-content' }}>
            <QRCode value={codigo} size={200} bgColor="#ffffff" fgColor="#000000" />
          </div>
          
          <div className="wg-mono" style={{ marginTop: 12, fontWeight: 600, letterSpacing: '0.08em' }}>{codigo}</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`Hola ${valores.nombre}, tenés una visita autorizada para el condominio. Presentá este código QR en la portería: ${codigo}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="wg-btn is-primary is-lg is-block" 
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Share2 size={18} /> Compartir código por WhatsApp
            </a>
            <button type="button" className="wg-btn is-block" onClick={onTerminar}>Ver visitas previstas</button>
          </div>
        </div>
      ) : null}

      {paso < 4 ? (
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          {paso > 1 ? <button type="button" className="wg-btn is-lg" onClick={() => setPaso((p) => p - 1)}><ChevronLeft size={16} /> Atrás</button> : null}
          {paso < 3 ? (
            <button type="button" className="wg-btn is-primary is-lg" style={{ flex: 1 }} onClick={siguiente}>Continuar <ChevronRight size={16} /></button>
          ) : (
            <button type="button" className="wg-btn is-primary is-lg" style={{ flex: 1 }} onClick={emitir} disabled={generando}>
              {generando ? 'Guardando...' : 'Autorizar y generar QR'}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}