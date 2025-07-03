import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaPencilAlt, FaTrashAlt, FaArrowLeft } from 'react-icons/fa';
import EditPlanModal from './EditPlanModal.jsx'; 
import './PlanoDetalhe.css'; 

// Importar o 'db' e funções Firestore necessárias
import { db } from '../../firebase/firebase.js';
import { collection, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';


// ATUALIZADO: Recebe fetchFoodPlansByPatientId como prop
export default function PlanoDetalhePage({ fetchFoodPlansByPatientId }) {
    const { patientId } = useParams(); 
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [foodPlans, setFoodPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
    const [currentPlanToEdit, setCurrentPlanToEdit] = useState(null); 

    // Referência à coleção de planos (já definida em App, mas útil aqui)
    const foodPlansCollectionRef = collection(db, "foodPlans");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            console.log(`PlanoDetalhe.jsx: Iniciando busca de dados para patientId: ${patientId} no Firebase`);
            try {
                // Buscar dados do paciente pelo ID do Firestore
                const patientDocRef = doc(db, "patients", patientId);
                const patientDocSnap = await getDoc(patientDocRef);

                if (!patientDocSnap.exists()) {
                    throw new Error(`Paciente com ID ${patientId} não encontrado no Firestore.`);
                }
                const patientData = { ...patientDocSnap.data(), id: patientDocSnap.id };
                setPatient(patientData);
                console.log("PlanoDetalhe.jsx: Dados do paciente carregados do Firestore:", patientData);

                // Buscar planos de alimentação do paciente usando a prop (Firestore)
                const plansData = await fetchFoodPlansByPatientId(patientId);
                setFoodPlans(plansData);
                console.log("PlanoDetalhe.jsx: Planos do paciente carregados do Firestore:", plansData);

            } catch (e) {
                console.error("PlanoDetalhe.jsx: Erro ao carregar dados do paciente ou planos do Firebase:", e);
                setError(`Erro: ${e.message}`);
            } finally {
                setLoading(false);
                console.log("PlanoDetalhe.jsx: Carregamento de dados do Firebase finalizado.");
            }
        };

        if (patientId) {
            fetchData();
        } else {
            setLoading(false);
            setError("ID do paciente não fornecido na URL.");
            console.warn("PlanoDetalhe.jsx: patientId não encontrado na URL.");
        }
    }, [patientId, isEditModalOpen, fetchFoodPlansByPatientId]); // Adiciona fetchFoodPlansByPatientId como dependência

    const handleAddPlan = async () => {
        if (!patient) {
            alert("Aguarde o carregamento dos dados do paciente para adicionar um plano.");
            return;
        }
        const newPlan = {
            patientId: patientId, // O ID do paciente Firebase
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
            observations: '',
            meals: []
        };
        try {
            console.log("PlanoDetalhe.jsx: Tentando adicionar novo plano ao Firebase:", newPlan);
            const docRef = await addDoc(foodPlansCollectionRef, newPlan);
            const addedPlan = { ...newPlan, id: docRef.id }; // Pega o ID gerado pelo Firebase
            setFoodPlans(prev => [addedPlan, ...prev]);
            console.log("PlanoDetalhe.jsx: Plano adicionado ao Firebase com sucesso:", addedPlan);
            setCurrentPlanToEdit(addedPlan);
            setIsEditModalOpen(true);
        } catch (e) {
            console.error("PlanoDetalhe.jsx: Erro ao adicionar plano ao Firebase:", e);
            alert("Erro ao adicionar plano. Tente novamente.");
        }
    };

    const handleEditPlan = (plan) => { 
        console.log("PlanoDetalhe.jsx: Abrindo modal para editar plano:", plan);
        setCurrentPlanToEdit(plan);
        setIsEditModalOpen(true);
    };

    // handleSavePlan para usar o Firestore (PUT/updateDoc)
    const handleSavePlan = async (planId, updatedPlanData) => { 
        try {
            console.log(`PlanoDetalhe.jsx: Salvando plano ID: ${planId}, Dados:`, updatedPlanData, "no Firebase");
            const planDocRef = doc(db, "foodPlans", planId); // Cria referência ao doc do plano
            await updateDoc(planDocRef, updatedPlanData); // Atualiza o documento

            // Atualiza o estado local para refletir a mudança
            setFoodPlans(prev => prev.map(p => p.id === planId ? { ...updatedPlanData, id: planId } : p));
            console.log("PlanoDetalhe.jsx: Plano salvo no Firebase com sucesso.");
        } catch (e) {
            console.error("PlanoDetalhe.jsx: Erro ao salvar plano no Firebase:", e);
            throw e; 
        }
    };

    // handleDeletePlan para usar o Firestore (DELETE/deleteDoc)
    const handleDeletePlan = async (planId, planTitle) => {
        const confirmDelete = window.confirm(`Tem certeza que deseja excluir o plano "${planTitle}"?`);
        if (confirmDelete) {
            try {
                console.log(`PlanoDetalhe.jsx: Tentando excluir plano ID: ${planId} do Firebase`);
                const planDocRef = doc(db, "foodPlans", planId); // Cria referência ao doc do plano
                await deleteDoc(planDocRef); // Deleta o documento
                setFoodPlans(prev => prev.filter(plan => plan.id !== planId));
                console.log(`PlanoDetalhe.jsx: Plano ${planId} excluído do Firebase com sucesso.`);
            } catch (e) {
                console.error("PlanoDetalhe.jsx: Erro ao excluir plano do Firebase:", e);
                alert("Erro ao excluir plano. Tente novamente.");
            }
        }
    };

    if (loading) {
        return <div className="plano-detalhe-container"><p>Carregando dados do paciente e planos do Firebase...</p></div>;
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

            {isEditModalOpen && currentPlanToEdit && (
                <EditPlanModal
                    isOpen={isEditModalOpen}
                    onRequestClose={() => {
                        setIsEditModalOpen(false);
                        setCurrentPlanToEdit(null); 
                    }}
                    patient={patient}
                    plan={currentPlanToEdit}
                    onSavePlan={handleSavePlan}
                />
            )}
        </div>
    );
}