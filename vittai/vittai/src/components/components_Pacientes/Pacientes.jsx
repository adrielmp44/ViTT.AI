import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import PatientCard from './PatientCard.jsx';
import AddPatientModal from './AddPatientModal.jsx';
import './Pacientes.css';

// Remova o 'initialPatients' daqui e receba 'patients' e 'onPatientAdded' via props
export default function PacientesPage({ patients, onPatientAdded }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Remova o useState para 'patients' e a função 'handleAddPatient' daqui

  return (
    <div className="patient-list-container">
      <header className="patient-list-header">
        <h1>Gerenciar Pacientes</h1>
        <div className="header-actions">
          <div className="search-bar">
            <FaSearch /><input type="text" placeholder="Pesquisar..." />
          </div>
          <button className="add-patient-btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Adicionar Paciente
          </button>
        </div>
      </header>

      <div className="patient-grid">
        {patients.length > 0 ? (
          patients.map(patient => <PatientCard key={patient.id} patient={patient} />)
        ) : (
          <p>Nenhum paciente cadastrado ainda.</p>
        )}
      </div>

      <AddPatientModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onPatientAdded={onPatientAdded} // Passe a função recebida por props
      />
    </div>
  );
}