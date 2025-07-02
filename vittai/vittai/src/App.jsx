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
import PlanosPage from './components/components_Planos/Planos.jsx'; 
import PlanoDetalhePage from './components/components_Planos/PlanoDetalhe.jsx'; 

import './App.css';

const API_BASE_URL = 'http://localhost:5000';

function App() {
  const location = useLocation();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFoodPlansByPatientId = async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/foodPlans?patientId=${patientId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/patients`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPatients(data);
        console.log("App.jsx: Pacientes carregados:", data); // LOG
      } catch (e) {
        console.error("App.jsx: Erro ao carregar pacientes:", e); // LOG
        setError("Não foi possível carregar os pacientes. Verifique se o JSON Server está rodando (porta 5000).");
      } finally {
        setLoading(false);
        console.log("App.jsx: Carregamento de pacientes finalizado."); // LOG
      }
    };

    fetchPatients();
  }, []); 

  const handleAddPatient = async (newPatientData) => {
    try {
      const patientResponse = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPatientData),
      });
      if (!patientResponse.ok) {
        throw new Error(`HTTP error! status: ${patientResponse.status}`);
      }
      const addedPatient = await patientResponse.json();
      setPatients(prevPatients => [addedPatient, ...prevPatients]);
      console.log("App.jsx: Paciente adicionado com sucesso:", addedPatient); // LOG

      const initialFoodPlan = {
        patientId: addedPatient.id, 
        title: `Plano Inicial de ${addedPatient.name}`, 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: '', 
        summary: "Plano a ser preenchido.",
        totalCalories: 0,
        proteins: 0,
        carbs: 0,
        fats: 0,
        status: "Rascunho", 
        duration: "0 dias", 
        meals: [] 
      };

      const planResponse = await fetch(`${API_BASE_URL}/foodPlans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initialFoodPlan),
      });
      if (!planResponse.ok) {
        console.warn(`App.jsx: Aviso: Não foi possível adicionar plano inicial para ${addedPatient.name}. Status: ${planResponse.status}`); // LOG
      } else {
        console.log("App.jsx: Plano inicial adicionado para o paciente:", initialFoodPlan); // LOG
      }

    } catch (e) {
      console.error("App.jsx: Erro ao adicionar paciente ou plano inicial:", e); // LOG
    }
  };

  const handleUpdatePatient = async (patientId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedPatientFromServer = await response.json();
      setPatients(prevPatients => 
        prevPatients.map(p => p.id.toString() === patientId ? updatedPatientFromServer : p)
      );
      console.log("App.jsx: Paciente atualizado com sucesso:", updatedPatientFromServer); // LOG
    } catch (e) {
      console.error("App.jsx: Erro ao atualizar paciente:", e); // LOG
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      console.log(`App.jsx: Iniciando exclusão para paciente ID: ${patientId}`); // LOG
      const plansToDelete = await fetchFoodPlansByPatientId(patientId);
      console.log(`App.jsx: Planos encontrados para deletar para ${patientId}:`, plansToDelete); // LOG
      for (const plan of plansToDelete) {
        const deletePlanResponse = await fetch(`${API_BASE_URL}/foodPlans/${plan.id}`, {
          method: 'DELETE',
        });
        if (!deletePlanResponse.ok) {
          console.warn(`App.jsx: Aviso: Não foi possível deletar o plano ${plan.id} para o paciente ${patientId}. Status: ${deletePlanResponse.status}`); // LOG
        } else {
          console.log(`App.jsx: Plano ${plan.id} deletado com sucesso.`); // LOG
        }
      }

      const patientResponse = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
        method: 'DELETE',
      });
      if (!patientResponse.ok) {
        throw new Error(`HTTP error! status: ${patientResponse.status}`);
      }
      setPatients(prevPatients => prevPatients.filter(patient => patient.id.toString() !== patientId));
      console.log(`App.jsx: Paciente ${patientId} e seus planos deletados com sucesso.`); // LOG
    } catch (e) {
      console.error("App.jsx: Erro ao deletar paciente ou seus planos:", e); // LOG
    }
  };

  const noSidebarRoutes = ['/login', '/register', '/forgot-password'];
  const showSidebar = !noSidebarRoutes.includes(location.pathname) && isLoggedIn;

  if (loading) {
    return <div className="app-container"><p>Carregando dados iniciais...</p></div>;
  }

  if (error) {
    return <div className="app-container"><p style={{color: 'red'}}>{error}</p></div>;
  }

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
              
              <Route 
                path="/edit-patient/:id" 
                element={<EditPatientPage patients={patients} setPatients={handleUpdatePatient} onDeletePatient={handleDeletePatient} />} 
              />

              <Route 
                path="/planos" 
                element={<PlanosPage patients={patients} />} 
              />
              
              <Route 
                path="/planos/:patientId" 
                element={<PlanoDetalhePage />} 
              />

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