import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa'; 
import PatientCard from '../components_Pacientes/PatientCard.jsx'; 
import './Planos.css'; 

const API_BASE_URL = 'http://localhost:5000';

export default function PlanosPage({ patients }) { 
  const [searchTerm, setSearchTerm] = useState('');
  const [patientsWithPlanInfo, setPatientsWithPlanInfo] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(true); // Renomeado para evitar conflito com 'loading' do App.jsx
  const [errorLocal, setErrorLocal] = useState(null); // Renomeado para evitar conflito com 'error' do App.jsx

  console.log("Planos.jsx: Prop 'patients' recebida do App.jsx:", patients); // LOG

  useEffect(() => {
    const fetchPatientsAndPlanInfo = async () => {
      console.log("Planos.jsx: Iniciando fetchPatientsAndPlanInfo..."); // LOG
      setLoadingLocal(true);
      setErrorLocal(null);
      try {
        if (!patients || patients.length === 0) {
          console.log("Planos.jsx: Nenhum paciente na lista. Finalizando fetch."); // LOG
          setPatientsWithPlanInfo([]);
          setLoadingLocal(false);
          return;
        }

        const updatedPatients = await Promise.all(
          patients.map(async (patient) => {
            console.log(`Planos.jsx: Buscando plano para paciente ID: ${patient.id}`); // LOG
            try {
                const response = await fetch(`${API_BASE_URL}/foodPlans?patientId=${patient.id}&_sort=startDate&_order=desc&_limit=1`);
                if (!response.ok) {
                    console.warn(`Planos.jsx: Aviso: Não foi possível buscar planos para o paciente ${patient.name}. Status: ${response.status}`); // LOG
                    // Retorna paciente com info de erro para o plano, mas não impede a renderização
                    return { ...patient, lastPlanTitle: 'Erro ao carregar planos', totalCalories: 'N/A', proteins: 'N/A', carbs: 'N/A', fats: 'N/A', status: 'N/A', duration: 'N/A' };
                }
                const plans = await response.json();
                console.log(`Planos.jsx: Planos recebidos para ${patient.name}:`, plans); // LOG
                const lastPlan = plans[0]; 

                if (lastPlan) {
                  return {
                    ...patient,
                    lastPlanTitle: lastPlan.title,
                    startDate: lastPlan.startDate,
                    endDate: lastPlan.endDate,
                    totalCalories: lastPlan.totalCalories,
                    proteins: lastPlan.proteins,
                    carbs: lastPlan.carbs,
                    fats: lastPlan.fats,
                    status: lastPlan.status,
                    duration: lastPlan.duration
                  };
                } else {
                  return {
                    ...patient,
                    lastPlanTitle: 'Nenhum plano cadastrado',
                    startDate: 'N/A',
                    endDate: 'N/A',
                    totalCalories: 'N/A',
                    proteins: 'N/A',
                    carbs: 'N/A',
                    fats: 'N/A',
                    status: 'N/A',
                    duration: 'N/A'
                  };
                }
            } catch (innerError) {
                console.error(`Planos.jsx: Erro de rede/API ao buscar planos para ${patient.name}:`, innerError); // LOG
                return { ...patient, lastPlanTitle: 'Erro de conexão', totalCalories: 'N/A', proteins: 'N/A', carbs: 'N/A', fats: 'N/A', status: 'N/A', duration: 'N/A' };
            }
          })
        );
        setPatientsWithPlanInfo(updatedPatients);
        console.log("Planos.jsx: Pacientes com info de plano atualizados:", updatedPatients); // LOG
      } catch (e) {
        console.error("Planos.jsx: Erro ao carregar informações de planos (geral):", e); // LOG
        setErrorLocal("Não foi possível carregar os planos dos pacientes.");
      } finally {
        setLoadingLocal(false);
        console.log("Planos.jsx: Carregamento de planos finalizado."); // LOG
      }
    };

    // Só busca os planos se a lista de pacientes não estiver vazia
    // e se o carregamento do App.jsx já tiver sido finalizado (implicado pela prop 'patients' estar preenchida)
    if (patients && patients.length > 0) { 
        fetchPatientsAndPlanInfo();
    } else if (patients && patients.length === 0) {
        // Se não há pacientes e a lista já foi carregada como vazia
        setPatientsWithPlanInfo([]);
        setLoadingLocal(false);
        console.log("Planos.jsx: Lista de pacientes vazia, não há planos para buscar."); // LOG
    }
  }, [patients]); // Executa quando a prop 'patients' muda

  const filteredPatients = patientsWithPlanInfo.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingLocal) {
    return <div className="patient-list-container"><p>Carregando planos dos pacientes...</p></div>;
  }

  if (errorLocal) {
    return <div className="patient-list-container"><p style={{color: 'red'}}>{errorLocal}</p></div>;
  }

  return (
    <div className="patient-list-container"> 
      <header className="patient-list-header">
        <h1>Gerenciar Planos Alimentares</h1>
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
        </div>
      </header>

      <div className="patient-grid"> 
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <PatientCard 
              key={patient.id} 
              patient={patient} 
              type="plano" 
            />
          ))
        ) : (
          <p>Nenhum paciente cadastrado ou encontrado com planos alimentares.</p>
        )}
      </div>
    </div>
  );
}