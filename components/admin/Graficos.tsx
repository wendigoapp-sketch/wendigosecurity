'use client';
import React from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

function TooltipCaja({ active, payload, label, sufijo }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string; sufijo?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 11px', fontSize: 12.5, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={`tt-${p.name}`} style={{ color: 'var(--muted-foreground)' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: p.color, marginRight: 6 }} />
          {p.name}: <b style={{ color: 'var(--foreground)' }}>{p.value}{sufijo ?? ''}</b>
        </div>
      ))}
    </div>
  );
}

export function GraficoMovimientos({ data }: { data: { hora: string; entradas: number; salidas: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} barGap={3}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="hora" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={30} />
        <Tooltip content={<TooltipCaja />} cursor={{ fill: 'var(--secondary)' }} />
        <Bar dataKey="entradas" name="Entradas" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="salidas" name="Salidas" fill="var(--muted-foreground)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficoCobertura({ cubiertos, requeridos }: { cubiertos: number; requeridos: number }) {
  const faltan = Math.max(0, requeridos - cubiertos);
  const datos = [
    { nombre: 'Cubiertos', valor: cubiertos, color: 'var(--primary)' },
    { nombre: 'Sin cubrir', valor: faltan, color: 'var(--destructive)' },
  ];
  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={170}>
        <PieChart>
          <Pie data={datos} dataKey="valor" nameKey="nombre" innerRadius={52} outerRadius={72} paddingAngle={faltan > 0 ? 3 : 0} stroke="none">
            {datos.map((d) => <Cell key={`cell-${d.nombre}`} fill={d.color} />)}
          </Pie>
          <Tooltip content={<TooltipCaja />} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="wg-tnum" style={{ fontSize: 26, fontWeight: 700 }}>{requeridos ? Math.min(100, Math.round((cubiertos / requeridos) * 100)) : 0}%</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted-foreground)' }}>dotación</div>
        </div>
      </div>
    </div>
  );
}

export function GraficoCategorias({ data }: { data: { categoria: string; total: number }[] }) {
  const ordenado = [...data].sort((a, b) => b.total - a.total);
  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={ordenado} layout="vertical" margin={{ left: 8 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
        <YAxis type="category" dataKey="categoria" width={120} tickLine={false} axisLine={false} tick={{ fill: 'var(--secondary-foreground)', fontSize: 12 }} />
        <Tooltip content={<TooltipCaja />} cursor={{ fill: 'var(--secondary)' }} />
        <Bar dataKey="total" name="Incidencias" fill="var(--warning)" radius={[0, 4, 4, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GraficoRespuesta({ data }: { data: { dia: string; segundos: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="grad-respuesta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="dia" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} width={34} />
        <Tooltip content={<TooltipCaja sufijo=" s" />} />
        <Area type="monotone" dataKey="segundos" name="Respuesta" stroke="var(--primary)" strokeWidth={2} fill="url(#grad-respuesta)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}