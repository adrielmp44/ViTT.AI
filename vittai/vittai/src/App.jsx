import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/components_HomePage/Sidebar';
import HomePage from './pages/HomePage/HomePage';
import PreLoginHomePage from './pages/PreLoginHomePage/PreLoginHomePage';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import Pacientes from './components/components_Pacientes/Pacientes.jsx';
import './App.css';

function App() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);


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
              {/* A rota de pacientes já está correta aqui */}
              <Route path="/pacientes" element={<Pacientes />} />
              
              <Route path="/planos" element={<div>Página de Planos Alimentares (Protegida)</div>} />
              <Route path="/anamneses" element={<div>Página de Anamneses (Protegida)</div>} />
              <Route path="/progressos" element={<div>Página de Progressos (Protegida)</div>} />
              <Route path="/agendamentos" element={<div>Página de Agendamentos (Protegida)</div>} />
              <Route path="/feedbacks" element={<div>Página de Feedbacks (Protegida)</div>} />
            </>
          ) : (
            <>
              {/* As rotas redirecionam para o login se não estiver logado */}
              <Route path="/pacientes" element={<Navigate to="/login" replace />} />
              <Route path="/planos" element={<Navigate to="/login" replace />} />
              <Route path="/anamneses" element={<Navigate to="/login" replace />} />
              <Route path="/progressos" element={<Navigate to="/login" replace />} />
              <Route path="/agendamentos" element={<Navigate to="/login" replace />} />
              <Route path="/feedbacks" element={<Navigate to="/login" replace />} />
            </>
          )}


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;