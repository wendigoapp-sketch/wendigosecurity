'use client';
import React, { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Ban, CheckCircle2, ScanLine, Search, XCircle, Camera } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { SkeletonLista } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { Modal } from '../ui/Modal';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { AutorizacionQR, Movimiento, Visita, Guardia, Puesto } from '../../lib/types';
import dynamic from 'next/dynamic';

const BarcodeScanner = dynamic(() => import('react-qr-barcode-scanner'), { ssr: false });

type Veredicto = { tono: 'ok' | 'bad' | 'warn'; titulo: string; detalle: string } | null;

function evaluar(v: Visita, qr: AutorizacionQR | undefined): Veredicto {
  if (v.estado === 'Rechazada') return { tono: 'bad', titulo: 'Acceso denegado', detalle: 'Esta visita fue rechazada. No permitir el ingreso y avisar al residente.' };
  if (v.estado === 'Vencida') return { tono: 'bad', titulo: 'Autorización vencida', detalle: 'La ventana horaria terminó. Solicita al residente una nueva autorización.' };
  if (v.estado === 'Finalizada') return { tono: 'warn', titulo: 'Visita ya finalizada', detalle: 'Esta visita ya ingresó y salió. Requiere una nueva autorización para volver a entrar.' };
  if (qr && qr.estado === 'Revocado') return { tono: 'bad', titulo: 'QR revocado', detalle: 'El residente o la administración revocó este código. No permitir el ingreso.' };
  if (qr && qr.estado === 'Vencido') return { tono: 'bad', titulo: 'QR vencido', detalle: 'El código ya no es válido. Contacta al residente.' };
  if (v.estado === 'Programada') return { tono: 'warn', titulo: 'Visita sin QR emitido', detalle: 'Está programada pero aún no tiene QR. Confirma la identidad con el residente por citófono antes de dejarla pasar.' };
  if (v.estado === 'En el condominio') return { tono: 'ok', titulo: 'Visita dentro del condominio', detalle: 'Ya ingresó. Puedes registrar su salida cuando se retire.' };
  return { tono: 'ok', titulo: 'Autorización válida', detalle: 'La visita está autorizada y dentro de su ventana horaria. Verifica la cédula y registra el ingreso.' };
}

export function GdAcceso({ condominioId, guardiaId }: { condominioId: string, guardiaId: string | null }) {
  const { demo, notificar } = useToasts();

  const v = useServicio<Visita[]>(() => servicios.visitas(condominioId), [], [condominioId]);
  const q = useServicio<AutorizacionQR[]>(() => servicios.autorizacionesQR(condominioId), [], [condominioId]);
  const mv = useServicio<Movimiento[]>(() => servicios.movimientos(condominioId), [], [condominioId]);

  const [busqueda, setBusqueda] = useState('');
  const [seleccion, setSeleccion] = useState<Visita | null>(null);
  const [patente, setPatente] = useState('');
  const [escaner, setEscaner] = useState(false);
  const [registros, setRegistros] = useState<Array<{ id: string; texto: string; tipo: 'Entrada' | 'Salida' }>>([]);

  const [relevoAbierto, setRelevoAbierto] = useState(false);
  const [fotoRelevo, setFotoRelevo] = useState<File | null>(null);
  const [guardiaLlegandoId, setGuardiaLlegandoId] = useState('');
  const [puestoSeleccionado, setPuestoSeleccionado] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const puestos = useServicio<Puesto[]>(() => servicios.puestos(condominioId), [], [condominioId]);
  const guardiasLista = useServicio<Guardia[]>(() => servicios.guardias(condominioId), [], [condominioId]);

  // Identificamos el puesto asignado al guardia que inició sesión.
  const guardiaActual = guardiasLista.datos.find(
    (g) => g.id === guardiaId
  );

  // Solo permitimos compañeros que tengan asignado el mismo puesto.
  const companerosDisponibles = guardiasLista.datos.filter(
    (g) =>
      g.id !== guardiaId &&
      g.puestoId === puestoSeleccionado
  );

  const filtradas = useMemo(() => {
    const t = busqueda.trim().toLowerCase();
    if (!t) return v.datos.filter((x) => x.estado === 'Autorizada' || x.estado === 'Programada' || x.estado === 'En el condominio');
    return v.datos.filter((x) => `${x.visitante} ${x.rut} ${x.unidadCodigo} ${x.vehiculoPatente ?? ''} ${x.qrCodigo ?? ''}`.toLowerCase().includes(t));
  }, [v.datos, busqueda]);

  if (v.error) return <ErrorState mensaje={v.error} onReintentar={v.recargar} />;

  const qrDe = (x: Visita) => q.datos.find((y) => y.codigo === x.qrCodigo);
  const veredicto = seleccion ? evaluar(seleccion, qrDe(seleccion)) : null;
  const puedeEntrar = veredicto?.tono === 'ok' && seleccion?.estado !== 'En el condominio';
  const puedeSalir = seleccion?.estado === 'En el condominio';

  const registrar = (tipo: 'Entrada' | 'Salida') => {
    if (!seleccion) return;
    const placa = patente.trim().toUpperCase() || seleccion.vehiculoPatente || '';
    setRegistros((r) => [{ id: `reg-${r.length + 1}`, texto: `${seleccion.visitante}${placa ? ` · ${placa}` : ''}`, tipo }, ...r]);
    notificar({ titulo: `${tipo} registrada (demostración)`, detalle: `${seleccion.visitante}. No se guardó en ninguna base de datos.`, tipo: 'warn' });
    setSeleccion(null);
    setPatente('');
  };

  const hacerRelevo = async () => {
    if (!fotoRelevo || !guardiaLlegandoId || !puestoSeleccionado) {
      notificar({
        titulo: 'Faltan datos',
        detalle: 'Elegí al compañero que llega, el puesto y sacale una foto',
        tipo: 'bad'
      });
      return;
    }

    // Verificamos que el guardia actual y el compañero pertenezcan al mismo puesto.
    const guardiaLlegando = guardiasLista.datos.find(
      (g) => g.id === guardiaLlegandoId
    );

    if (
      !guardiaActual?.puestoId ||
      puestoSeleccionado !== guardiaActual.puestoId ||
      !guardiaLlegando ||
      guardiaLlegando.puestoId !== puestoSeleccionado
    ) {
      notificar({
        titulo: 'Puesto incorrecto',
        detalle: 'Solo podés registrar el relevo de un compañero asignado a tu mismo puesto.',
        tipo: 'bad'
      });
      return;
    }

    setSubiendo(true);

    try {
      await servicios.registrarRelevo(
        puestoSeleccionado,
        guardiaLlegandoId,
        fotoRelevo,
        guardiaId
      );

      notificar({
        titulo: '¡Relevo registrado!',
        detalle: 'El admin ya puede ver el cambio de turno',
        tipo: 'ok'
      });

      setRelevoAbierto(false);
      setFotoRelevo(null);
      setGuardiaLlegandoId('');
      setPuestoSeleccionado('');

    } catch (e: unknown) {
      notificar({
        titulo: 'Error',
        detalle: e instanceof Error ? e.message : 'No se pudo registrar el relevo.',
        tipo: 'bad'
      });
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="wg-btn is-primary is-lg is-block"
        style={{ marginBottom: 16, gap: 10 }}
        onClick={() => setRelevoAbierto(true)}
      >
        <Camera size={22} /> Anotar relevo del compañero
      </button>

      <div className="wg-action-grid" style={{ marginBottom: 16, gridTemplateColumns: '1fr 1fr' }}>
        <button type="button" className="wg-btn is-xl is-primary" onClick={() => setEscaner(true)} style={{ flexDirection: 'column', gap: 8, padding: 16 }}>
          <ScanLine size={32} /> <span>Escanear QR</span>
        </button>
        <button type="button" className="wg-btn is-xl" onClick={() => { const el = document.getElementById('gd-buscar'); if (el) el.focus(); }} style={{ flexDirection: 'column', gap: 8, padding: 16 }}>
          <Search size={32} /> <span>Buscar</span>
        </button>
        <button type="button" className="wg-btn is-xl" onClick={() => demo('Registro de visita sin QR (simulado)')} style={{ flexDirection: 'column', gap: 8, padding: 16 }}>
          <ArrowDownToLine size={32} /> <span>Sin QR</span>
        </button>
        <button type="button" className="wg-btn is-xl" onClick={() => demo('Registro de proveedor (simulado)')} style={{ flexDirection: 'column', gap: 8, padding: 16 }}>
          <ArrowUpFromLine size={32} /> <span>Proveedor</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section>
          <div className="wg-field-search" style={{ maxWidth: 'none', marginBottom: 12 }}>
            <Search size={16} />
            <input id="gd-buscar" style={{ height: 52, fontSize: 16, borderRadius: 12, paddingLeft: 40 }} value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, RUT, unidad, patente…" aria-label="Buscar visita" />
          </div>

          <div className="wg-section-label" style={{ marginTop: 6 }}>
            {busqueda ? `Resultados (${filtradas.length})` : `Visitas esperadas y dentro (${filtradas.length})`}
          </div>

          {v.cargando ? <SkeletonLista /> : filtradas.length === 0 ? (
            <div className="wg-card">
              <EmptyState icono={Search} titulo="Sin coincidencias" descripcion="No hay visitas con ese dato. Pide al visitante su cédula y confirma con el residente por citófono." />
            </div>
          ) : filtradas.map((x) => (
            <button key={`gv-${x.id}`} type="button" className={`wg-visit-row ${seleccion?.id === x.id ? 'is-active' : ''}`} onClick={() => { setSeleccion(x); setPatente(x.vehiculoPatente ?? ''); }}>
              <div className="wg-feed-icon">
                {x.qrCodigo ? <CheckCircle2 size={17} style={{ color: 'var(--success)' }} /> : <Ban size={17} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }} className="wg-cell-trunc">{x.visitante}</div>
                <div className="wg-cell-sub">Unidad <span className="wg-mono">{x.unidadCodigo}</span> · {x.motivo}</div>
              </div>
              <Badge texto={x.estado} />
            </button>
          ))}
        </section>

        <section>
          <div className="wg-section-label" style={{ marginTop: 6 }}>Validación y registro</div>

          {!seleccion ? (
            <div className="wg-card">
              <EmptyState icono={ScanLine} titulo="Selecciona o escanea una visita" descripcion="Verás aquí si la autorización es válida y podrás registrar la entrada o salida." />
            </div>
          ) : (
            <div className="wg-fade-in">
              <div className={`wg-verdict t-${veredicto?.tono ?? 'warn'}`}>
                {veredicto?.tono === 'ok' ? <CheckCircle2 size={30} style={{ color: 'var(--success)', flexShrink: 0 }} /> : veredicto?.tono === 'bad' ? <XCircle size={30} style={{ color: 'var(--destructive)', flexShrink: 0 }} /> : <Ban size={30} style={{ color: 'var(--warning)', flexShrink: 0 }} />}
                <div>
                  <b style={{ fontSize: 18 }}>{veredicto?.titulo}</b>
                  <p style={{ marginTop: 4, fontSize: 14, lineHeight: 1.5, color: 'var(--secondary-foreground)' }}>{veredicto?.detalle}</p>
                </div>
              </div>

              <div className="wg-card" style={{ marginTop: 12 }}>
                <dl className="wg-kv">
                  <dt>Visitante</dt><dd style={{ fontWeight: 600 }}>{seleccion.visitante}</dd>
                  <dt>RUT</dt><dd className="wg-mono">{seleccion.rut}</dd>
                  <dt>Destino</dt><dd><span className="wg-mono">{seleccion.unidadCodigo}</span> · {seleccion.residente}</dd>
                  <dt>Ventana</dt><dd className="wg-mono">{seleccion.ventanaDesde}</dd>
                  <dt>QR</dt><dd className="wg-mono">{seleccion.qrCodigo ?? 'Sin QR'}</dd>
                </dl>

                <div className="wg-section-label">Vehículo (opcional)</div>
                <input className="wg-input is-lg is-plate" value={patente} onChange={(e) => setPatente(e.target.value)} placeholder="ABCD-12" aria-label="Matrícula del vehículo" />
              </div>

              <div className="wg-action-grid" style={{ marginTop: 12, gridTemplateColumns: '1fr 1fr' }}>
                <button type="button" className="wg-btn is-xl is-primary" disabled={!puedeEntrar} onClick={() => registrar('Entrada')} style={{ flexDirection: 'column', gap: 8, padding: 16 }}>
                  <ArrowDownToLine size={26} /> Entrada
                </button>
                <button type="button" className="wg-btn is-xl" disabled={!puedeSalir} onClick={() => registrar('Salida')} style={{ flexDirection: 'column', gap: 8, padding: 16 }}>
                  <ArrowUpFromLine size={26} /> Salida
                </button>
              </div>

              <button type="button" className="wg-btn is-lg is-block is-ghost" style={{ marginTop: 10 }} onClick={() => { setSeleccion(null); setPatente(''); }}>
                Limpiar selección
              </button>
            </div>
          )}

          {registros.length > 0 ? (
            <>
              <div className="wg-section-label">Registrado en esta sesión (demostración)</div>
              <div className="wg-card" style={{ padding: '4px 14px' }}>
                {registros.map((r) => (
                  <div key={`gr-${r.id}`} className="wg-feed-item">
                    <div className={`wg-feed-icon ${r.tipo === 'Entrada' ? 't-ok' : ''}`}>
                      {r.tipo === 'Entrada' ? <ArrowDownToLine size={15} /> : <ArrowUpFromLine size={15} />}
                    </div>
                    <div className="wg-feed-main">
                      <div className="wg-feed-title">{r.texto}</div>
                      <div className="wg-feed-meta">{r.tipo} · Ahora</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </section>
      </div>

      <div className="wg-section-label">Últimos movimientos del puesto</div>
      <div className="wg-card" style={{ padding: '4px 14px' }}>
        {mv.cargando ? <div className="wg-skel" style={{ height: 60, margin: '10px 0' }} /> : mv.datos.slice(0, 5).map((m) => (
          <div key={`gm-${m.id}`} className="wg-feed-item">
            <div className={`wg-feed-icon ${m.tipo === 'Entrada' ? 't-ok' : ''}`}>
              {m.tipo === 'Entrada' ? <ArrowDownToLine size={15} /> : <ArrowUpFromLine size={15} />}
            </div>
            <div className="wg-feed-main">
              <div className="wg-feed-title">{m.persona}</div>
              <div className="wg-feed-meta">{m.tipo} · {m.unidadCodigo}{m.patente ? ` · ${m.patente}` : ''} · {m.metodo}</div>
            </div>
            <span className="wg-feed-time">{m.hora}</span>
          </div>
        ))}
      </div>

      <Modal
        abierto={escaner}
        onCerrar={() => setEscaner(false)}
        titulo="Escanear código QR"
        descripcion="Apuntá la cámara al QR del visitante."
        ancho
        pie={
          <button type="button" className="wg-btn" onClick={() => setEscaner(false)}>Cerrar</button>
        }
      >
        <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000' }}>
          <BarcodeScanner
            width="100%"
            height={300}
            onUpdate={(err, result) => {
              if (result) {
                const codigoEscaneado = result.getText();
                setEscaner(false);
                const visitaEncontrada = v.datos.find((x) => x.qrCodigo === codigoEscaneado);

                if (visitaEncontrada) {
                  setSeleccion(visitaEncontrada);
                  setPatente(visitaEncontrada.vehiculoPatente ?? '');
                  notificar({ titulo: 'QR válido', detalle: `Visita de ${visitaEncontrada.visitante}`, tipo: 'ok' });
                } else {
                  notificar({ titulo: 'QR no válido', detalle: 'No se encontró una visita con ese código.', tipo: 'bad' });
                }
              }
            }}
          />
        </div>

        <p className="wg-help" style={{ textAlign: 'center', marginTop: 12 }}>
          Si la cámara no funciona, usá el botón &quot;Buscar&quot; para encontrar la visita manualmente.
        </p>
      </Modal>

      <Modal
        abierto={relevoAbierto}
        onCerrar={() => setRelevoAbierto(false)}
        titulo="Anotar relevo del compañero"
        descripcion="Seleccioná tu puesto, elegí al compañero que llega y sacale una foto."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <select
            className="wg-input is-lg"
            value={puestoSeleccionado}
            onChange={(e) => {
              setPuestoSeleccionado(e.target.value);
              setGuardiaLlegandoId('');
            }}
          >
            <option value="">Seleccioná tu puesto…</option>
            {puestos.datos
              .filter((p) => p.id === guardiaActual?.puestoId)
              .map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
          </select>

          <select
            className="wg-input is-lg"
            value={guardiaLlegandoId}
            onChange={(e) => {
              const id = e.target.value;
              setGuardiaLlegandoId(id);
            }}
            disabled={!puestoSeleccionado}
          >
            <option value="">Seleccioná al compañero que llega…</option>
            {companerosDisponibles.map((g) => (
              <option key={g.id} value={g.id}>{g.nombre}</option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="wg-input is-lg"
            onChange={(e) => setFotoRelevo(e.target.files?.[0] || null)}
          />

          <button
            type="button"
            className="wg-btn is-primary is-lg is-block"
            onClick={hacerRelevo}
            disabled={subiendo}
          >
            {subiendo ? 'Subiendo...' : 'Registrar relevo'}
          </button>
        </div>
      </Modal>
    </div>
  );
}