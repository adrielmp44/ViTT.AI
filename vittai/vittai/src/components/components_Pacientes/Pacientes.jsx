import React, { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import PatientCard from '../components_Pacientes/PatientCard.jsx';
import AddPatientModal from '../components_Pacientes/AddPatientModal.jsx';
import './Pacientes.css';

export default function PacientesPage({ patients, onPatientAdded, onEditPatient, onDeletePatient }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients ? patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (!patients) {
    return (
      <div className="patient-list-container">
        <p>Carregando pacientes...</p>
      </div>
    );
  }

  return (
    // O Fragment <> é necessário para agrupar a página e o modal
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
            {/* O botão simplesmente atualiza o estado para abrir o modal */}
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
                onEdit={() => onEditPatient(patient)}
                onDelete={() => onDeletePatient(patient.id)}
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

      {/*
        --- CORREÇÃO PRINCIPAL AQUI ---
        Agora, renderizamos o AddPatientModal incondicionalmente,
        e passamos o estado 'isModalOpen' para a prop 'isOpen' do modal.
        A biblioteca 'react-modal' usará essa prop para mostrar ou esconder o modal.
        Também ajustamos a prop para 'onRequestClose', que é o padrão da biblioteca.
      */}
      <AddPatientModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onPatientAdded={onPatientAdded}
      />
    </>
  );
}