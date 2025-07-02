import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaPencilAlt, FaTrashAlt, FaArrowLeft } from 'react-icons/fa';
import EditPlanModal from './EditPlanModal.jsx'; // NOVO: Importar o modal de edição
import './PlanoDetalhe.css';

const API_BASE_URL = 'http://localhost:5000';

export default function PlanoDetalhePage() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [foodPlans, setFoodPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // NOVO: Estado para controlar o modal
    const [currentPlanToEdit, setCurrentPlanToEdit] = useState(null); // NOVO: Qual plano está sendo editado

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            console.log(`PlanoDetalhe.jsx: Iniciando busca de dados para patientId: ${patientId}`);
            try {
                const patientResponse = await fetch(`${API_BASE_URL}/patients/${patientId}`);
                if (!patientResponse.ok) {
                    throw new Error(`Paciente com ID ${patientId} não encontrado. Status: ${patientResponse.status}`);
                }
                const patientData = await patientResponse.json();
                setPatient(patientData);
                console.log("PlanoDetalhe.jsx: Dados do paciente carregados:", patientData);

                const plansResponse = await fetch(`${API_BASE_URL}/foodPlans?patientId=${patientId}&_sort=startDate&_order=desc`);
                if (!plansResponse.ok) {
                    throw new Error(`Não foi possível carregar planos para o paciente ID ${patientId}. Status: ${plansResponse.status}`);
                }
                const plansData = await plansResponse.json();
                setFoodPlans(plansData);
                console.log("PlanoDetalhe.jsx: Planos do paciente carregados:", plansData);

            } catch (e) {
                console.error("PlanoDetalhe.jsx: Erro ao carregar dados do paciente ou planos:", e);
                setError(`Erro: ${e.message}`);
            } finally {
                setLoading(false);
                console.log("PlanoDetalhe.jsx: Carregamento de dados finalizado.");
            }
        };

        if (patientId) {
            fetchData();
        } else {
            setLoading(false);
            setError("ID do paciente não fornecido na URL.");
            console.warn("PlanoDetalhe.jsx: patientId não encontrado na URL.");
        }
    }, [patientId, isEditModalOpen]); // ATUALIZADO: Adicionado isEditModalOpen para recarregar quando o modal fechar

    const handleAddPlan = async () => {
        if (!patient) {
            alert("Aguarde o carregamento dos dados do paciente para adicionar um plano.");
            return;
        }
        const newPlan = {
            patientId: patientId,
            title: `Novo Plano para ${patient.name} (${new Date().toLocaleDateString('pt-BR')})`,
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            summary: 'Detalhes do novo plano...',
            totalCalories: 0,
            proteins: 0,
            carbs: 0,
            fats: 0,
            status: "Rascunho",
            duration: "0 dias",
            observations: '', // NOVO: Adiciona campo de observações
            meals: []
        };
        try {
            console.log("PlanoDetalhe.jsx: Tentando adicionar novo plano:", newPlan);
            const response = await fetch(`${API_BASE_URL}/foodPlans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPlan),
            });
            if (!response.ok) throw new Error('Falha ao adicionar plano.');
            const addedPlan = await response.json();
            setFoodPlans(prev => [addedPlan, ...prev]);
            console.log("PlanoDetalhe.jsx: Plano adicionado com sucesso:", addedPlan);
            // Abrir o modal de edição imediatamente após adicionar, se desejar
            setCurrentPlanToEdit(addedPlan);
            setIsEditModalOpen(true);
        } catch (e) {
            console.error("PlanoDetalhe.jsx: Erro ao adicionar plano:", e);
            alert("Erro ao adicionar plano. Tente novamente.");
        }
    };

    const handleEditPlan = (plan) => { // ATUALIZADO: Agora recebe o objeto do plano
        console.log("PlanoDetalhe.jsx: Abrindo modal para editar plano:", plan); // LOG
        setCurrentPlanToEdit(plan);
        setIsEditModalOpen(true);
    };

    const handleSavePlan = async (planId, updatedPlanData) => { // NOVO: Função para salvar do modal
        try {
            console.log(`PlanoDetalhe.jsx: Salvando plano ID: ${planId}, Dados:`, updatedPlanData); // LOG
            const response = await fetch(`${API_BASE_URL}/foodPlans/${planId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPlanData),
            });
            if (!response.ok) {
                throw new Error(`Falha ao salvar plano. Status: ${response.status}`);
            }
            const savedPlan = await response.json();
            setFoodPlans(prev => prev.map(p => p.id === planId ? savedPlan : p));
            console.log("PlanoDetalhe.jsx: Plano salvo com sucesso:", savedPlan); // LOG
        } catch (e) {
            console.error("PlanoDetalhe.jsx: Erro ao salvar plano:", e); // LOG
            throw e; // Relançar para que o modal possa capturar e mostrar um erro
        }
    };

    const handleDeletePlan = async (planId, planTitle) => {
        const confirmDelete = window.confirm(`Tem certeza que deseja excluir o plano "${planTitle}"?`);
        if (confirmDelete) {
            try {
                console.log(`PlanoDetalhe.jsx: Tentando excluir plano ID: ${planId}`);
                const response = await fetch(`${API_BASE_URL}/foodPlans/${planId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Falha ao excluir plano.');
                setFoodPlans(prev => prev.filter(plan => plan.id !== planId));
                console.log(`PlanoDetalhe.jsx: Plano ${planId} excluído com sucesso.`);
            } catch (e) {
                console.error("PlanoDetalhe.jsx: Erro ao excluir plano:", e);
                alert("Erro ao excluir plano. Tente novamente.");
            }
        }
    };

    if (loading) {
        return <div className="plano-detalhe-container"><p>Carregando dados do paciente e planos...</p></div>;
    }

    if (error) {
        return <div className="plano-detalhe-container"><p style={{color: 'red'}}>{error}</p></div>;
    }

    if (!patient) {
        return <div className="plano-detalhe-container"><p>Paciente não encontrado.</p></div>;
    }

    return (
        <div className="plano-detalhe-container">
            <div className="plano-detalhe-header">
                <button onClick={() => navigate('/planos')} className="back-btn" title="Voltar para a lista de planos">
                    <FaArrowLeft /> Voltar para Planos
                </button>
                <h1>Planos Alimentares de {patient.name}</h1>
                <p className="patient-summary-detail">{patient.age} Anos - {patient.gender} - {patient.weight}kg - Obj: {patient.objective}</p>
            </div>

            <div className="plano-actions">
                <button onClick={handleAddPlan} className="add-plan-btn" title="Adicionar novo plano para este paciente">
                    <FaPlus /> Adicionar Novo Plano
                </button>
            </div>

            <div className="plan-list">
                {foodPlans.length > 0 ? (
                    foodPlans.map(plan => (
                        <div key={plan.id} className="plan-card">
                            <div className="plan-card-header">
                                <h3>{plan.title}</h3>
                                <span className={`plan-status ${plan.status.toLowerCase().replace(' ', '-')}`}>{plan.status}</span>
                            </div>
                            <p><strong>Período:</strong> {plan.startDate} a {plan.endDate || 'Não definido'}</p>
                            <p><strong>Resumo:</strong> {plan.summary}</p>
                            <div className="macros-info">
                                <span>Kcal: <strong>{plan.totalCalories}</strong></span>
                                <span>Prot: <strong>{plan.proteins}g</strong></span>
                                <span>Carb: <strong>{plan.carbs}g</strong></span>
                                <span>Gord: <strong>{plan.fats}g</strong></span>
                            </div>
                            <div className="plan-card-actions">
                                {/* ATUALIZADO: Passa o objeto do plano para edição */}
                                <button onClick={() => handleEditPlan(plan)} className="edit-plan-btn" title="Editar Plano">
                                    <FaPencilAlt />
                                </button>
                                <button onClick={() => handleDeletePlan(plan.id, plan.title)} className="delete-plan-btn" title="Excluir Plano">
                                    <FaTrashAlt />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Nenhum plano alimentar cadastrado para {patient.name} ainda. Adicione um!</p>
                )}
            </div>

            {/* NOVO: Renderiza o modal de edição */}
            {isEditModalOpen && currentPlanToEdit && (
                <EditPlanModal
                    isOpen={isEditModalOpen}
                    onRequestClose={() => {
                        setIsEditModalOpen(false);
                        setCurrentPlanToEdit(null); // Limpar o plano editado
                        // O useEffect em PlanoDetalhePage será acionado por isEditModalOpen
                        // para recarregar os planos atualizados.
                    }}
                    patient={patient}
                    plan={currentPlanToEdit}
                    onSavePlan={handleSavePlan}
                />
            )}
        </div>
    );
}