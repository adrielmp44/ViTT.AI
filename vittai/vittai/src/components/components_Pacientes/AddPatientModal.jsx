import React, { useState, useCallback } from 'react';
import Modal from 'react-modal';
import './AddPatientModal.css';
import { storage } from '../../firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

Modal.setAppElement('#root');

export default function AddPatientModal({ isOpen, onRequestClose, onPatientAdded, user }) {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', birthDate: '', gender: 'Feminino',
        height: '', currentWeight: '', objective: '', photoURL: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);

    const validateForm = useCallback(() => {
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
        if (!formData.height || parseFloat(formData.height) <= 0) newErrors.height = "A altura deve ser um número positivo.";
        if (!formData.currentWeight || parseFloat(formData.currentWeight) <= 0) newErrors.currentWeight = "O peso deve ser um número positivo.";
        if (!formData.objective.trim()) newErrors.objective = "O objetivo é obrigatório.";
        return newErrors;
    }, [formData]);

    const resetForm = useCallback(() => {
        setFormData({
            name: '', email: '', phone: '', birthDate: '', gender: 'Feminino',
            height: '', currentWeight: '', objective: '', photoURL: '',
        });
        setErrors({});
    }, []);

    // --- CORREÇÃO: A FUNÇÃO QUE FALTAVA FOI ADICIONADA AQUI ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file && user) {
            setUploadingImage(true);
            const fileName = `photo-${Date.now()}-${file.name}`;
            const storageRef = ref(storage, `patient_photos/${user.uid}/${fileName}`);
            try {
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                setFormData(prev => ({ ...prev, photoURL: url }));
            } catch (error) {
                console.error("Erro no upload para Firebase Storage:", error);
                alert("Falha ao enviar imagem.");
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            photoURL: formData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
            lastConsult: new Date().toLocaleDateString('pt-BR'),
            email: formData.email,
            phone: formData.phone,
            height: formData.height,
            birthDate: formData.birthDate,
        };

        try {
            await onPatientAdded(newPatientData);
            resetForm();
            onRequestClose();
        } catch (error) {
            console.error("Falha ao adicionar paciente:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleClose = () => {
        resetForm();
        onRequestClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={handleClose} className="modal" overlayClassName="overlay" contentLabel="Adicionar Novo Paciente">
            <div className="modal-header">
                <h2>Adicionar Novo Paciente</h2>
                <button onClick={handleClose} className="close-btn" title="Fechar">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="add-patient-form" noValidate>
                 <div className="form-section">
                    <h3>Informações Pessoais</h3>
                    <div className="form-grid">
                        <div className="form-group"><label htmlFor="name">Nome Completo *</label><input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className={errors.name ? 'has-error' : ''} />{errors.name && <p className="error-message">{errors.name}</p>}</div>
                        <div className="form-group"><label htmlFor="birthDate">Data de Nascimento *</label><input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleInputChange} className={errors.birthDate ? 'has-error' : ''} />{errors.birthDate && <p className="error-message">{errors.birthDate}</p>}</div>
                        <div className="form-group"><label htmlFor="email">Email *</label><input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={errors.email ? 'has-error' : ''} />{errors.email && <p className="error-message">{errors.email}</p>}</div>
                        <div className="form-group"><label htmlFor="phone">Telefone *</label><input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} /></div>
                        <div className="form-group"><label htmlFor="gender">Gênero</label><select id="gender" name="gender" value={formData.gender} onChange={handleInputChange}><option>Feminino</option><option>Masculino</option></select></div>
                        <div className="form-group"><label htmlFor="photoFile">Foto</label><input type="file" id="photoFile" name="photoFile" accept="image/*" onChange={handleFileChange} disabled={uploadingImage} />{uploadingImage && <p>Enviando...</p>}{formData.photoURL && <img src={formData.photoURL} alt="Preview" style={{ marginTop: '10px', maxWidth: '100px', borderRadius: '8px' }} />}</div>
                    </div>
                </div>
                <div className="form-section">
                    <h3>Informações Físicas e Objetivos</h3>
                    <div className="form-grid">
                        <div className="form-group"><label htmlFor="height">Altura (cm) *</label><input type="number" id="height" name="height" value={formData.height} onChange={handleInputChange} />{errors.height && <p className="error-message">{errors.height}</p>}</div>
                        <div className="form-group"><label htmlFor="currentWeight">Peso Atual (kg) *</label><input type="number" id="currentWeight" name="currentWeight" step="0.1" value={formData.currentWeight} onChange={handleInputChange} />{errors.currentWeight && <p className="error-message">{errors.currentWeight}</p>}</div>
                        <div className="form-group"><label htmlFor="objective">Objetivo Principal *</label><input type="text" id="objective" name="objective" value={formData.objective} onChange={handleInputChange} />{errors.objective && <p className="error-message">{errors.objective}</p>}</div>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="button" onClick={handleClose} className="btn-cancel" disabled={isSubmitting || uploadingImage}>Cancelar</button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting || uploadingImage}>{isSubmitting ? 'Salvando...' : 'Salvar Paciente'}</button>
                </div>
            </form>
        </Modal>
    );
}