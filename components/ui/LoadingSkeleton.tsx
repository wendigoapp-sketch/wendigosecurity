import React from 'react';

export function SkeletonTabla({ filas = 7, columnas = 6 }: { filas?: number; columnas?: number }) {
  return (
    <div className="wg-table-wrap" aria-busy="true">
      <div style={{ padding: 14 }}>
        {Array.from({ length: filas }, (_, i) => (
          <div key={`skrow-${i + 1}`} style={{ display: 'grid', gridTemplateColumns: `repeat(${columnas}, 1fr)`, gap: 14, padding: '10px 0' }}>
            {Array.from({ length: columnas }, (_, j) => (
              <div key={`skcell-${i + 1}-${j + 1}`} className="wg-skel" style={{ height: 16 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonBento() {
  return (
    <div className="wg-bento" aria-busy="true">
      {['hero', 'a', 'b', 'c', 'd', 'e'].map((k, i) => (
        <div key={`skb-${k}`} className={`wg-card ${i === 0 ? 'wg-span-2' : ''}`}>
          <div className="wg-skel" style={{ height: 14, width: '40%' }} />
          <div className="wg-skel" style={{ height: 34, width: '55%', marginTop: 16 }} />
          <div className="wg-skel" style={{ height: 12, width: '70%', marginTop: 14 }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonLista({ filas = 5 }: { filas?: number }) {
  return (
    <div aria-busy="true">
      {Array.from({ length: filas }, (_, i) => (
        <div key={`sklist-${i + 1}`} className="wg-list-card">
          <div className="wg-skel" style={{ width: 40, height: 40, borderRadius: 10 }} />
          <div style={{ flex: 1 }}>
            <div className="wg-skel" style={{ height: 14, width: '60%' }} />
            <div className="wg-skel" style={{ height: 11, width: '40%', marginTop: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}