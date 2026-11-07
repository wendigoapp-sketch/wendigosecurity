'use client';
import React, { useState, useEffect } from 'react';
import {
  Building2, Camera, CarFront, ClipboardList, ScrollText, LayoutDashboard, MapPin, MessageSquare, QrCode,
  Route, ShieldAlert, ShieldCheck, Users, CalendarClock, CalendarDays, UsersRound,
} from 'lucide-react';
import { AppLayout } from '../layout/AppLayout';
import type { GrupoNav } from '../layout/Sidebar';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Condominio } from '../../lib/types';
import { ModuloResumen } from './ModuloResumen';
import { ModuloCondominios } from './ModuloCondominios';
import { ModuloResidentes } from './ModuloResidentes';
import { ModuloGuardias } from './ModuloGuardias';
import { ModuloVisitas } from './ModuloVisitas';
import { ModuloQR } from './ModuloQR';
import { ModuloMovimientos } from './ModuloMovimientos';
import { ModuloVehiculos } from './ModuloVehiculos';
import { ModuloIncidencias } from './ModuloIncidencias';
import { ModuloPanico } from './ModuloPanico';
import { ModuloTurnos } from './ModuloTurnos';
import { ModuloLugares } from './ModuloLugares';
import { ModuloCamaras } from './ModuloCamaras';
import { ModuloComunicacion } from './ModuloComunicacion';
import { ModuloAuditoria } from './ModuloAuditoria';
import { EmptyState } from '../ui/EmptyState';

export function PanelAdministrador() {
  const [modulo, setModulo] = useState('resumen');
  const [condominioId, setCondominioId] = useState(''); 
  
  const condos = useServicio<Condominio[]>(() => servicios.condominios(), [], []);
  
  // Consultamos datos solo si hay un condominioId válido
  const panicos = useServicio(() => condominioId ? servicios.alertasPanico(condominioId) : Promise.resolve([]), [], [condominioId]);
  const incidencias = useServicio(() => condominioId ? servicios.incidencias(condominioId) : Promise.resolve([]), [], [condominioId]);

  // EFECTO PARA CARGAR EL CONDOMINIO CON LOCALSTORAGE
  useEffect(() => {
    const cargarCondominio = async () => {
      // 1. Primero, chequeamos la "libretita" del navegador
      const condoGuardado = localStorage.getItem('condominioActivo');
      
      if (condoGuardado && condos.datos.find(c => c.id === condoGuardado)) {
        setCondominioId(condoGuardado);
        return;
      }

      // 2. Si no hay nada en la libretita, usamos el primero de la lista
      if (condos.datos.length > 0) {
        setCondominioId(condos.datos[0].id);
      } else {
        // 3. Si no hay ningún condominio, lo mandamos directo a crearlos
        setModulo('condominios');
      }
    };
    
    // Solo ejecutamos si hay datos cargados
    if (condos.datos.length > 0 || (!condos.cargando && condominioId === '')) {
      cargarCondominio();
    }
  }, [condos.datos, condos.cargando]); // Se ejecuta cuando la lista de condominios cambia o termina de cargar

  const activas = panicos.datos.filter((p) => (p.estado || '').toLowerCase() === 'activa').length;
  const abiertas = incidencias.datos.filter((i) => (i.estado || '').toLowerCase() === 'abierta').length;

  const grupos: GrupoNav[] = [
    {
      titulo: 'Operación',
      items: [
        { id: 'resumen', etiqueta: 'Resumen', icono: LayoutDashboard },
        { id: 'panico', etiqueta: 'Alertas de pánico', icono: ShieldAlert, badge: activas || undefined },
        { id: 'incidencias', etiqueta: 'Incidencias y evidencias', icono: ClipboardList, badge: abiertas || undefined, badgeSuave: true },
        { id: 'movimientos', etiqueta: 'Movimientos', icono: Route },
        { id: 'camaras', etiqueta: 'Cámaras', icono: Camera },
      ],
    },
    {
      titulo: 'Accesos',
      items: [
        { id: 'visitas', etiqueta: 'Visitas', icono: CalendarClock },
        { id: 'qr', etiqueta: 'Autorizaciones QR', icono: QrCode },
        { id: 'vehiculos', etiqueta: 'Vehículos', icono: CarFront },
      ],
    },
    {
      titulo: 'Personas y lugares',
      items: [
        { id: 'residentes', etiqueta: 'Residentes y unidades', icono: Users },
        { id: 'guardias', etiqueta: 'Guardias', icono: ShieldCheck },
        { id: 'turnos', etiqueta: 'Puestos y turnos', icono: CalendarDays },
        { id: 'lugares', etiqueta: 'Lugares del condominio', icono: MapPin },
      ],
    },
    {
      titulo: 'Administración',
      items: [
        { id: 'condominios', etiqueta: 'Condominios', icono: Building2 },
        { id: 'comunicacion', etiqueta: 'Comunicación', icono: MessageSquare },
        { id: 'auditoria', etiqueta: 'Auditoría', icono: ScrollText },
      ],
    },
  ];

  const render = () => {
    // Si no hay condominio y quiere ver otro módulo, mostramos mensaje (excepto en condominios)
    if (!condominioId && modulo !== 'condominios') {
        return <div className="wg-card"><EmptyState icono={Building2} titulo="Sin condominio seleccionado" descripcion="Ve a la sección de Condominios para crear uno o selecciona uno existente." /></div>;
    }

    switch (modulo) {
      case 'resumen': return <ModuloResumen condominioId={condominioId} onModulo={setModulo} />;
      case 'condominios': return <ModuloCondominios condominios={condos.datos} onRefrescar={condos.recargar} />;
      case 'residentes': return <ModuloResidentes condominioId={condominioId} />;
      case 'guardias': return <ModuloGuardias condominioId={condominioId} />;
      case 'visitas': return <ModuloVisitas condominioId={condominioId} />;
      case 'qr': return <ModuloQR condominioId={condominioId} />;
      case 'movimientos': return <ModuloMovimientos condominioId={condominioId} />;
      case 'vehiculos': return <ModuloVehiculos condominioId={condominioId} />;
      case 'incidencias': return <ModuloIncidencias condominioId={condominioId} />;
      case 'panico': return <ModuloPanico condominioId={condominioId} />;
      case 'turnos': return <ModuloTurnos condominioId={condominioId} />;
      case 'lugares': return <ModuloLugares condominioId={condominioId} />;
      case 'camaras': return <ModuloCamaras condominioId={condominioId} />;
      case 'comunicacion': return <ModuloComunicacion condominioId={condominioId} />;
      case 'auditoria': return <ModuloAuditoria condominioId={condominioId} />;
      default:
        return <div className="wg-card"><EmptyState icono={UsersRound} titulo="Módulo no disponible" descripcion="Este módulo todavía no está habilitado en el panel." /></div>;
    }
  };

  return (
    <AppLayout
      grupos={grupos}
      moduloActivo={modulo}
      onModulo={setModulo}
      condominios={condos.datos}
      condominioId={condominioId}
      // GUARDAMOS EN LA LIBRETITA CADA VEZ QUE EL USUARIO CAMBIA DE CONDOMINIO
      onCondominio={(id) => {
        setCondominioId(id);
        localStorage.setItem('condominioActivo', id);
      }}
      usuario={{ nombre: 'Marcela Opazo', rol: 'Administrador' }}
      alertasActivas={activas}
    >
      <div key={`${modulo}-${condominioId}`}>{render()}</div>
    </AppLayout>
  );
}