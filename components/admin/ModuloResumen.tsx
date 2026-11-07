'use client';
import React, { useState, useEffect } from 'react';
import { Activity, AlertOctagon, ArrowDownToLine, ArrowUpFromLine, Camera, CarFront, ClipboardList, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { GraficoMovimientos, GraficoCobertura, GraficoCategorias, GraficoRespuesta } from './Graficos';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import { SkeletonBento } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { PageHeader } from '../ui/PageHeader';
import { useToasts } from '../ui/Toasts';
import type { AlertaPanico, Camara, Incidencia, Movimiento, Puesto, Visita, Turno } from '../../lib/types';

interface Datos {
  panicos: AlertaPanico[];
  puestos: Puesto[];
  incidencias: Incidencia[];
  visitas: Visita[];
  camaras: Camara[];
  movimientos: Movimiento[];
  turnos: Turno[];
}
const VACIO: Datos = { panicos: [], puestos: [], incidencias: [], visitas: [], camaras: [], movimientos: [], turnos: [] };

export function ModuloResumen({ condominioId, onModulo }: { condominioId: string; onModulo: (id: string) => void }) {
  const { demo } = useToasts();
  const { datos, cargando, error, recargar } = useServicio<Datos>(
    async () => {
      const [panicos, puestos, incidencias, visitas, camaras, movimientos, turnos] = await Promise.all([
        servicios.alertasPanico(condominioId), servicios.puestos(condominioId), servicios.incidencias(condominioId),
        servicios.visitas(condominioId), servicios.camaras(condominioId), servicios.movimientos(condominioId),
        servicios.turnos(condominioId)
      ]);
      return { panicos, puestos, incidencias, visitas, camaras, movimientos, turnos };
    },
    VACIO,
    [condominioId],
  );

  const [indiceCarrusel, setIndiceCarrusel] = useState(0);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<Puesto | null>(null);

  const puestosConFoto = datos.puestos.filter(p => p.foto_guardia_actual);

  useEffect(() => {
    if (puestosConFoto.length <= 1) return;
    const intervalo = setInterval(() => {
      setIndiceCarrusel((prev) => (prev + 1) % puestosConFoto.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [puestosConFoto.length]);

  if (error) return <ErrorState mensaje={error} onReintentar={recargar} />;
  if (cargando) return (<><PageHeader titulo="Resumen operativo" descripcion="Cargando estado del condominio…" /><SkeletonBento /></>);

  const activas = datos.panicos.filter((p) => p.estado === 'Activa');
  
  // 🔥 ARREGLO DE LA RUEDA: Requeridos son los puestos, Cubiertos son los que tienen guardia asignado
  const requeridos = datos.puestos.length;
  const cubiertos = datos.puestos.filter(p => p.nombre_guardia_actual || p.foto_guardia_actual).length;

  const dentro = datos.visitas.filter((v) => v.estado === 'En el condominio').length;
  const abiertas = datos.incidencias.filter((i) => i.estado === 'Abierta' || i.estado === 'En revisión');
  const criticas = abiertas.filter((i) => i.severidad === 'Crítica' || i.severidad === 'Alta').length;
  const camOk = datos.camaras.filter((c) => c.estado === 'En línea').length;
  const qrHoy = datos.visitas.filter((v) => v.qrCodigo).length;
  const qrUsados = datos.visitas.filter((v) => v.qrCodigo && (v.estado === 'En el condominio' || v.estado === 'Finalizada')).length;

  const horas = Array.from({ length: 12 }, (_, i) => (i + 7).toString().padStart(2, '0'));
  const datosMovimientos = horas.map(hora => {
    const entradas = datos.movimientos.filter(m => m.hora.startsWith(hora) && m.tipo === 'Entrada').length;
    const salidas = datos.movimientos.filter(m => m.hora.startsWith(hora) && m.tipo === 'Salida').length;
    return { hora, entradas, salidas };
  });

  const categoriasUnicas = Array.from(new Set(datos.incidencias.map(i => i.categoria)));
  const datosCategorias = categoriasUnicas.map(cat => ({
    categoria: cat,
    total: datos.incidencias.filter(i => i.categoria === cat).length
  }));

  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const datosRespuesta = diasSemana.map(dia => ({ dia, segundos: 0 }));

  const puestoActual = puestosConFoto[indiceCarrusel % (puestosConFoto.length || 1)];

  return (
    <div>
      <PageHeader
        titulo="Resumen operativo"
        descripcion="Lo que requiere tu atención ahora en este condominio."
        vivo="Actualizado hace unos segundos · datos reales"
        acciones={<button type="button" className="wg-btn" onClick={() => demo('Reporte diario exportado')}>Exportar reporte del día</button>}
      />

      <div className="wg-bento">
        <div className={`wg-card ${activas.length > 0 ? 'is-alert wg-pulse-ring' : 'is-ok'} wg-span-2`}>
          <div className="wg-card-head">
            <span className="wg-card-title"><b>Alertas de pánico activas</b></span>
            <ShieldAlert size={18} style={{ color: activas.length > 0 ? 'var(--destructive)' : 'var(--primary)' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <div className="wg-metric" style={{ marginTop: 0, fontSize: 44 }}>{activas.length}</div>
            {activas[0] ? (
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{activas[0].origen}</div>
                <div className="wg-metric-hint" style={{ marginTop: 3 }}>{activas[0].ubicacion}</div>
              </div>
            ) : <div className="wg-metric-hint">Sin alertas activas. Todo en orden.</div>}
          </div>
          {activas[0] ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button type="button" className="wg-btn is-danger" onClick={() => onModulo('panico')}>Atender alerta</button>
            </div>
          ) : null}
        </div>

        <MetricCard
          etiqueta="Puestos cubiertos"
          valor={`${cubiertos}/${requeridos}`}
          icono={ShieldCheck}
          tono={cubiertos < requeridos ? 'aviso' : 'ok'}
          pista={cubiertos < requeridos ? <span>Faltan guardias por relevar</span> : <span>Dotación completa</span>}
          extra={<div className={`wg-bar ${cubiertos < requeridos ? 't-warn' : ''}`} style={{ marginTop: 12 }}><i style={{ width: `${requeridos ? (cubiertos / requeridos) * 100 : 0}%` }} /></div>}
        />
        <MetricCard
          etiqueta="Visitas dentro ahora"
          valor={dentro}
          icono={Users}
          pista={<span>{datos.visitas.filter((v) => v.estado === 'Autorizada').length} autorizadas por llegar</span>}
        />

        <MetricCard
          etiqueta="Incidencias abiertas"
          valor={abiertas.length}
          icono={ClipboardList}
          tono={criticas > 0 ? 'alerta' : 'neutro'}
          pista={<span>{criticas} de severidad alta o crítica</span>}
        />
        <MetricCard
          etiqueta="QR usados"
          valor={`${qrUsados}/${qrHoy}`}
          icono={Activity}
          pista={<span>{qrHoy - qrUsados} aún sin utilizar</span>}
        />
        
        <div 
          className="wg-card" 
          style={{ overflow: 'hidden', cursor: 'pointer' }}
          onClick={() => puestoActual && setFotoSeleccionada(puestoActual)}
        >
          <div className="wg-card-head">
            <span className="wg-card-title"><b>Guardias en turno</b></span>
          </div>
          {!puestoActual ? (
            <p className="wg-help">Ningún guardia ha marcado relevo.</p>
          ) : (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img 
                src={puestoActual.foto_guardia_actual || ''} 
                alt="Guardia" 
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} 
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{puestoActual.nombre_guardia_actual}</div>
                <div className="wg-cell-sub">Puesto: {puestoActual.nombre}</div>
                <div className="wg-cell-sub wg-mono" style={{ fontSize: 11 }}>
                  {puestoActual.hora_relevo ? new Date(puestoActual.hora_relevo).toLocaleTimeString() : ''}
                </div>
              </div>
            </div>
          )}
        </div>

        <MetricCard
          etiqueta="Vehículos autorizados dentro"
          valor={datos.movimientos.filter((m) => m.patente && m.tipo === 'Entrada').length}
          icono={CarFront}
          pista={<span>Entradas con patente registradas hoy</span>}
        />
      </div>

      <div className="wg-grid-2 wg-mt">
        <div className="wg-card">
          <div className="wg-card-head">
            <span className="wg-card-title"><b>Movimientos por hora</b></span>
            <span style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--muted-foreground)' }}>
              <span><ArrowDownToLine size={12} style={{ color: 'var(--primary)', verticalAlign: -2 }} /> Entradas</span>
              <span><ArrowUpFromLine size={12} style={{ color: 'var(--muted-foreground)', verticalAlign: -2 }} /> Salidas</span>
            </span>
          </div>
          <GraficoMovimientos data={datosMovimientos} />
        </div>
        <div className="wg-card">
          <div className="wg-card-head"><span className="wg-card-title"><b>Cobertura de puestos</b></span></div>
          <GraficoCobertura cubiertos={cubiertos} requeridos={requeridos} />
          
          {/* 🔥 CARRUSEL DE PUESTOS */}
          <div style={{ marginTop: 12, display: 'flex', overflowX: 'auto', gap: 8, paddingBottom: 8 }}>
            {datos.puestos.map((p) => (
              <div key={`cob-${p.id}`} style={{ minWidth: 100, padding: '8px 12px', background: 'var(--secondary)', borderRadius: 8, textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.nombre}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4, color: p.nombre_guardia_actual ? 'var(--success)' : 'var(--muted-foreground)' }}>
                  {p.nombre_guardia_actual ? '1/1' : '0/1'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wg-grid-3 wg-mt">
        <div className="wg-card">
          <div className="wg-card-head"><span className="wg-card-title"><b>Incidencias por categoría</b></span></div>
          <GraficoCategorias data={datosCategorias} />
        </div>
        <div className="wg-card">
          <div className="wg-card-head"><span className="wg-card-title"><b>Tiempo de respuesta a alertas</b></span></div>
          <GraficoRespuesta data={datosRespuesta} />
          <p className="wg-help" style={{ marginTop: 6 }}>Promedio de la semana: 0 min. (Sin datos).</p>
        </div>
        <div className="wg-card">
          <div className="wg-card-head">
            <span className="wg-card-title"><b>Actividad reciente</b></span>
            <button type="button" className="wg-btn is-sm is-ghost" onClick={() => onModulo('movimientos')}>Ver todo</button>
          </div>
          <div className="wg-feed">
            {datos.movimientos.slice(0, 5).map((m) => (
              <div key={`feed-${m.id}`} className="wg-feed-item">
                <div className={`wg-feed-icon ${m.tipo === 'Entrada' ? 't-ok' : ''}`}>
                  {m.tipo === 'Entrada' ? <ArrowDownToLine size={15} /> : <ArrowUpFromLine size={15} />}
                </div>
                <div className="wg-feed-main">
                  <div className="wg-feed-title">{m.persona}</div>
                  <div className="wg-feed-meta">{m.tipo} · {m.unidadCodigo} · {m.puesto}</div>
                </div>
                <span className="wg-feed-time">{m.hora}</span>
              </div>
            ))}
            {datos.movimientos.length === 0 && <p className="wg-help">No hay movimientos registrados.</p>}
          </div>
        </div>
      </div>

      {abiertas.length > 0 ? (
        <div className="wg-card wg-mt">
          <div className="wg-card-head">
            <span className="wg-card-title"><AlertOctagon size={15} style={{ color: 'var(--warning)' }} /> <b>Incidencias que requieren seguimiento</b></span>
            <button type="button" className="wg-btn is-sm is-ghost" onClick={() => onModulo('incidencias')}>Ir a incidencias</button>
          </div>
          <div className="wg-feed">
            {abiertas.slice(0, 4).map((i) => (
              <div key={`seg-${i.id}`} className="wg-feed-item">
                <div className={`wg-feed-icon ${i.severidad === 'Crítica' || i.severidad === 'Alta' ? 't-bad' : 't-warn'}`}><AlertOctagon size={15} /></div>
                <div className="wg-feed-main">
                  <div className="wg-feed-title">{i.titulo}</div>
                  <div className="wg-feed-meta">{i.lugar} · responsable: {i.responsable}</div>
                </div>
                <Badge texto={i.severidad} />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Modal
        abierto={fotoSeleccionada !== null}
        onCerrar={() => setFotoSeleccionada(null)}
        titulo={fotoSeleccionada?.nombre_guardia_actual || 'Guardia'}
        descripcion={`Puesto: ${fotoSeleccionada?.nombre || ''}`}
      >
        {fotoSeleccionada && (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={fotoSeleccionada.foto_guardia_actual || ''} 
              alt="Guardia" 
              style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 12 }} 
            />
            <div style={{ marginTop: 16, textAlign: 'left' }}>
              <dl className="wg-kv">
                <dt>Guardia</dt><dd style={{ fontWeight: 600 }}>{fotoSeleccionada.nombre_guardia_actual}</dd>
                <dt>Puesto</dt><dd>{fotoSeleccionada.nombre}</dd>
                <dt>Hora de entrada</dt><dd className="wg-mono">{fotoSeleccionada.hora_relevo ? new Date(fotoSeleccionada.hora_relevo).toLocaleString() : '-'}</dd>
              </dl>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}