import React from 'react';

interface Props {
  titulo: string;
  descripcion?: string;
  acciones?: React.ReactNode;
  vivo?: string;
}

export function PageHeader({ titulo, descripcion, acciones, vivo }: Props) {
  return (
    <div className="wg-page-head">
      <div>
        <h1 className="wg-page-title">{titulo}</h1>
        {descripcion ? <p className="wg-page-sub">{descripcion}</p> : null}
        {vivo ? <p className="wg-live" style={{ marginTop: 6 }}><i /> {vivo}</p> : null}
      </div>
      {acciones ? <div className="wg-head-actions">{acciones}</div> : null}
    </div>
  );
}