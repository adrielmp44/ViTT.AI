import React, { useState, useCallback } from 'react';
import Modal from 'react-modal';
// Se FaPlus for usado no JSX do AddPatientModal, mantenha. Caso contrário, pode remover.
// Pelo código anterior, FaPlus não era usado diretamente no JSX deste modal.
// import { FaPlus } from 'react-icons/fa'; 

import './AddPatientModal.css'; // Este é o CSS CORRETO para este modal

// Importe a configuração do Cloudinary.
// O caminho deve ser ajustado com base na localização exata do seu arquivo.
// Se está em src/config/cloudinaryConfig.js e o modal em src/components/components_Pacientes/, então '../../config/cloudinaryConfig'.
import cloudinaryConfig from '../../firebase/cloudinaryConfig'; 

// Garante que o elemento raiz da sua aplicação está configurado para o Modal.
// Isso geralmente é feito uma vez no seu main.jsx ou index.js
Modal.setAppElement('#root');

export default function AddPatientModal({ isOpen, onRequestClose, onPatientAdded }) {
    // 1. Definição dos Estados (TODOS OS HOOKS DEVEM VIR PRIMEIRO)
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        phone: '', 
        birthDate: '', 
        gender: 'Feminino',
        height: '', 
        currentWeight: '', 
        objective: '', 
        photoURL: '' // Armazenará a URL do Cloudinary
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);

    // 2. Funções de Validação (useCallback para otimização)
    const validateForm = useCallback(() => {
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
    }, [formData]);

    // 3. Renderização Condicional (DEPOIS DOS HOOKS)
    if (!isOpen) return null; // Renderiza null se o modal não estiver aberto

    // 4. Handlers de Eventos
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // console.log(`Input changed: ${name}, value: ${value}`); // Para depuração
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadingImage(true); 
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('upload_preset', cloudinaryConfig.uploadPreset); 

            try {
                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
                    {
                        method: 'POST',
                        body: uploadFormData,
                    }
                );
                if (!response.ok) {
                    throw new Error(`Upload para Cloudinary falhou: ${response.statusText}`);
                }
                const data = await response.json();
                console.log("Cloudinary Upload Response:", data); 
                setFormData(prev => ({ ...prev, photoURL: data.secure_url })); 
                alert("Imagem enviada com sucesso para o Cloudinary!");
            } catch (error) {
                console.error("Erro ao enviar imagem para o Cloudinary:", error);
                alert("Falha ao enviar imagem. Verifique o console.");
                setFormData(prev => ({ ...prev, photoURL: '' })); 
            } finally {
                setUploadingImage(false); 
            }
        } else {
            setFormData(prev => ({ ...prev, photoURL: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // PREVINE O RECARREGAMENTO DA PÁGINA

        if (uploadingImage) {
            alert("Aguarde o upload da imagem ser concluído.");
            return;
        }

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors); 
            return; 
        }

        setErrors({}); 
        setIsSubmitting(true);

        const photoURLToSave = formData.photoURL || 'https://via.placeholder.com/80?text=NP'; 

        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const newPatientData = {
            name: formData.name, 
            age: age.toString(), 
            gender: formData.gender,
            weight: formData.currentWeight, 
            objective: formData.objective, 
            photoURL: photoURLToSave, 
            lastConsult: new Date().toLocaleDateString('pt-BR'), 
            email: formData.email,
            phone: formData.phone, 
            height: formData.height
        };

        try {
            await onPatientAdded(newPatientData);
            onRequestClose(); 

            // Limpa o formulário após o sucesso para a próxima abertura do modal
            setFormData({
                name: '', email: '', phone: '', birthDate: '', gender: 'Feminino',
                height: '', currentWeight: '', objective: '', photoURL: '',
            });
        } catch (error) {
            console.error("Falha ao adicionar paciente:", error);
            // Aqui você pode adicionar um setErrors para mostrar ao usuário que o salvamento falhou
        } finally {
            setIsSubmitting(false); 
        }
    };

    // 5. Renderização do JSX
    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onRequestClose} 
            className="modal" // Classe definida no AddPatientModal.css
            overlayClassName="overlay"
            contentLabel="Adicionar Novo Paciente" 
        >
            <div className="modal-header">
                <h2>Adicionar Novo Paciente</h2>
                <button onClick={onRequestClose} className="close-btn" title="Fechar">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="add-patient-form" noValidate>
                <div className="form-section">
                    <h3>Informações Pessoais</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">Nome Completo *</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={formData.name} // Controlado
                                onChange={handleInputChange} // Atualizado
                                className={errors.name ? 'has-error' : ''}
                            />
                            {errors.name && <p className="error-message">{errors.name}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="birthDate">Data de Nascimento *</label>
                            <input 
                                type="date" 
                                id="birthDate" 
                                name="birthDate" 
                                value={formData.birthDate} // Controlado
                                onChange={handleInputChange} // Atualizado
                                className={errors.birthDate ? 'has-error' : ''}
                            />
                            {errors.birthDate && <p className="error-message">{errors.birthDate}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email} // Controlado
                                onChange={handleInputChange} // Atualizado
                                className={errors.email ? 'has-error' : ''}
                            />
                            {errors.email && <p className="error-message">{errors.email}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Telefone *</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                value={formData.phone} // Controlado
                                onChange={handleInputChange} // Atualizado
                                className={errors.phone ? 'has-error' : ''}
                            />
                            {errors.phone && <p className="error-message">{errors.phone}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="gender">Gênero</label>
                            <select 
                                id="gender" 
                                name="gender" 
                                value={formData.gender} // Controlado
                                onChange={handleInputChange} // Atualizado
                            >
                                <option>Feminino</option>
                                <option>Masculino</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="photoFile">Foto</label>
                            <input 
                                type="file" 
                                id="photoFile" 
                                name="photoFile" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                disabled={uploadingImage} 
                            />
                            {uploadingImage && <p>Enviando imagem...</p>}
                            {formData.photoURL && formData.photoURL.startsWith('http') && (
                                <img 
                                    src={formData.photoURL} 
                                    alt="Pré-visualização da foto" 
                                    style={{ marginTop: '10px', maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', objectFit: 'cover' }} 
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Informações Físicas e Objetivos</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="height">Altura (cm) *</label>
                            <input 
                                type="number" 
                                id="height" 
                                name="height" 
                                value={formData.height} // Controlado
                                onChange={handleInputChange} // Atualizado
                                className={errors.height ? 'has-error' : ''}
                            />
                            {errors.height && <p className="error-message">{errors.height}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="currentWeight">Peso Atual (kg) *</label>
                            <input 
                                type="number" 
                                id="currentWeight" 
                                name="currentWeight" 
                                step="0.1" 
                                value={formData.currentWeight} // Controlado
                                onChange={handleInputChange} // Atualizado
                                className={errors.currentWeight ? 'has-error' : ''}
                            />
                            {errors.currentWeight && <p className="error-message">{errors.currentWeight}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="objective">Objetivo Principal *</label>
                            <input 
                                type="text" 
                                id="objective" 
                                name="objective" 
                                value={formData.objective} // Controlado
                                onChange={handleInputChange} // Atualizado
                                className={errors.objective ? 'has-error' : ''}
                            />
                            {errors.objective && <p className="error-message">{errors.objective}</p>}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onRequestClose} className="btn-cancel" disabled={isSubmitting || uploadingImage}>Cancelar</button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting || uploadingImage}>
                        {isSubmitting ? 'Salvando...' : (uploadingImage ? 'Enviando Imagem...' : 'Salvar Paciente')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}