import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa'; 
import PatientCard from '../components_Pacientes/PatientCard.jsx'; 
import './Planos.css'; 

// Importar o 'db' e funções Firestore necessárias para a busca interna.
// Embora fetchFoodPlansByPatientId venha de props, a busca mais geral pode precisar de mais imports.
import { db } from '../../firebase/firebase.js';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';


export default function PlanosPage({ patients, fetchFoodPlansByPatientId }) { // Recebe fetchFoodPlansByPatientId
  const [searchTerm, setSearchTerm] = useState('');
  const [patientsWithPlanInfo, setPatientsWithPlanInfo] = useState([]);
  const [loadingLocal, setLoadingLocal] = useState(true); 
  const [errorLocal, setErrorLocal] = useState(null); 

  console.log("Planos.jsx: Prop 'patients' recebida do App.jsx:", patients); 

  useEffect(() => {
    const fetchPatientsAndPlanInfo = async () => {
      console.log("Planos.jsx: Iniciando fetchPatientsAndPlanInfo...");
      setLoadingLocal(true);
      setErrorLocal(null);
      try {
        if (!patients || patients.length === 0) {
          console.log("Planos.jsx: Nenhum paciente na lista. Finalizando fetch.");
          setPatientsWithPlanInfo([]);
          setLoadingLocal(false);
          return;
        }

        const updatedPatients = await Promise.all(
          patients.map(async (patient) => {
            console.log(`Planos.jsx: Buscando último plano para paciente ID: ${patient.id} no Firebase`);
            try {
                // Usa a função passada de App.jsx com opções para pegar o último plano
                const plans = await fetchFoodPlansByPatientId(patient.id, { 
                    orderByField: "startDate", 
                    orderByDirection: "desc", 
                    limit: 1 
                });
                
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
                console.error(`Planos.jsx: Erro ao buscar último plano para ${patient.name} do Firebase:`, innerError);
                return { ...patient, lastPlanTitle: 'Erro ao carregar', totalCalories: 'N/A', proteins: 'N/A', carbs: 'N/A', fats: 'N/A', status: 'N/A', duration: 'N/A' };
            }
          })
        );
        setPatientsWithPlanInfo(updatedPatients);
        console.log("Planos.jsx: Pacientes com info de plano atualizados:", updatedPatients);
      } catch (e) {
        console.error("Planos.jsx: Erro ao carregar informações de planos (geral):", e);
        setErrorLocal("Não foi possível carregar os planos dos pacientes do Firebase.");
      } finally {
        setLoadingLocal(false);
        console.log("Planos.jsx: Carregamento de planos finalizado.");
      }
    };

    if (patients && patients.length > 0) { 
        fetchPatientsAndPlanInfo();
    } else if (patients && patients.length === 0) {
        setPatientsWithPlanInfo([]);
        setLoadingLocal(false);
        console.log("Planos.jsx: Lista de pacientes vazia, não há planos para buscar.");
    }
  }, [patients, fetchFoodPlansByPatientId]); // Adiciona fetchFoodPlansByPatientId como dependência

  const filteredPatients = patientsWithPlanInfo.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingLocal) {
    return <div className="patient-list-container"><p>Carregando planos dos pacientes do Firebase...</p></div>;
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