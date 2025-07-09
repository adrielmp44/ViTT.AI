import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlus, FaPencilAlt, FaTrashAlt, FaArrowLeft } from 'react-icons/fa';
import EditPlanModal from './EditPlanModal.jsx'; 
import './PlanoDetalhe.css'; 

import { db } from '../../firebase/firebase.js';
import { collection, getDoc, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function PlanoDetalhePage({ user, fetchFoodPlansByPatientId }) {
    const { patientId } = useParams(); 
    const navigate = useNavigate();
    
    const [patient, setPatient] = useState(null);
    const [foodPlans, setFoodPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
    const [currentPlanToEdit, setCurrentPlanToEdit] = useState(null); 

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !patientId) {
                setError("Dados do usuário ou paciente indisponíveis.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const patientDocRef = doc(db, 'users', user.uid, 'patients', patientId);
                const patientDocSnap = await getDoc(patientDocRef);
                if (!patientDocSnap.exists()) throw new Error("Paciente não encontrado.");
                setPatient({ id: patientDocSnap.id, ...patientDocSnap.data() });

                const plansData = await fetchFoodPlansByPatientId(user.uid, patientId);
                setFoodPlans(plansData);
            } catch (e) {
                console.error("PlanoDetalhe.jsx: Erro ao carregar dados:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, patientId, fetchFoodPlansByPatientId]);

    const handleAddPlan = async () => {
        if (!user || !patient) return;
        const newPlan = {
            title: `Novo Plano para ${patient.name} (${new Date().toLocaleDateString('pt-BR')})`,
            startDate: new Date().toISOString().split('T')[0],
            endDate: '', summary: 'Detalhes...', totalCalories: 0, proteins: 0,
            carbs: 0, fats: 0, status: "Rascunho", duration: "0 dias",
            observations: '', meals: []
        };
        try {
            const foodPlansCollectionRef = collection(db, 'users', user.uid, 'patients', patientId, 'foodPlans');
            const docRef = await addDoc(foodPlansCollectionRef, newPlan);
            const addedPlan = { ...newPlan, id: docRef.id };
            setFoodPlans(prev => [addedPlan, ...prev]);
            setCurrentPlanToEdit(addedPlan);
            setIsEditModalOpen(true);
        } catch (e) { console.error("Erro ao adicionar plano:", e); }
    };

    const handleEditPlan = (plan) => { 
        setCurrentPlanToEdit(plan);
        setIsEditModalOpen(true);
    };

    const handleSavePlan = async (planId, updatedPlanData) => { 
        if (!user) return;
        try {
            const planDocRef = doc(db, 'users', user.uid, 'patients', patientId, 'foodPlans', planId);
            await updateDoc(planDocRef, updatedPlanData);
            setFoodPlans(prev => prev.map(p => p.id === planId ? { ...updatedPlanData, id: planId } : p));
        } catch (e) {
            console.error("Erro ao salvar plano:", e);
            throw e; 
        }
    };

    const handleDeletePlan = async (planId, planTitle) => {
        if (!user || !window.confirm(`Tem certeza que deseja excluir o plano "${planTitle}"?`)) return;
        try {
            const planDocRef = doc(db, 'users', user.uid, 'patients', patientId, 'foodPlans', planId);
            await deleteDoc(planDocRef);
            setFoodPlans(prev => prev.filter(plan => plan.id !== planId));
        } catch (e) { console.error("Erro ao excluir plano:", e); }
    };

    if (loading) return <div className="plano-detalhe-container"><p>Carregando dados...</p></div>;
    if (error) return <div className="plano-detalhe-container"><p style={{color: 'red'}}>{error}</p></div>;
    if (!patient) return <div className="plano-detalhe-container"><p>Paciente não encontrado.</p></div>;

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
                                <span className={`plan-status ${plan.status?.toLowerCase().replace(' ', '-')}`}>{plan.status}</span>
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
                                <button onClick={() => handleEditPlan(plan)} className="edit-plan-btn" title="Editar Plano"><FaPencilAlt /></button>
                                <button onClick={() => handleDeletePlan(plan.id, plan.title)} className="delete-plan-btn" title="Excluir Plano"><FaTrashAlt /></button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Nenhum plano alimentar cadastrado para {patient.name} ainda. Adicione um!</p>
                )}
            </div>

            {/* --- CORREÇÃO PRINCIPAL AQUI --- */}
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