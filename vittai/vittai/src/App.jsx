import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import { db, auth } from './firebase/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';

function App() {
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [patients, setPatients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Efeito para "ouvir" o estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    // Limpa o listener ao desmontar o componente para evitar vazamentos de memória
    return () => unsubscribe();
  }, []);

  // Função para buscar os pacientes da subcoleção do usuário logado
  const fetchPatients = useCallback(async (uid) => {
    setLoadingData(true);
    setError(null);
    try {
      const userPatientsCollectionRef = collection(db, 'users', uid, 'patients');
      const data = await getDocs(query(userPatientsCollectionRef, orderBy("name")));
      const fetchedPatients = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setPatients(fetchedPatients);
    } catch (e) {
      console.error("App.jsx: Erro ao carregar pacientes:", e);
      setError("Não foi possível carregar os pacientes.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  // Efeito para disparar a busca de pacientes quando o usuário muda (login/logout)
  useEffect(() => {
    if (currentUser) {
      fetchPatients(currentUser.uid);
    } else {
      setPatients([]); // Limpa a lista de pacientes ao fazer logout
    }
  }, [currentUser, fetchPatients]);

  // Função para adicionar um novo paciente
  const handleAddPatient = async (newPatientData) => {
    if (!currentUser) return;
    try {
      const userPatientsCollectionRef = collection(db, 'users', currentUser.uid, 'patients');
      const docRef = await addDoc(userPatientsCollectionRef, newPatientData);
      const addedPatient = { ...newPatientData, id: docRef.id };
      
      setPatients(prevPatients => [addedPatient, ...prevPatients].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Adiciona um plano inicial para o novo paciente
      const initialFoodPlan = {
        patientId: addedPatient.id,
        title: `Plano Inicial de ${addedPatient.name}`, 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: '', 
        summary: "Plano a ser preenchido.",
        totalCalories: 0, proteins: 0, carbs: 0, fats: 0,
        status: "Rascunho", duration: "0 dias", meals: [], observations: "" 
      };
      const foodPlansCollectionRef = collection(db, 'users', currentUser.uid, 'patients', addedPatient.id, 'foodPlans');
      await addDoc(foodPlansCollectionRef, initialFoodPlan);
    } catch (e) {
      console.error("App.jsx: Erro ao adicionar paciente:", e);
    }
  };

  // Função para atualizar um paciente
  const handleUpdatePatient = async (patientId, updatedData) => {
    if (!currentUser) return;
    try {
      const patientDocRef = doc(db, 'users', currentUser.uid, 'patients', patientId);
      await updateDoc(patientDocRef, updatedData);
      setPatients(prevPatients => 
        prevPatients.map(p => p.id === patientId ? { ...p, ...updatedData } : p)
      );
    } catch (e) {
      console.error("App.jsx: Erro ao atualizar paciente:", e);
    }
  };

  // Função para deletar um paciente e seus sub-dados
  const handleDeletePatient = async (patientId) => {
    if (!currentUser) return;
    if (!window.confirm("Tem certeza? Esta ação excluirá o paciente e todos os seus planos alimentares.")) return;

    try {
      const foodPlansCollectionRef = collection(db, 'users', currentUser.uid, 'patients', patientId, 'foodPlans');
      const foodPlansSnapshot = await getDocs(foodPlansCollectionRef);
      const deletePromises = foodPlansSnapshot.docs.map(planDoc => deleteDoc(planDoc.ref));
      await Promise.all(deletePromises);

      const patientDocRef = doc(db, 'users', currentUser.uid, 'patients', patientId);
      await deleteDoc(patientDocRef);

      setPatients(prevPatients => prevPatients.filter(p => p.id !== patientId));
    } catch (e) {
      console.error("App.jsx: Erro ao deletar paciente:", e);
    }
  };

  // Função para buscar os planos de um paciente específico
  const fetchFoodPlansByPatientIdFromFirestore = async (userId, patientId, options = {}) => {
    try {
      let q = query(collection(db, 'users', userId, 'patients', patientId, 'foodPlans'));
      if (options.orderByField) {
        q = query(q, orderBy(options.orderByField, options.orderByDirection || 'asc'));
      }
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (e) {
      console.error("Firebase: Erro ao buscar planos de alimentação:", e);
      throw e;
    }
  };

  const noSidebarRoutes = ['/', '/login', '/register', '/forgot-password'];
  const showSidebar = currentUser && !noSidebarRoutes.includes(location.pathname);

  if (authLoading) {
    return <div className="app-container"><p>Carregando...</p></div>;
  }
  
  if (error) {
    return <div className="app-container"><p style={{ color: 'red' }}>{error}</p></div>
  }

  return (
    <div className="app-container">
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? 'app-content' : 'full-content'}>
        <Routes>
          <Route path="/" element={!currentUser ? <PreLoginHomePage /> : <Navigate to="/home" />} />
          <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/home" />} />
          <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/home" />} />
          <Route path="/forgot-password" element={!currentUser ? <ForgotPasswordPage /> : <Navigate to="/home" />} />

          {/* Rotas protegidas que só renderizam se houver um usuário logado */}
          {currentUser && (
            <>
              <Route path="/home" element={<HomePage />} />
              <Route path="/pacientes" element={<PacientesPage user={currentUser} patients={loadingData ? null : patients} onPatientAdded={handleAddPatient} />} />
              <Route 
                path="/edit-patient/:id" 
                element={<EditPatientPage user={currentUser} patients={patients} setPatients={handleUpdatePatient} onDeletePatient={handleDeletePatient} />} 
              />
              <Route 
                path="/planos" 
                element={<PlanosPage user={currentUser} patients={patients} fetchFoodPlansByPatientId={fetchFoodPlansByPatientIdFromFirestore} />} 
              />
              <Route 
                path="/planos/:patientId" 
                element={<PlanoDetalhePage user={currentUser} fetchFoodPlansByPatientId={fetchFoodPlansByPatientIdFromFirestore} />} 
              />
            </>
          )}
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;