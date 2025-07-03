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

// Importar o 'db' do seu arquivo de configuração do Firebase
import { db } from './firebase/firebase.js';
// Importar funções Firestore necessárias
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';


function App() {
  const location = useLocation();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Referências às coleções no Firestore
  const patientsCollectionRef = collection(db, "patients");
  const foodPlansCollectionRef = collection(db, "foodPlans");


  // FUNÇÃO AUXILIAR: Busca planos por patientId no Firestore
  // Esta função agora será mais genérica e poderá ser reutilizada.
  const fetchFoodPlansByPatientIdFromFirestore = async (patientId, options = {}) => {
    try {
      let q = query(foodPlansCollectionRef, where("patientId", "==", patientId));
      
      // Adiciona ordenação e limite se especificado (útil para PlanosPage)
      if (options.orderByField) {
          q = query(q, orderBy(options.orderByField, options.orderByDirection || 'asc'));
      }
      if (options.limit) {
          q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const plans = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      return plans;
    } catch (e) {
      console.error("Firebase: Erro ao buscar planos de alimentação:", e);
      throw new Error("Erro ao buscar planos de alimentação do Firebase.");
    }
  };

  // useEffect para carregar pacientes do Firestore
  useEffect(() => {
    const getPatients = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDocs(patientsCollectionRef);
        const fetchedPatients = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setPatients(fetchedPatients);
        console.log("App.jsx: Pacientes carregados do Firebase:", fetchedPatients);
      } catch (e) {
        console.error("App.jsx: Erro ao carregar pacientes do Firebase:", e);
        setError("Não foi possível carregar os pacientes do Firebase. Verifique sua conexão ou regras do Firestore.");
      } finally {
        setLoading(false);
        console.log("App.jsx: Carregamento de pacientes do Firebase finalizado.");
      }
    };

    getPatients();
  }, []); 


  // handleAddPatient para usar o Firestore (POST/addDoc)
  const handleAddPatient = async (newPatientData) => {
    try {
      // addDoc automaticamente gera um ID para o documento
      const docRef = await addDoc(patientsCollectionRef, newPatientData);
      const addedPatient = { ...newPatientData, id: docRef.id }; // Pega o ID gerado

      // Atualiza o estado local com o paciente que inclui o ID do Firestore
      setPatients(prevPatients => [addedPatient, ...prevPatients]);
      console.log("App.jsx: Paciente adicionado ao Firebase com ID:", docRef.id);

      // Adicionar um plano de alimentação inicial vazio para o novo paciente
      const initialFoodPlan = {
        patientId: addedPatient.id, // Usa o ID gerado pelo Firebase para ligar o plano
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
        meals: [],
        observations: "" 
      };

      await addDoc(foodPlansCollectionRef, initialFoodPlan);
      console.log("App.jsx: Plano inicial adicionado para o paciente:", initialFoodPlan);

    } catch (e) {
      console.error("App.jsx: Erro ao adicionar paciente ou plano inicial ao Firebase:", e);
    }
  };

  // handleUpdatePatient para usar o Firestore (PUT/updateDoc)
  const handleUpdatePatient = async (patientId, updatedData) => {
    try {
      // Cria uma referência ao documento do paciente usando o ID do documento
      const patientDocRef = doc(db, "patients", patientId);
      // updateDoc atualiza os campos existentes ou adiciona novos
      await updateDoc(patientDocRef, updatedData);

      // Atualiza o estado local. É importante incluir o ID original no objeto atualizado
      setPatients(prevPatients => 
        prevPatients.map(p => p.id.toString() === patientId ? { ...updatedData, id: patientId } : p)
      );
      console.log(`App.jsx: Paciente ${patientId} atualizado no Firebase.`);
    } catch (e) {
      console.error("App.jsx: Erro ao atualizar paciente no Firebase:", e);
    }
  };

  // handleDeletePatient para usar o Firestore (DELETE/deleteDoc)
  const handleDeletePatient = async (patientId) => {
    try {
      console.log(`App.jsx: Iniciando exclusão para paciente ID: ${patientId} no Firebase`);
      
      // 1. Buscar e deletar os planos de alimentação do paciente
      const plansToDelete = await fetchFoodPlansByPatientIdFromFirestore(patientId);
      console.log(`App.jsx: Planos encontrados para deletar para ${patientId}:`, plansToDelete);
      for (const plan of plansToDelete) {
        const planDocRef = doc(db, "foodPlans", plan.id); // Cria referência ao doc do plano
        await deleteDoc(planDocRef); // Deleta o doc do plano
        console.log(`App.jsx: Plano ${plan.id} deletado do Firebase.`);
      }

      // 2. Deletar o paciente
      const patientDocRef = doc(db, "patients", patientId); // Cria referência ao doc do paciente
      await deleteDoc(patientDocRef); // Deleta o doc do paciente
      
      // Atualiza o estado local removendo o paciente
      setPatients(prevPatients => prevPatients.filter(patient => patient.id.toString() !== patientId));
      console.log(`App.jsx: Paciente ${patientId} e seus planos deletados do Firebase.`);
    } catch (e) {
      console.error("App.jsx: Erro ao deletar paciente ou seus planos do Firebase:", e);
    }
  };

  const noSidebarRoutes = ['/login', '/register', '/forgot-password'];
  const showSidebar = !noSidebarRoutes.includes(location.pathname) && isLoggedIn;

  if (loading) {
    return <div className="app-container"><p>Carregando dados iniciais do Firebase...</p></div>;
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
                element={<PlanosPage patients={patients} fetchFoodPlansByPatientId={fetchFoodPlansByPatientIdFromFirestore} />} 
              />
              
              <Route 
                path="/planos/:patientId" 
                // Passa a função de busca de planos para PlanoDetalhePage
                element={<PlanoDetalhePage fetchFoodPlansByPatientId={fetchFoodPlansByPatientIdFromFirestore} />} 
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