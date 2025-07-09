import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import PatientCard from '../components_Pacientes/PatientCard.jsx';
import AddPatientModal from '../components_Pacientes/AddPatientModal.jsx';
import './Pacientes.css';

export default function PacientesPage({ user, patients, onPatientAdded }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients ? patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (patients === null) {
    return (
      <div className="patient-list-container">
        <p>Carregando pacientes...</p>
      </div>
    );
  }

  return (
    <>
      <div className="patient-list-container">
        <header className="patient-list-header">
          <h1>Meus Pacientes</h1>
          <div className="header-actions">
            <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Pesquisar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="add-patient-btn">
              <FaPlus /> Adicionar Paciente
            </button>
          </div>
        </header>

        <div className="patient-grid">
          {filteredPatients.length > 0 ? (
            filteredPatients.map(patient => (
              <PatientCard
                key={patient.id}
                patient={patient}
                type="paciente"
              />
            ))
          ) : (
            <p>
              {searchTerm
                ? 'Nenhum paciente encontrado com o termo pesquisado.'
                : 'Nenhum paciente cadastrado.'}
            </p>
          )}
        </div>
      </div>

      <AddPatientModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onPatientAdded={onPatientAdded}
        user={user}
      />
    </>
  );
}