import React from 'react';
import { Link } from 'react-router-dom';
import { FaPencilAlt, FaClipboardList } from 'react-icons/fa'; 
import './PatientCard.css';

export default function PatientCard({ patient, type = 'paciente' }) { 
  const linkTo = type === 'paciente' ? `/edit-patient/${patient.id}` : `/planos/${patient.id}`;
  const Icon = type === 'paciente' ? FaPencilAlt : FaClipboardList; 
  const buttonTitle = type === 'paciente' ? 'Editar Paciente' : 'Ver Planos Alimentares';

  // As informações adicionais para o card de planos já são passadas via 'patient'
  // na Planos.jsx, como totalCalories, proteins, carbs, fats, status, duration, lastPlanTitle, startDate.

  return (
    <div className="patient-card">
      <div className="patient-header">
        <img src={patient.photoURL || 'https://via.placeholder.com/80?text=NP'} alt={patient.name} className="patient-photo" />
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
          {/* ATUALIZADO: Rótulo condicional para Data de Início do Plano */}
          <span>{type === 'plano' ? 'Início do Plano:' : 'Última consulta:'}</span>
          {/* ATUALIZADO: Exibe patient.startDate se for tipo 'plano', senão patient.lastConsult */}
          <p>{type === 'plano' ? (patient.startDate || 'N/A') : (patient.lastConsult || 'N/A')}</p>
        </div>
        <div>
          <span>Objetivo:</span>
          <p>{patient.objective || 'N/A'}</p>
        </div>

        {/* Informações adicionais que só aparecem no card de planos */}
        {type === 'plano' && (
          <>
            <div>
              <span>Último Plano:</span>
              <p>{patient.lastPlanTitle || 'Nenhum'}</p>
            </div>
            <div>
              <span>Status Plano:</span>
              <p>{patient.status || 'N/A'}</p>
            </div>
            <div>
              <span>Kcal/diária:</span>
              <p>{patient.totalCalories || 'N/A'} kcal</p>
            </div>
            <div>
              <span>Duração:</span>
              <p>{patient.duration || 'N/A'}</p>
            </div>
          </>
        )}
      </div>

      <Link to={linkTo} className="edit-patient-btn" title={buttonTitle}>
        <Icon />
      </Link>
    </div>
  );
}