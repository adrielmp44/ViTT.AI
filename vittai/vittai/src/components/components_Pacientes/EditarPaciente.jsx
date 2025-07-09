import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarPaciente.css';
import { FaTrashAlt, FaArrowLeft } from 'react-icons/fa';
import { storage } from '../../firebase/firebase.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export default function EditPatientPage({ user, patients, setPatients, onDeletePatient }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const patientData = patients.find(p => p.id === id);

    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', birthDate: '', gender: 'Feminino',
        height: '', currentWeight: '', objective: '',
    });
    
    const [newPhotoFile, setNewPhotoFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [currentPhotoUrl, setCurrentPhotoUrl] = useState('');
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
            });
            setCurrentPhotoUrl(patientData.photoURL || '');
        }
    }, [patientData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewPhotoFile(file);
            setCurrentPhotoUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let photoURLToUpdate = patientData.photoURL;

    // Se houver uma nova imagem para upload
    if (newPhotoFile && user) {
        setIsUploading(true);
        
        try {
            // Primeiro, deleta a imagem antiga se existir
            if (patientData.photoURL) {
                try {
                    const oldPhotoRef = ref(storage, patientData.photoURL);
                    await deleteObject(oldPhotoRef);
                } catch (error) {
                    console.warn("Não foi possível deletar a imagem antiga:", error);
                    // Continua o processo mesmo se falhar em deletar a imagem antiga
                }
            }

            // Faz upload da nova imagem
            const fileName = `photo-${Date.now()}-${newPhotoFile.name}`;
            const storageRef = ref(storage, `patient_photos/${user.uid}/${id}-${fileName}`);
            await uploadBytes(storageRef, newPhotoFile);
            photoURLToUpdate = await getDownloadURL(storageRef);
        } catch (error) {
            console.error("Falha ao processar a foto:", error);
            alert("Houve um erro ao salvar a nova foto.");
            setIsSubmitting(false);
            setIsUploading(false);
            return;
        }
    }

    // Calcula a idade
    const birthDate = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    // Prepara os dados para atualização
    const dataToUpdate = { 
        ...patientData, 
        ...formData, 
        age: age.toString(), 
        weight: formData.currentWeight,
        photoURL: photoURLToUpdate,
    };
    delete dataToUpdate.currentWeight; 

    try {
        await setPatients(id, dataToUpdate);
        navigate('/pacientes');
    } catch (error) {
        console.error("Falha ao atualizar paciente:", error);
    } finally {
        setIsSubmitting(false);
        setIsUploading(false);
    }
};

    const handleDeleteClick = async () => {
        await onDeletePatient(id);
        navigate('/pacientes');
    };

    if (!patientData) {
        return <div className="edit-patient-container"><h1>Carregando ou paciente não encontrado...</h1></div>;
    }

    return (
        <div className="edit-patient-container">
            <div className="edit-patient-header">
                <button onClick={() => navigate('/pacientes')} className="back-btn" title="Voltar"><FaArrowLeft /></button>
                <h1>Editar Perfil de {patientData.name}</h1>
                {currentPhotoUrl && <img src={currentPhotoUrl} alt={formData.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />}
            </div>
            <form onSubmit={handleSubmit} className="edit-patient-form" noValidate>
                 <div className="form-section">
                    <h3>Informações Pessoais</h3>
                    <div className="form-grid">
                        <div className="form-group"><label>Nome</label><input name="name" value={formData.name} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Data de Nascimento</label><input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Telefone</label><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Gênero</label><select name="gender" value={formData.gender} onChange={handleInputChange}><option>Feminino</option><option>Masculino</option></select></div>
                        <div className="form-group"><label htmlFor="photoFile">Alterar Foto</label><input type="file" id="photoFile" accept="image/*" onChange={handleFileChange} disabled={isUploading} />{isUploading && <p>Enviando...</p>}</div>
                    </div>
                </div>
                <div className="form-section">
                    <h3>Informações Físicas e Objetivos</h3>
                     <div className="form-grid">
                        <div className="form-group"><label>Altura (cm)</label><input type="number" name="height" value={formData.height} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Peso (kg)</label><input type="number" name="currentWeight" value={formData.currentWeight} onChange={handleInputChange} /></div>
                        <div className="form-group"><label>Objetivo</label><input name="objective" value={formData.objective} onChange={handleInputChange} /></div>
                     </div>
                </div>
                <div className="form-actions">
                    <button type="button" onClick={handleDeleteClick} className="btn-delete-patient" disabled={isSubmitting}><FaTrashAlt /> Excluir Perfil</button>
                    <button type="button" onClick={() => navigate('/pacientes')} className="btn-cancel" disabled={isSubmitting}>Cancelar</button>
                    <button type="submit" className="btn-submit" disabled={isSubmitting || isUploading}>{isSubmitting ? 'Salvando...' : 'Salvar Alterações'}</button>
                </div>
            </form>
        </div>
    );
}