'use client';
import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine, Download, Route } from 'lucide-react';
import { DataTable, type Columna } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { PageHeader } from '../ui/PageHeader';
import { SkeletonTabla } from '../ui/LoadingSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { useToasts } from '../ui/Toasts';
import { servicios } from '../../lib/services';
import { useServicio } from '../../lib/hooks/useServicio';
import type { Movimiento } from '../../lib/types';

export function ModuloMovimientos({ condominioId }: { condominioId: string }) {
  const { demo } = useToasts();
  const m = useServicio<Movimiento[]>(() => servicios.movimientos(condominioId), [], [condominioId]);

  const columnas: Columna<Movimiento>[] = [
    { clave: 'hora', titulo: 'Hora', ordenable: true, valor: (x) => x.hora, render: (x) => <span className="wg-mono wg-cell-main">{x.hora}</span> },
    { clave: 'tipo', titulo: 'Tipo', render: (x) => (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>{x.tipo === 'Entrada' ? <ArrowDownToLine size={14} style={{ color: 'var(--primary)' }} /> : <ArrowUpFromLine size={14} style={{ color: 'var(--muted-foreground)' }} />}{x.tipo}</span>) },
    { clave: 'persona', titulo: 'Persona', ordenable: true, valor: (x) => x.persona, render: (x) => x.persona },
    { clave: 'categoria', titulo: 'Categoría', render: (x) => <Badge texto={x.categoria} tono="info" punto={false} /> },
    { clave: 'unidad', titulo: 'Unidad', render: (x) => <span className="wg-mono">{x.unidadCodigo}</span> },
    { clave: 'patente', titulo: 'Patente', render: (x) => (x.patente ? <span className="wg-mono">{x.patente}</span> : <span style={{ color: 'var(--muted-foreground)' }}>—</span>) },
    { clave: 'puesto', titulo: 'Puesto', render: (x) => x.puesto },
    { clave: 'guardia', titulo: 'Registrado por', render: (x) => x.guardia },
    { clave: 'metodo', titulo: 'Método', render: (x) => <Badge texto={x.metodo} tono={x.metodo === 'QR' ? 'ok' : 'mute'} punto={false} /> },
  ];

  if (m.error) return <ErrorState mensaje={m.error} onReintentar={m.recargar} />;
  const entradas = m.datos.filter((x) => x.tipo === 'Entrada').length;

  return (
    <div>
      <PageHeader
        titulo="Movimientos"
        descripcion="Bitácora de entradas y salidas de personas y vehículos por puesto de control."
        vivo={`${entradas} entradas y ${m.datos.length - entradas} salidas registradas hoy`}
        acciones={<button type="button" className="wg-btn" onClick={() => demo('Movimientos exportados a CSV (simulado)')}><Download size={14} /> Exportar CSV</button>}
      />
      {m.cargando ? <SkeletonTabla columnas={9} /> : (
        <DataTable
          filas={m.datos}
          columnas={columnas}
          idDe={(x) => x.id}
          textoBusqueda={(x) => `${x.persona} ${x.unidadCodigo} ${x.patente ?? ''} ${x.guardia} ${x.puesto}`}
          filtros={[
            { clave: 'tipo', etiqueta: 'Tipo', opciones: ['Entrada', 'Salida'], coincide: (x, v) => x.tipo === v },
            { clave: 'categoria', etiqueta: 'Categoría', opciones: ['Visita', 'Residente', 'Proveedor', 'Vehículo'], coincide: (x, v) => x.categoria === v },
            { clave: 'puesto', etiqueta: 'Puesto', opciones: ['Portería principal', 'Portería vehicular'], coincide: (x, v) => x.puesto === v },
            { clave: 'metodo', etiqueta: 'Método', opciones: ['QR', 'Manual', 'Residente'], coincide: (x, v) => x.metodo === v },
          ]}
          vacioIcono={Route}
          vacioTitulo="Sin movimientos en este periodo"
          vacioDescripcion="Cada entrada o salida que registre un guardia en portería quedará listada aquí."
          placeholderBusqueda="Buscar persona, unidad, patente o guardia…"
          porPaginaInicial={15}
        />
      )}
    </div>
  );
}