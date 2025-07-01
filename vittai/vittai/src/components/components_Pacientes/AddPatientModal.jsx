import React, { useState } from 'react';
import './AddPatientModal.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

export default function AddPatientModal({ isOpen, onRequestClose, onPatientAdded }) {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Masculino');
    const [weight, setWeight] = useState('');
    const [objective, setObjective] = useState('');
    const [photoFile, setPhotoFile] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) return;

        const photoURL = photoFile ? URL.createObjectURL(photoFile) : '';

        const newPatient = {
            id: Date.now(), 
            name,
            age,
            gender,
            weight,
            objective,
            photoURL,
            lastConsult: new Date().toLocaleDateString('pt-BR'),
        };

        onPatientAdded(newPatient); 
        onRequestClose(); 
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="modal" overlayClassName="overlay">
            <h2>Adicionar Novo Paciente</h2>
            <form onSubmit={handleSubmit} className="add-patient-form">
                <div className="form-group"><label>Nome Completo</label><input type="text" value={name} onChange={e => setName(e.target.value)} required /></div>
                <div className="form-group"><label>Foto</label><input type="file" accept="image/*" onChange={handleFileChange} /></div>
                <div className="form-row">
                    <div className="form-group"><label>Idade</label><input type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
                    <div className="form-group"><label>Gênero</label><select value={gender} onChange={e => setGender(e.target.value)}><option>Masculino</option><option>Feminino</option></select></div>
                </div>
                <div className="form-group"><label>Peso (kg)</label><input type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
                <div className="form-group"><label>Objetivo</label><input type="text" value={objective} onChange={e => setObjective(e.target.value)} /></div>
                <div className="form-actions">
                    <button type="button" onClick={onRequestClose} className="btn-cancel">Cancelar</button>
                    <button type="submit" className="btn-submit">Salvar Paciente</button>
                </div>
            </form>
        </Modal>
    );
}