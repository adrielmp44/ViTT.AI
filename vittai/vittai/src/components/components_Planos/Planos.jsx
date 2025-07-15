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
            // GUARDA DE SEGURANÇA: Só executa se tivermos o usuário e a lista de pacientes.
            // Isso previne o erro "indexOf is not a function".
            if (!user || patients.length === 0) {
                setPatientsWithPlanInfo([]); // Limpa a lista se não houver pacientes
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Mapeia cada paciente e busca as informações do seu último plano
                const patientsInfoPromises = patients.map(async (patient) => {
                    const plans = await fetchFoodPlansByPatientId(user.uid, patient.id, {
                        orderByField: 'startDate',
                        orderByDirection: 'desc',
                        limit: 1
                    });
                    // Retorna o paciente com os dados do último plano anexados
                    return { ...patient, lastPlan: plans[0] || null };
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
                            // O PatientCard agora recebe o objeto de paciente já com os dados do plano
                            <PatientCard
                                key={patient.id}
                                patient={{ 
                                    ...patient, 
                                    // Mapeia os dados do sub-objeto 'lastPlan' para as props que o PatientCard espera
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