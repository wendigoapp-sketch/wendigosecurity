'use client';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface ToastItem { id: string; titulo: string; detalle?: string; tipo: 'ok' | 'bad' | 'warn'; }
interface ToastCtx { notificar: (t: Omit<ToastItem, 'id'>) => void; demo: (accion: string) => void; }

const Ctx = createContext<ToastCtx>({ notificar: () => undefined, demo: () => undefined });
export const useToasts = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const notificar = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.round(Math.random() * 1000)}`; // solo en handler, no en render
    setItems((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 3600);
  }, []);

  /** Acción demostrativa: aclara que NO se guardó nada realmente. */
  const demo = useCallback((accion: string) => {
    notificar({ titulo: accion, detalle: 'Acción de demostración: no se guardó en ninguna base de datos.', tipo: 'warn' });
  }, [notificar]);

  return (
    <Ctx.Provider value={{ notificar, demo }}>
      {children}
      <div className="wg-toasts" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`wg-toast ${t.tipo === 'bad' ? 'is-bad' : t.tipo === 'warn' ? 'is-warn' : ''}`}>
            <b>{t.titulo}</b>
            {t.detalle ? <span>{t.detalle}</span> : null}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}