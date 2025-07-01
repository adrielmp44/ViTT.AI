import React from 'react';
import './Agendamentos.css';

export default function Agendamentos() {
  return (
    <div className="card-container agendamentos-card">
      <h3 className="card-title-header">Agendamentos</h3>
      {/* Usaremos divs com CSS Grid para criar o calendário */}
      <div className="calendar-grid">
        <div className="grid-header"></div>
        <div className="grid-header">dom. 11/05</div>
        <div className="grid-header">seg. 12/05</div>
        <div className="grid-header">ter. 13/05</div>
        <div className="grid-header">qua. 14/05</div>
        <div className="grid-header">qui. 15/05</div>
        <div className="grid-header">sex. 16/05</div>
        <div className="grid-header">sab. 17/05</div>

        <div className="grid-time">08:00</div>
        {/* Células do calendário, 7 para cada linha de tempo */}
        <div className="grid-cell"></div>
        <div className="grid-cell"></div>
        <div className="grid-cell"></div>
        <div className="grid-cell"></div>
        <div className="grid-cell"></div>
        <div className="grid-cell"></div>
        <div className="grid-cell"></div>
      </div>
    </div>
  );
}