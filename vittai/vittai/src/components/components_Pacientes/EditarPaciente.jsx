import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditarPaciente.css'

const getPatientById = (id, patients) => {
    return patients.find(p => p.id.toString() === id);
};


export default function EditarPacientes({ patients, setPatients }) {
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedPatients = patients.map(p =>
            p.id.toString() === id ? { ...p, ...formData, weight: formData.currentWeight } : p
        );
        setPatients(updatedPatients);
        navigate('/'); // Volta para a lista de pacientes
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
                        </div>
                        <div className="form-group">
                            <label>Data de Nascimento</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Telefone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
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
                        </div>
                        <div className="form-group">
                            <label>Peso Atual (kg)</label>
                            <input type="number" name="currentWeight" step="0.1" value={formData.currentWeight} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Objetivo Principal</label>
                            <input type="text" name="objective" value={formData.objective} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/')} className="btn-cancel">Cancelar</button>
                    <button type="submit" className="btn-submit">Salvar Alterações</button>
                </div>
            </form>
        </div>
    );
}