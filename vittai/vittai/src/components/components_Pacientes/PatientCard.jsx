import React from 'react';
import { FaPencilAlt } from 'react-icons/fa';
import './PatientCard.css';

export default function PatientCard({ patient }) {
  return (
    <div className="patient-card">
      <div className="patient-header">
        <img src={patient.photoURL || 'https://via.placeholder.com/80'} alt={patient.name} className="patient-photo" />
        <div className="patient-summary">
          <h4 className="patient-name">{patient.name}</h4>
          <p className="patient-details">{`${patient.age || 'N/A'} Anos - ${patient.gender || 'N/A'}`}</p>
        </div>
      </div>
      <div className="patient-info-grid">
        <div>
          <span>Peso:</span>
          <p>{patient.weight || 'N/A'} kg</p>
        </div>
        <div>
          <span>Última consulta:</span>
          <p>{patient.lastConsult || 'N/A'}</p>
        </div>
        <div>
          <span>Objetivo:</span>
          <p>{patient.objective || 'N/A'}</p>
        </div>
      </div>
      <button className="edit-patient-btn">
        <FaPencilAlt />
      </button>
    </div>
  );
}