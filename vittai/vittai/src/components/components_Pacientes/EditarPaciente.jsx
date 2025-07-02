import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarPaciente.css' // Certifique-se que este CSS está no local correto
import { FaTrashAlt } from 'react-icons/fa'; // Importar ícone de lixeira

const getPatientById = (id, patients) => {
    return patients.find(p => p.id.toString() === id);
};

// ATUALIZADO: Adiciona onDeletePatient como prop
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
    });

    // Estado para mensagens de erro (opcional, mas bom ter para consistência)
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // NOVO: Função de validação para a edição (similar ao AddPatientModal)
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "O nome é obrigatório.";
        if (!formData.birthDate) {
            newErrors.birthDate = "A data de nascimento é obrigatória.";
        } else if (new Date(formData.birthDate) > new Date()) {
            newErrors.birthDate = "A data de nascimento não pode ser no futuro.";
        }
        if (!formData.email) {
            newErrors.email = "O email é obrigatório.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "O formato do email é inválido.";
        }
        if (!formData.phone) newErrors.phone = "O telefone é obrigatório.";
        if (!formData.height || formData.height <= 0) newErrors.height = "A altura deve ser um número positivo.";
        if (!formData.currentWeight || formData.currentWeight <= 0) newErrors.currentWeight = "O peso deve ser um número positivo.";
        if (!formData.objective.trim()) newErrors.objective = "O objetivo é obrigatório.";
        return newErrors;
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; 
        }
        setErrors({}); // Limpa erros se a validação passar

        const updatedPatients = patients.map(p =>
            p.id.toString() === id ? { ...p, ...formData, weight: formData.currentWeight } : p
        );
        setPatients(updatedPatients);
        navigate('/pacientes'); // Volta para a lista de pacientes
    };

    // NOVO: Função para lidar com a exclusão
    const handleDeleteClick = () => {
        const confirmDelete = window.confirm(`Tem certeza que deseja excluir o paciente ${patientData.name}?`);
        if (confirmDelete) {
            onDeletePatient(id); // Chama a função passada via prop
            navigate('/pacientes'); // Redireciona para a lista de pacientes após a exclusão
        }
    };

    if (!patientData) {
        return <div>Paciente não encontrado.</div>;
    }

    return (
        <div className="edit-patient-container">
            <div className="edit-patient-header">
                <button onClick={() => navigate(-1)} className="back-btn">&larr; Voltar</button>
                <h1>Editar Perfil do Paciente</h1>
            </div>
            <form onSubmit={handleSubmit} className="edit-patient-form">
                <div className="form-section">
                    <h3>Informações Pessoais</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nome Completo</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                            {errors.name && <p className="error-message">{errors.name}</p>} {/* Exibe erro */}
                        </div>
                        <div className="form-group">
                            <label>Data de Nascimento</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                            {errors.birthDate && <p className="error-message">{errors.birthDate}</p>} {/* Exibe erro */}
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                            {errors.email && <p className="error-message">{errors.email}</p>} {/* Exibe erro */}
                        </div>
                        <div className="form-group">
                            <label>Telefone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                            {errors.phone && <p className="error-message">{errors.phone}</p>} {/* Exibe erro */}
                        </div>
                        <div className="form-group">
                            <label>Gênero</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange}>
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
                            <label>Altura (cm)</label>
                            <input type="number" name="height" value={formData.height} onChange={handleInputChange} />
                            {errors.height && <p className="error-message">{errors.height}</p>} {/* Exibe erro */}
                        </div>
                        <div className="form-group">
                            <label>Peso Atual (kg)</label>
                            <input type="number" name="currentWeight" step="0.1" value={formData.currentWeight} onChange={handleInputChange} />
                            {errors.currentWeight && <p className="error-message">{errors.currentWeight}</p>} {/* Exibe erro */}
                        </div>
                        <div className="form-group">
                            <label>Objetivo Principal</label>
                            <input type="text" name="objective" value={formData.objective} onChange={handleInputChange} />
                            {errors.objective && <p className="error-message">{errors.objective}</p>} {/* Exibe erro */}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/pacientes')} className="btn-cancel">Cancelar</button>
                    <button type="submit" className="btn-submit">Salvar Alterações</button>
                    {/* NOVO: Botão de Excluir */}
                    <button 
                        type="button" 
                        onClick={handleDeleteClick} 
                        className="btn-delete-patient" // Adicionar essa classe para estilização
                    >
                        <FaTrashAlt /> Excluir Perfil
                    </button>
                </div>
            </form>
        </div>
    );
}