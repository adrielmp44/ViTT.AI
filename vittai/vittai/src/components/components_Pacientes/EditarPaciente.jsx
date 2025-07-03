import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarPaciente.css'
import { FaTrashAlt } from 'react-icons/fa';

const getPatientById = (id, patients) => {
    return patients.find(p => p.id.toString() === id);
};

export default function EditarPacientes({ patients, setPatients, onDeletePatient }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const patientData = getPatientById(id, patients); 

    const [formData, setFormData] = useState({
        name: patientData?.name || '',
        email: patientData?.email || '',
        phone: patientData?.phone || '',
        birthDate: patientData?.birthDate || '',
        gender: patientData?.gender || 'Feminino',
        height: patientData?.height || '',
        currentWeight: patientData?.weight || '', 
        objective: patientData?.objective || '',
        // photoURL: patientData?.photoURL || '', // Manter a photoURL para exibição
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (patientData) {
            setFormData({
                name: patientData.name || '',
                email: patientData.email || '',
                phone: patientData.phone || '',
                birthDate: patientData.birthDate || '',
                gender: patientData.gender || 'Feminino',
                height: patientData.height || '',
                currentWeight: patientData.weight || '', 
                objective: patientData.objective || '',
                // photoURL: patientData.photoURL || '', // Atualizar photoURL aqui também
            });
        }
    }, [patientData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "O nome é obrigatório.";
        
        if (!formData.birthDate) {
            newErrors.birthDate = "A data de nascimento é obrigatória.";
        } else {
            const birth = new Date(formData.birthDate);
            const today = new Date();
            if (birth > today) {
                newErrors.birthDate = "A data de nascimento não pode ser no futuro.";
            }
        }
        
        if (!formData.email) {
            newErrors.email = "O email é obrigatório.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "O formato do email é inválido.";
        }
        
        if (!formData.phone) newErrors.phone = "O telefone é obrigatório.";
        
        if (!formData.height || parseFloat(formData.height) <= 0) newErrors.height = "A altura deve ser um número positivo.";
        if (!formData.currentWeight || parseFloat(formData.currentWeight) <= 0) newErrors.currentWeight = "O peso deve ser um número positivo.";
        
        if (!formData.objective.trim()) newErrors.objective = "O objetivo é obrigatório.";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; 
        }
        setErrors({});
        setIsSubmitting(true);

        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const dataToUpdate = { 
            ...patientData, 
            ...formData, 
            age: age.toString(), 
            weight: formData.currentWeight 
        };
        
        delete dataToUpdate.currentWeight; 

        try {
            console.log("EditarPaciente.jsx: Tentando atualizar paciente ID:", id, "com dados:", dataToUpdate); 
            await setPatients(id, dataToUpdate); 
            navigate('/pacientes'); 
        } catch (error) {
            console.error("EditarPaciente.jsx: Falha ao atualizar paciente:", error); 
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = async () => {
        const confirmDelete = window.confirm(`Tem certeza que deseja excluir o paciente ${patientData.name}? Esta ação não pode ser desfeita.`);
        if (confirmDelete) {
            setIsSubmitting(true); 
            try {
                console.log("EditarPaciente.jsx: Tentando deletar paciente ID:", id); 
                await onDeletePatient(id); 
                navigate('/pacientes'); 
            } catch (error) {
                console.error("EditarPaciente.jsx: Falha ao deletar paciente:", error); 
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (!patientData) {
        return (
            <div className="edit-patient-container">
                <div className="edit-patient-header">
                    <button onClick={() => navigate(-1)} className="back-btn" title="Voltar">&larr; Voltar</button>
                    <h1>Paciente não encontrado.</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-patient-container">
            <div className="edit-patient-header">
                <button onClick={() => navigate(-1)} className="back-btn" title="Voltar">&larr; Voltar</button>
                <h1>Editar Perfil do Paciente</h1>
                {/* Exibir foto do paciente aqui */}
                {patientData.photoURL && patientData.photoURL.startsWith('http') && (
                    <img 
                        src={patientData.photoURL} 
                        alt={patientData.name} 
                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginLeft: '20px' }} 
                    />
                )}
            </div>
            <form onSubmit={handleSubmit} className="edit-patient-form" noValidate>
                <div className="form-section">
                    <h3>Informações Pessoais</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="edit-name">Nome Completo</label>
                            <input 
                                type="text" 
                                id="edit-name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                className={errors.name ? 'has-error' : ''}
                            />
                            {errors.name && <p className="error-message">{errors.name}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-birthDate">Data de Nascimento</label>
                            <input 
                                type="date" 
                                id="edit-birthDate" 
                                name="birthDate" 
                                value={formData.birthDate} 
                                onChange={handleInputChange} 
                                className={errors.birthDate ? 'has-error' : ''}
                            />
                            {errors.birthDate && <p className="error-message">{errors.birthDate}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-email">Email</label>
                            <input 
                                type="email" 
                                id="edit-email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleInputChange} 
                                className={errors.email ? 'has-error' : ''}
                            />
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-phone">Telefone</label>
                            <input 
                                type="tel" 
                                id="edit-phone" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                className={errors.phone ? 'has-error' : ''}
                            />
                            {errors.phone && <p className="error-message">{errors.phone}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-gender">Gênero</label>
                            <select 
                                id="edit-gender" 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleInputChange}
                            >
                                <option>Feminino</option>
                                <option>Masculino</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Informações Físicas e Objetivos</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="edit-height">Altura (cm)</label>
                            <input 
                                type="number" 
                                id="edit-height" 
                                name="height" 
                                value={formData.height} 
                                onChange={handleInputChange} 
                                className={errors.height ? 'has-error' : ''}
                            />
                            {errors.height && <p className="error-message">{errors.height}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-currentWeight">Peso Atual (kg)</label>
                            <input 
                                type="number" 
                                id="edit-currentWeight" 
                                name="currentWeight" 
                                step="0.1" 
                                value={formData.currentWeight} 
                                onChange={handleInputChange} 
                                className={errors.currentWeight ? 'has-error' : ''}
                            />
                            {errors.currentWeight && <p className="error-message">{errors.currentWeight}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="edit-objective">Objetivo Principal</label>
                            <input 
                                type="text" 
                                id="edit-objective" 
                                name="objective" 
                                value={formData.objective} 
                                onChange={handleInputChange} 
                                className={errors.objective ? 'has-error' : ''}
                            />
                            {errors.objective && <p className="error-message">{errors.objective}</p>}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/pacientes')} className="btn-cancel" disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleDeleteClick} 
                        className="btn-delete-patient" 
                        disabled={isSubmitting} 
                        title={`Excluir ${patientData?.name || 'paciente'}`}
                    >
                        <FaTrashAlt /> Excluir Perfil
                    </button>
                </div>
            </form>
        </div>
    );
}