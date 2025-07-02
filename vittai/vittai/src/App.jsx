import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Importação dos componentes de página e componentes gerais
import Sidebar from './components/components_HomePage/Sidebar';
import HomePage from './pages/HomePage/HomePage';
import PreLoginHomePage from './pages/PreLoginHomePage/PreLoginHomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import PacientesPage from './components/components_Pacientes/Pacientes';

// LINHA FALTANTE ADICIONADA AQUI:
import EditPatientPage from './components/components_Pacientes/EditarPaciente.jsx'; 

import './App.css';

// --- DADOS DOS PACIENTES ---
const initialPatients = [
  { 
    id: 1, name: 'Jacinto Pinto de Sousa', photoURL: 'https://i.pravatar.cc/80?img=1', 
    age: '55', gender: 'Masculino', weight: '125', lastConsult: '15/05/2025', 
    objective: 'Perda de Gordura', email: 'jacinto.pinto@email.com', phone: '(88) 9 84002822', 
    birthDate: '1969-07-20', height: '175' 
  },
  { 
    id: 2, name: 'Clodovaldo Lima', photoURL: 'https://i.pravatar.cc/80?img=2', 
    age: '39', gender: 'Masculino', weight: '75', lastConsult: '15/12/2025', 
    objective: 'Hipertrofia Muscular', email: 'clodovaldo.lima@email.com', phone: '(85) 9 12345678', 
    birthDate: '1985-03-10', height: '180' 
  }
];

function App() {
  const location = useLocation();
  
  // --- GERENCIAMENTO DE ESTADO ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [patients, setPatients] = useState(initialPatients);

  // Função para adicionar um novo paciente (será passada para o modal)
  const handleAddPatient = (newPatient) => {
    setPatients(prevPatients => [newPatient, ...prevPatients]);
  };

  // Define as rotas que não devem exibir a sidebar
  const noSidebarRoutes = ['/login', '/register', '/forgot-password'];
  const showSidebar = !noSidebarRoutes.includes(location.pathname) && isLoggedIn;

  return (
    <div className="app-container">
      {showSidebar && <Sidebar setIsLoggedIn={setIsLoggedIn} />}

      <main className={showSidebar ? 'app-content' : 'full-content'}>
        <Routes>
          {/* --- ROTAS PÚBLICAS E DE AUTENTICAÇÃO --- */}
          <Route path="/" element={isLoggedIn ? <HomePage /> : <PreLoginHomePage />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* --- ROTAS PROTEGIDAS (SÓ ACESSÍVEIS APÓS LOGIN) --- */}
          {isLoggedIn ? (
            <>
              {/* Passa a lista de pacientes e a função de adicionar para a página de Pacientes */}
              <Route 
                path="/pacientes" 
                element={<PacientesPage patients={patients} onPatientAdded={handleAddPatient} />} 
              />
              
              {/* Rota para editar um paciente específico */}
              <Route 
                path="/edit-patient/:id" 
                element={<EditPatientPage patients={patients} setPatients={setPatients} />} 
              />

              {/* Outras rotas protegidas */}
              <Route path="/planos" element={<div>Página de Planos Alimentares</div>} />
              <Route path="/anamneses" element={<div>Página de Anamneses</div>} />
              <Route path="/progressos" element={<div>Página de Progressos</div>} />
              <Route path="/agendamentos" element={<div>Página de Agendamentos</div>} />
              <Route path="/feedbacks" element={<div>Página de Feedbacks</div>} />
            </>
          ) : (
            // Se não estiver logado, qualquer tentativa de acessar rotas protegidas redireciona para o login
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}

          {/* Rota "catch-all" para redirecionar qualquer caminho não encontrado para a home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;