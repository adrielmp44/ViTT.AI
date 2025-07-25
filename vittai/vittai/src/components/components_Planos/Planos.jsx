import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientCard from '../components_Pacientes/PatientCard.jsx';
import './Planos.css'; 

export default function PlanosPage({ user, patients, fetchFoodPlansByPatientId }) {
    const [patientsWithPlanInfo, setPatientsWithPlanInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPatientsAndPlanInfo = async () => {
            if (!user || patients.length === 0) {
                setPatientsWithPlanInfo([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const patientsInfoPromises = patients.map(async (patient) => {
                    const plans = await fetchFoodPlansByPatientId(user.uid, patient.id, {});

                    // Ordenação manual para garantir a ordem correta
                    plans.sort((a, b) => {
                        // Primeiro, ordena pela data de início (mais nova primeiro)
                        const dateComparison = new Date(b.startDate) - new Date(a.startDate);
                        if (dateComparison !== 0) {
                            return dateComparison;
                        }
                        // Se as datas forem iguais, ordena pelo horário de criação (mais novo primeiro)
                        // Trata casos onde 'createdAt' pode não existir em planos antigos
                        const timeA = a.createdAt ? new Date(a.createdAt) : 0;
                        const timeB = b.createdAt ? new Date(b.createdAt) : 0;
                        return timeB - timeA;
                    });

                    const activePlan = plans.find(p => p.status === 'Ativo');
                    const planToShow = activePlan || plans[0] || null;

                    return { ...patient, lastPlan: planToShow };
                });

                const results = await Promise.all(patientsInfoPromises);
                setPatientsWithPlanInfo(results);

            } catch (error) {
                console.error("Planos.jsx: Erro ao buscar informações dos planos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatientsAndPlanInfo();
    }, [user, patients, fetchFoodPlansByPatientId]);

    const filteredPatients = patientsWithPlanInfo.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="patient-list-container"> 
            <header className="patient-list-header">
                <h1>Gerenciar Planos Alimentares</h1>
                <div className="header-actions">
                    <div className="search-bar">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Pesquisar paciente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {loading ? (
                <p>Carregando informações dos planos...</p>
            ) : (
                <div className="patient-grid">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                            <PatientCard
                                key={patient.id}
                                patient={{ 
                                    ...patient, 
                                    lastPlanTitle: patient.lastPlan?.title,
                                    startDate: patient.lastPlan?.startDate,
                                    status: patient.lastPlan?.status,
                                    totalCalories: patient.lastPlan?.totalCalories,
                                    duration: patient.lastPlan?.duration
                                }}
                                type="plano"
                            />
                        ))
                    ) : (
                        <p>Nenhum paciente cadastrado.</p>
                    )}
                </div>
            )}
        </div>
    );
}