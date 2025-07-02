import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Importação dos componentes de página e componentes gerais
import Sidebar from './components/components_HomePage/Sidebar';
import HomePage from './pages/HomePage/HomePage';
import PreLoginHomePage from './pages/PreLoginHomePage/PreLoginHomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import PacientesPage from './components/components_Pacientes/Pacientes';
import EditPatientPage from './components/components_Pacientes/EditarPaciente.jsx'; 

import './App.css';

function App() {
  const location = useLocation();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [patients, setPatients] = useState(() => {
    try {
      const storedPatients = localStorage.getItem('patients');
      return storedPatients ? JSON.parse(storedPatients) : []; 
    } catch (error) {
      console.error("Erro ao carregar pacientes do LocalStorage:", error);
      return []; 
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('patients', JSON.stringify(patients));
    } catch (error) {
      console.error("Erro ao salvar pacientes no LocalStorage:", error);
    }
  }, [patients]);

  const handleAddPatient = (newPatient) => {
    setPatients(prevPatients => [newPatient, ...prevPatients]);
  };

  // NOVO: Função para deletar paciente
  const handleDeletePatient = (patientId) => {
    // Filtra a lista de pacientes, removendo aquele com o ID correspondente
    setPatients(prevPatients => prevPatients.filter(patient => patient.id.toString() !== patientId));
    // O useEffect acima se encarregará de salvar a nova lista no LocalStorage.
  };

  const noSidebarRoutes = ['/login', '/register', '/forgot-password'];
  const showSidebar = !noSidebarRoutes.includes(location.pathname) && isLoggedIn;

  return (
    <div className="app-container">
      {showSidebar && <Sidebar setIsLoggedIn={setIsLoggedIn} />}

      <main className={showSidebar ? 'app-content' : 'full-content'}>
        <Routes>
          <Route path="/" element={isLoggedIn ? <HomePage /> : <PreLoginHomePage />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {isLoggedIn ? (
            <>
              <Route 
                path="/pacientes" 
                element={<PacientesPage patients={patients} onPatientAdded={handleAddPatient} />} 
              />
              
              {/* ATUALIZADO: Passa handleDeletePatient para EditPatientPage */}
              <Route 
                path="/edit-patient/:id" 
                element={<EditPatientPage patients={patients} setPatients={setPatients} onDeletePatient={handleDeletePatient} />} 
              />

              <Route path="/planos" element={<div>Página de Planos Alimentares</div>} />
              <Route path="/anamneses" element={<div>Página de Anamneses</div>} />
              <Route path="/progressos" element={<div>Página de Progressos</div>} />
              <Route path="/agendamentos" element={<div>Página de Agendamentos</div>} />
              <Route path="/feedbacks" element={<div>Página de Feedbacks</div>} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;