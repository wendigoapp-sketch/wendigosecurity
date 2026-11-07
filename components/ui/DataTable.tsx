'use client';
import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Columns3, Search } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { EmptyState } from './EmptyState';

export interface Columna<T> {
  clave: string;
  titulo: string;
  render: (fila: T) => React.ReactNode;
  valor?: (fila: T) => string | number;
  ordenable?: boolean;
  oculta?: boolean;
  alinear?: 'left' | 'right';
}

export interface FiltroSelect<T> {
  clave: string;
  etiqueta: string;
  opciones: string[];
  coincide: (fila: T, valor: string) => boolean;
}

export interface AccionFila<T> {
  etiqueta: string;
  icono: LucideIcon;
  onClick: (fila: T) => void;
  peligro?: boolean;
}

interface Props<T> {
  filas: T[];
  columnas: Columna<T>[];
  idDe: (fila: T) => string;
  textoBusqueda: (fila: T) => string;
  filtros?: FiltroSelect<T>[];
  acciones?: AccionFila<T>[];
  onFila?: (fila: T) => void;
  filaSeleccionadaId?: string | null;
  vacioIcono: LucideIcon;
  vacioTitulo: string;
  vacioDescripcion: string;
  vacioAccion?: React.ReactNode;
  placeholderBusqueda?: string;
  seleccionable?: boolean;
  accionesMasivas?: (ids: string[], limpiar: () => void) => React.ReactNode;
  herramientas?: React.ReactNode;
  porPaginaInicial?: number;
}

export function DataTable<T>({
  filas, columnas, idDe, textoBusqueda, filtros = [], acciones = [], onFila, filaSeleccionadaId,
  vacioIcono, vacioTitulo, vacioDescripcion, vacioAccion, placeholderBusqueda = 'Buscar…',
  seleccionable = false, accionesMasivas, herramientas, porPaginaInicial = 8,
}: Props<T>) {
  const [busqueda, setBusqueda] = useState('');
  const [valoresFiltro, setValoresFiltro] = useState<Record<string, string>>({});
  const [orden, setOrden] = useState<{ clave: string; asc: boolean } | null>(null);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(porPaginaInicial);
  const [ocultas, setOcultas] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    columnas.forEach((c) => { if (c.oculta) init[c.clave] = true; });
    return init;
  });
  const [menuColumnas, setMenuColumnas] = useState(false);
  const [seleccion, setSeleccion] = useState<string[]>([]);

  const visibles = columnas.filter((c) => !ocultas[c.clave]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let res = filas.filter((f) => (q ? textoBusqueda(f).toLowerCase().includes(q) : true));
    filtros.forEach((flt) => {
      const v = valoresFiltro[flt.clave];
      if (v && v !== 'todos') res = res.filter((f) => flt.coincide(f, v));
    });
    if (orden) {
      const col = columnas.find((c) => c.clave === orden.clave);
      if (col?.valor) {
        const get = col.valor;
        res = [...res].sort((a, b) => {
          const va = get(a); const vb = get(b);
          const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es');
          return orden.asc ? cmp : -cmp;
        });
      }
    }
    return res;
  }, [filas, busqueda, valoresFiltro, orden, columnas, filtros, textoBusqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visiblesFilas = filtradas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);
  const todasMarcadas = visiblesFilas.length > 0 && visiblesFilas.every((f) => seleccion.includes(idDe(f)));

  const alternarOrden = (clave: string) => {
    setOrden((o) => (o && o.clave === clave ? (o.asc ? { clave, asc: false } : null) : { clave, asc: true }));
  };
  const alternarFila = (id: string) => setSeleccion((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const alternarTodas = () => {
    const ids = visiblesFilas.map(idDe);
    setSeleccion((s) => (todasMarcadas ? s.filter((x) => !ids.includes(x)) : Array.from(new Set([...s, ...ids]))));
  };

  const paginas: number[] = [];
  for (let p = Math.max(1, paginaActual - 2); p <= Math.min(totalPaginas, paginaActual + 2); p += 1) paginas.push(p);

  return (
    <div>
      <div className="wg-toolbar">
        <div className="wg-field-search">
          <Search size={15} />
          <input
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
            placeholder={placeholderBusqueda}
            aria-label="Buscar en la tabla"
          />
        </div>
        {filtros.map((flt) => (
          <select
            key={`flt-${flt.clave}`}
            className="wg-select"
            aria-label={flt.etiqueta}
            value={valoresFiltro[flt.clave] ?? 'todos'}
            onChange={(e) => { setValoresFiltro((v) => ({ ...v, [flt.clave]: e.target.value })); setPagina(1); }}
          >
            <option value="todos">{flt.etiqueta}: todos</option>
            {flt.opciones.map((o) => <option key={`opt-${flt.clave}-${o}`} value={o}>{o}</option>)}
          </select>
        ))}
        <div className="wg-spacer" />
        {herramientas}
        {columnas.length >= 7 ? (
          <div className="wg-select-wrap">
            <button type="button" className="wg-btn" onClick={() => setMenuColumnas((m) => !m)}>
              <Columns3 size={14} /> Columnas
            </button>
            {menuColumnas ? (
              <div className="wg-menu" style={{ minWidth: 220 }}>
                {columnas.map((c) => (
                  <label key={`colvis-${c.clave}`} className="wg-menu-item" style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      className="wg-check"
                      checked={!ocultas[c.clave]}
                      onChange={() => setOcultas((o) => ({ ...o, [c.clave]: !o[c.clave] }))}
                    />
                    {c.titulo}
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="wg-table-wrap">
        {filtradas.length === 0 ? (
          <EmptyState icono={vacioIcono} titulo={vacioTitulo} descripcion={vacioDescripcion} accion={vacioAccion} />
        ) : (
          <>
            <div className="wg-table-scroll">
              <table className="wg-table">
                <thead>
                  <tr>
                    {seleccionable ? (
                      <th style={{ width: 40 }}>
                        <input type="checkbox" className="wg-check" checked={todasMarcadas} onChange={alternarTodas} aria-label="Seleccionar todas las filas" />
                      </th>
                    ) : null}
                    {visibles.map((c) => {
                      const ordenada = orden?.clave === c.clave;
                      return (
                        <th
                          key={`th-${c.clave}`}
                          className={`${c.ordenable ? 'wg-th-sort' : ''} ${ordenada ? 'is-sorted' : ''}`}
                          style={{ textAlign: c.alinear === 'right' ? 'right' : 'left' }}
                          onClick={c.ordenable ? () => alternarOrden(c.clave) : undefined}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            {c.titulo}
                            {ordenada ? (orden?.asc ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : null}
                          </span>
                        </th>
                      );
                    })}
                    {acciones.length > 0 ? <th style={{ width: 1 }} /> : null}
                  </tr>
                </thead>
                <tbody>
                  {visiblesFilas.map((fila) => {
                    const id = idDe(fila);
                    return (
                      <tr
                        key={`row-${id}`}
                        className={filaSeleccionadaId === id || seleccion.includes(id) ? 'is-selected' : ''}
                        onClick={onFila ? () => onFila(fila) : undefined}
                      >
                        {seleccionable ? (
                          <td onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" className="wg-check" checked={seleccion.includes(id)} onChange={() => alternarFila(id)} aria-label="Seleccionar fila" />
                          </td>
                        ) : null}
                        {visibles.map((c) => (
                          <td key={`td-${id}-${c.clave}`} style={{ textAlign: c.alinear === 'right' ? 'right' : 'left' }}>{c.render(fila)}</td>
                        ))}
                        {acciones.length > 0 ? (
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="wg-row-actions">
                              {acciones.map((a) => (
                                <button key={`act-${id}-${a.etiqueta}`} type="button" className="wg-act" aria-label={a.etiqueta} onClick={() => a.onClick(fila)} style={a.peligro ? { color: 'var(--destructive)' } : undefined}>
                                  <a.icono size={14} />
                                  <span className="wg-tip-up">{a.etiqueta}</span>
                                </button>
                              ))}
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="wg-pager">
              <span className="wg-tnum">
                {(paginaActual - 1) * porPagina + 1}–{Math.min(paginaActual * porPagina, filtradas.length)} de {filtradas.length} registros
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Filas
                  <select className="wg-select" style={{ height: 30 }} value={porPagina} onChange={(e) => { setPorPagina(Number(e.target.value)); setPagina(1); }}>
                    {[8, 15, 30].map((n) => <option key={`pp-${n}`} value={n}>{n}</option>)}
                  </select>
                </label>
                <div className="wg-pages">
                  <button type="button" className="wg-page-btn" disabled={paginaActual === 1} onClick={() => setPagina(paginaActual - 1)} aria-label="Página anterior"><ChevronLeft size={14} /></button>
                  {paginas.map((p) => (
                    <button key={`page-${p}`} type="button" className={`wg-page-btn ${p === paginaActual ? 'is-active' : ''}`} onClick={() => setPagina(p)}>{p}</button>
                  ))}
                  <button type="button" className="wg-page-btn" disabled={paginaActual === totalPaginas} onClick={() => setPagina(paginaActual + 1)} aria-label="Página siguiente"><ChevronRight size={14} /></button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {seleccionable && seleccion.length > 0 && accionesMasivas ? (
        <div className="wg-bulkbar">
          <b className="wg-tnum">{seleccion.length} seleccionados</b>
          {accionesMasivas(seleccion, () => setSeleccion([]))}
          <button type="button" className="wg-btn is-sm is-ghost" onClick={() => setSeleccion([])}>Limpiar</button>
        </div>
      ) : null}
    </div>
  );
}