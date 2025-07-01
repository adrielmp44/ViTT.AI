import React, { useState } from 'react';
import Modal from 'react-modal';
import './AddPatientModal.css';

Modal.setAppElement('#root');

export default function AddPatientModal({ isOpen, onRequestClose, onPatientAdded }) {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', birthDate: '', gender: 'Feminino',
        height: '', currentWeight: '', objective: '', photoFile: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // NOVO: Estado para armazenar as mensagens de erro de cada campo
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFormData(prev => ({ ...prev, photoFile: e.target.files[0] }));
        }
    };

    // NOVO: Função que valida todos os campos
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
        // CHAMA A VALIDAÇÃO AQUI
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // Para a submissão se houver erros
        }

        // Limpa os erros se o formulário for válido
        setErrors({});
        setIsSubmitting(true);

        const photoURL = formData.photoFile ? URL.createObjectURL(formData.photoFile) : '';

        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const newPatient = {
            id: `patient-${Date.now()}`, name: formData.name, age, gender: formData.gender,
            weight: formData.currentWeight, objective: formData.objective, photoURL,
            lastConsult: new Date().toLocaleDateString('pt-BR'), email: formData.email,
            phone: formData.phone, height: formData.height
        };

        onPatientAdded(newPatient);
        setIsSubmitting(false);
        onRequestClose();
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="modal" overlayClassName="overlay">
            <div className="modal-header">
                <h2>Adicionar Novo Paciente</h2>
                <button onClick={onRequestClose} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="add-patient-form" noValidate>
                <div className="form-section">
                    <h3>Informações Pessoais</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nome Completo *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
                            {errors.name && <p className="error-message">{errors.name}</p>}
                        </div>
                        <div className="form-group">
                            <label>Data de Nascimento *</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                            {errors.birthDate && <p className="error-message">{errors.birthDate}</p>}
                        </div>
                        <div className="form-group">
                            <label>Email *</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>
                        <div className="form-group">
                            <label>Telefone *</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
                            {errors.phone && <p className="error-message">{errors.phone}</p>}
                        </div>
                        <div className="form-group">
                            <label>Gênero</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange}><option>Feminino</option><option>Masculino</option></select>
                        </div>
                        <div className="form-group">
                            <label>Foto</label>
                            <input type="file" name="photoFile" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Informações Físicas e Objetivos</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Altura (cm) *</label>
                            <input type="number" name="height" value={formData.height} onChange={handleInputChange} />
                            {errors.height && <p className="error-message">{errors.height}</p>}
                        </div>
                        <div className="form-group">
                            <label>Peso Atual (kg) *</label>
                            <input type="number" name="currentWeight" step="0.1" value={formData.currentWeight} onChange={handleInputChange} />
                            {errors.currentWeight && <p className="error-message">{errors.currentWeight}</p>}
                        </div>
                        <div className="form-group">
                            <label>Objetivo Principal *</label>
                            <input type="text" name="objective" value={formData.objective} onChange={handleInputChange} />
                            {errors.objective && <p className="error-message">{errors.objective}</p>}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onRequestClose} className="btn-cancel" disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Salvando...' : 'Salvar Paciente'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}