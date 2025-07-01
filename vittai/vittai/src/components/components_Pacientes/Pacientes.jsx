import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import PatientCard from './PatientCard.jsx';
import AddPatientModal from './AddPatientModal.jsx';
import './Pacientes.css';


const initialPatients = [
  { id: 1, name: 'Jacinto Pinto de Sousa', photoURL: 'https://i.pravatar.cc/80?img=1', age: '55', gender: 'Masculino', weight: '125', lastConsult: '15/05/2025', objective: 'Perca de Gordura' },
  { id: 2, name: 'Clodovaldo Lima', photoURL: 'https://i.pravatar.cc/80?img=2', age: '39', gender: 'Masculino', weight: '75', lastConsult: '15/12/2025', objective: 'Hipertrofia Muscular' }
];

export default function PacientesPage() {
  const [patients, setPatients] = useState(initialPatients);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPatient = (newPatient) => {
    setPatients(prevPatients => [newPatient, ...prevPatients]);
  };

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
        onPatientAdded={handleAddPatient} 
      />
    </div>
  );
}