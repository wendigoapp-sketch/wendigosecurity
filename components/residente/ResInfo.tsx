'use client';
import React, { useState, useEffect } from 'react';
import { Camera, Clock, MapPin, Phone, ShieldCheck, Users } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { SkeletonLista } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { LugarCondominio, Condominio } from '../../lib/types';

export function ResInfo({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const l = useServicio<LugarCondominio[]>(() => servicios.lugares(condominioId), [], [condominioId]);
  
  // Estado para el condominio
  const [condominio, setCondominio] = useState<Condominio | null>(null);
  const [cargandoCondo, setCargandoCondo] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const data = await servicios.obtenerCondominio(condominioId);
      setCondominio(data);
      setCargandoCondo(false);
    };
    cargar();
  }, [condominioId]);

  if (l.error) return <ErrorState mensaje={l.error} onReintentar={l.recargar} />;
  const comunes = l.datos.filter((x) => x.tipo === 'Área común');

  return (
    <div>
      {/* DATOS REALES DEL CONDOMINIO */}
      <div className="wg-card" style={{ marginBottom: 16 }}>
        {cargandoCondo ? (
          <div className="wg-skel" style={{ height: 60 }} />
        ) : condominio ? (
          <>
            <div style={{ fontWeight: 600, fontSize: 17 }}>{condominio.nombre}</div>
            <div className="wg-metric-hint"><MapPin size={14} /> {condominio.direccion}, {condominio.comuna}</div>
            <div className="wg-metric-hint"><Users size={14} /> {condominio.unidades} unidades</div>
          </>
        ) : (
          <p className="wg-help">No se encontraron datos del condominio.</p>
        )}
      </div>

      <div className="wg-section-label" style={{ marginTop: 0 }}>Contactos</div>
      <div className="wg-list-card">
        <div className="wg-feed-icon t-ok"><ShieldCheck size={17} /></div>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 14 }}>Portería principal</b>
          <div className="wg-cell-sub">Atención 24 horas</div>
        </div>
        <button type="button" className="wg-btn is-sm" onClick={() => demo('Llamada a portería (simulada)')}><Phone size={13} /> Llamar</button>
      </div>
      <div className="wg-list-card">
        <div className="wg-feed-icon"><Users size={17} /></div>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 14 }}>Administración</b>
          <div className="wg-cell-sub">{condominio?.administrador || 'Administrador'} · Lun a Vie 09:00–18:00</div>
        </div>
        <button type="button" className="wg-btn is-sm" onClick={() => demo('Llamada a administración (simulada)')}><Phone size={13} /> Llamar</button>
      </div>

      <div className="wg-section-label">Áreas comunes</div>
      {l.cargando ? <SkeletonLista filas={3} /> : comunes.length === 0 ? (
        <div className="wg-card"><p className="wg-help">No hay áreas comunes registradas.</p></div>
      ) : comunes.map((x) => (
        <div key={`ri-${x.id}`} className="wg-list-card">
          <div className="wg-feed-icon"><MapPin size={17} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ fontSize: 14 }}>{x.nombre}</b>
            <div className="wg-cell-sub">{(x as any).descripcion || 'Sin descripción'}</div>
          </div>
        </div>
      ))}

      <div className="wg-section-label">Normas de acceso</div>
      <div className="wg-card">
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.7, color: 'var(--secondary-foreground)' }}>
          <li>Toda visita debe estar autorizada previamente o ser confirmada por el residente en portería.</li>
          <li>El QR es personal e intransferible y solo es válido dentro de su ventana horaria.</li>
          <li>Los proveedores y mudanzas se coordinan con la administración.</li>
          <li>Las alertas de pánico solo deben usarse ante riesgo real.</li>
        </ul>
      </div>
    </div>
  );
}