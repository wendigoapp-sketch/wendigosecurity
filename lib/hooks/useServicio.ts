
'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface EstadoServicio<T> {
  datos: T;
  cargando: boolean;
  error: string | null;
  recargar: () => void;
}

export function useServicio<T>(
  fn: () => Promise<T>,
  inicial: T,
  deps: ReadonlyArray<unknown>
): EstadoServicio<T> {
  const [datos, setDatos] = useState<T>(inicial);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let vivo = true;

    const cargar = async () => {
      try {
        const d = await fnRef.current();
        if (vivo) {
          setDatos(d);
          setError(null);
          setCargando(false);
        }
      } catch {
        if (vivo) {
          setError('No se pudieron cargar los datos.');
          setCargando(false);
        }
      }
    };

    cargar();
    const intervalo = setInterval(cargar, 5000);

    return () => {
      vivo = false;
      clearInterval(intervalo);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const recargar = useCallback(() => setTick(t => t + 1), []);

  return { datos, cargando, error, recargar };
}
