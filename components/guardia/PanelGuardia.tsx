'use client';
import React, { useState, useEffect } from 'react';
import { ClipboardList, MessageSquare, ScanLine, ShieldAlert, ShieldCheck } from 'lucide-react';
import { ToastProvider, useToasts } from '../ui/Toasts';
import { ConfirmModal } from '../ui/Modal';
import { GdAcceso } from './GdAcceso';
import { GdIncidencias } from './GdIncidencias';
import { GdComunicacion } from './GdComunicacion';
import { createClient } from '../../lib/config/supabase';

type Vista = 'acceso' | 'incidencias' | 'comunicacion';

function Interior({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const [vista, setVista] = useState<Vista>('acceso');
  const [panico, setPanico] = useState(false);
  
  const [nombreGuardia, setNombreGuardia] = useState('Guardia');
  const [turnoGuardia, setTurnoGuardia] = useState('Turno no asignado');
  const [guardiaId, setGuardiaId] = useState<string | null>(null); // <-- NUEVO ESTADO
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarGuardia = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: perfil } = await supabase.from('perfiles').select('nombre_completo').eq('id', user.id).single();
        if (perfil) setNombreGuardia(perfil.nombre_completo);
        
        // Buscamos el guardia y guardamos su ID
        const { data: guardia } = await supabase.from('guardias').select('id').eq('usuario_id', user.id).limit(1);
        
        if (guardia && guardia.length > 0) {
          setGuardiaId(guardia[0].id); // <-- GUARDAMOS EL ID
          
          const { data: turnos } = await supabase.from('turnos').select('tipo').eq('guardia_id', guardia[0].id).limit(1);
          if (turnos && turnos.length > 0) {
            setTurnoGuardia(turnos[0].tipo === 'diurno' ? 'Turno diurno' : 'Turno nocturno');
          }
        }
      }
      setCargando(false);
    };
    cargarGuardia();
  }, []);

  return (
    <div className="wg-gd-shell-wrapper">
      <div className="wg-gd-frame">
        <header className="wg-gd-top" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div className="wg-brand-mark"><ShieldCheck size={19} /></div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Portería principal</div>
            <div className="wg-cell-sub">
              {cargando ? 'Cargando...' : `${nombreGuardia} · ${turnoGuardia}`}
            </div>
          </div>
        </header>

        <main className="wg-gd-main wg-fade-in" key={vista} style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {/* LE PASAMOS EL guardiaId A GdAcceso */}
          {vista === 'acceso' ? <GdAcceso condominioId={condominioId} guardiaId={guardiaId} /> : null}
          {vista === 'incidencias' ? <GdIncidencias condominioId={condominioId} /> : null}
          {vista === 'comunicacion' ? <GdComunicacion condominioId={condominioId} /> : null}
        </main>

        <nav className="wg-gd-nav" aria-label="Navegación del guardia">
          <button type="button" className={`wg-gd-tab ${vista === 'acceso' ? 'is-active' : ''}`} onClick={() => setVista('acceso')}><ScanLine size={22} /> Acceso</button>
          <button type="button" className={`wg-gd-tab ${vista === 'incidencias' ? 'is-active' : ''}`} onClick={() => setVista('incidencias')}><ClipboardList size={22} /> Incidencias</button>
          <button type="button" className={`wg-gd-tab ${vista === 'comunicacion' ? 'is-active' : ''}`} onClick={() => setVista('comunicacion')}><MessageSquare size={22} /> Mensajes</button>
          <button type="button" className="wg-gd-tab is-panic" onClick={() => setPanico(true)}><ShieldAlert size={22} /> Pánico</button>
        </nav>

        <ConfirmModal
          abierto={panico}
          onCerrar={() => setPanico(false)}
          onConfirmar={() => demo('Alerta de pánico enviada a la central (simulada)')}
          titulo="Enviar alerta de pánico"
          descripcion="Se avisará a la central de seguridad y al administrador con tu puesto y ubicación. Úsalo solo ante una situación de riesgo."
          etiquetaConfirmar="Enviar alerta"
          peligro
        />
      </div>
    </div>
  );
}

export function PanelGuardia() {
  const [condominioId, setCondominioId] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCondominio = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: membresia } = await supabase
          .from('membresias')
          .select('condominio_id')
          .eq('usuario_id', user.id)
          .limit(1)
          .single();
        
        if (membresia) setCondominioId(membresia.condominio_id);
      }
      setCargando(false);
    };
    cargarCondominio();
  }, []);

  if (cargando) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)' }}>Cargando panel...</div>;
  }

  if (!condominioId) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)' }}>No tenés un condominio asignado.</div>;
  }

  return (
    <ToastProvider>
      <Interior condominioId={condominioId} />
    </ToastProvider>
  );
}