
'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Building2, CarFront, History, MessageSquare, QrCode, ShieldAlert, UserPlus } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { QRCode } from '../ui/QRCode';
import { SkeletonLista } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { ConfirmModal } from '../ui/Modal';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import { createClient } from '../../lib/config/supabase';
import type { Visita } from '../../lib/types';

export function ResInicio({ condominioId, unidad, ir }: { condominioId: string; unidad: string; ir: (vista: string) => void }) {
  const { demo } = useToasts();
  const v = useServicio<Visita[]>(() => servicios.visitas(condominioId), [], [condominioId]);
  const [panico, setPanico] = useState(false);
  const [nombreResidente, setNombreResidente] = useState('');

  useEffect(() => {
    const cargarNombre = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('perfiles')
        .select('nombre_completo')
        .eq('id', user.id)
        .single();

      if (data?.nombre_completo) {
        setNombreResidente(data.nombre_completo);
      }
    };

    cargarNombre();
  }, []);

  if (v.error) return <ErrorState mensaje={v.error} onReintentar={v.recargar} />;
  
  // Traemos las visitas del condominio
  const mias = v.datos;
  const proximas = mias.filter((x) => x.estado === 'Autorizada' || x.estado === 'Programada' || x.estado === 'En el condominio');
  const siguiente = proximas.find((x) => x.qrCodigo);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600 }}>
          Hola{nombreResidente ? `, ${nombreResidente}` : ''}
        </h1>
        <p className="wg-page-sub">Tienes {proximas.length} {proximas.length === 1 ? 'visita prevista' : 'visitas previstas'} para hoy y mañana.</p>
      </div>

      <div className="wg-quick">
        <button type="button" className="wg-quick-btn is-primary" onClick={() => ir('autorizar')}>
          <UserPlus size={22} style={{ color: 'var(--primary)' }} />
          <div><b>Autorizar visita</b><br /><span>Genera un QR en 4 pasos</span></div>
        </button>
        <button type="button" className="wg-quick-btn" onClick={() => ir('visitas')}>
          <QrCode size={22} style={{ color: 'var(--secondary-foreground)' }} />
          <div><b>Visitas previstas</b><br /><span>{proximas.length} activas</span></div>
        </button>
        <button type="button" className="wg-quick-btn" onClick={() => ir('vehiculos')}>
          <CarFront size={22} style={{ color: 'var(--secondary-foreground)' }} />
          <div><b>Mis vehículos</b><br /><span>Patentes registradas</span></div>
        </button>
        <button type="button" className="wg-quick-btn" onClick={() => ir('info')}>
          <Building2 size={22} style={{ color: 'var(--secondary-foreground)' }} />
          <div><b>Mi condominio</b><br /><span>Contactos y normas</span></div>
        </button>
      </div>

      {v.cargando ? <SkeletonLista filas={2} /> : siguiente ? (
        <div className="wg-card is-ok" style={{ marginBottom: 18 }}>
          <div className="wg-card-title">Próxima visita con QR</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 12 }}>
            <QRCode codigo={siguiente.qrCodigo ?? siguiente.id} pequeno />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{siguiente.visitante}</div>
              <div className="wg-cell-sub">{siguiente.ventanaDesde}</div>
              <div style={{ marginTop: 8 }}><Badge texto={siguiente.estado} /></div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="wg-section-label" style={{ marginTop: 0 }}>Novedades</div>
      
      {proximas.length > 0 ? (
        <button type="button" className="wg-list-card" style={{ width: '100%', textAlign: 'left', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => ir('visitas')}>
          <div className="wg-feed-icon t-ok"><Bell size={17} /></div>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 14 }}>Tienes visitas programadas</b>
            <div className="wg-cell-sub">{proximas[0].visitante} está autorizado para ingresar.</div>
          </div>
        </button>
      ) : (
        <div className="wg-card" style={{ textAlign: 'center', padding: 20 }}>
          <p className="wg-help">No tienes novedades por ahora.</p>
        </div>
      )}

      <button type="button" className="wg-list-card" style={{ width: '100%', textAlign: 'left', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => ir('historial')}>
        <div className="wg-feed-icon"><History size={17} /></div>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 14 }}>Historial de visitas</b>
          <div className="wg-cell-sub">Revisa quién ha visitado tu unidad.</div>
        </div>
      </button>

      <div className="wg-card is-alert" style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ShieldAlert size={22} style={{ color: 'var(--destructive)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <b>Botón de pánico</b>
            <div className="wg-cell-sub">Avisa de inmediato a portería y central de seguridad.</div>
          </div>
        </div>
        <button type="button" className="wg-btn is-danger is-lg is-block" style={{ marginTop: 14 }} onClick={() => setPanico(true)}>Enviar alerta de pánico</button>
      </div>

      <ConfirmModal
        abierto={panico}
        onCerrar={() => setPanico(false)}
        onConfirmar={() => demo('Alerta de pánico enviada (simulada)')}
        titulo="Enviar alerta de pánico"
        descripcion="Se avisará a portería y al administrador con tu unidad y ubicación. Úsalo solo si estás en una situación de riesgo."
        etiquetaConfirmar="Enviar alerta"
        peligro
      />
    </div>
  );
}
