import React from 'react';

/**
 * Representación visual determinista de un código QR (NO es un QR real escaneable).
 * Backend integration: sustituir por un generador real (p. ej. librería qrcode) con token firmado.
 */
function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function celdas(codigo: string): boolean[] {
  const n = 21;
  const out: boolean[] = [];
  let estado = hash(codigo) || 1;
  const finder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
    const box = (r0: number, c0: number) => {
      const rr = r - r0; const cc = c - c0;
      if (rr === 0 || rr === 6 || cc === 0 || cc === 6) return true;
      if (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) return true;
      return false;
    };
    if (inBox(0, 0)) return box(0, 0);
    if (inBox(0, n - 7)) return box(0, n - 7);
    if (inBox(n - 7, 0)) return box(n - 7, 0);
    return null;
  };
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      const f = finder(r, c);
      if (f !== null) { out.push(f); continue; }
      estado = (Math.imul(estado, 1103515245) + 12345) >>> 0;
      out.push(((estado >>> 16) & 1) === 1);
    }
  }
  return out;
}

export function QRCode({ codigo, pequeno }: { codigo: string; pequeno?: boolean }) {
  const mapa = celdas(codigo);
  return (
    <div className={`wg-qr ${pequeno ? 'is-sm' : ''}`} role="img" aria-label={`Código QR de demostración ${codigo}`}>
      {mapa.map((on, i) => <i key={`qrc-${codigo}-${i + 1}`} className={on ? '' : 'off'} />)}
    </div>
  );
}