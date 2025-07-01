import React from 'react';
import './ConsultasChart.css';

export default function ConsultasChart() {
  return (
    <div className="card-container">
      <h3 className="card-title-header">Consultas por dia</h3>
      <div className="chart-area">
        <div className="pie-chart"></div>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#00A3A3' }}></span>
            Segunda
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#008080' }}></span>
            Terça
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#0D2626' }}></span>
            Quarta
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#29B6F6' }}></span>
            Quinta
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#66BB6A' }}></span>
            Sexta
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: '#80CBC4' }}></span>
            Sábado
          </div>
        </div>
      </div>
    </div>
  );
}