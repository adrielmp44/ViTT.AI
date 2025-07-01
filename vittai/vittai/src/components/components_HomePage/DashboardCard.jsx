import React from 'react';
import './DashboardCard.css'; 

export default function DashboardCard({ title, value, detail, icon, iconBgColor }) {
  return (
    <div className="dashboard-card">
      <div className="card-content">
        <p className="card-title">{title}</p>
        <p className="card-value">{value}</p>
        {detail && <p className={`card-detail ${title.includes('Próxima') ? 'next-appointment' : ''}`}>{detail}</p>}
      </div>
      <div className="card-icon-wrapper" style={{ backgroundColor: iconBgColor }}>
        {icon}
      </div>
    </div>
  );
}