import React, { useState } from 'react';
import Modal from 'react-modal';
import './AddPatientModal.css';

// Certifique-se de que o elemento principal do seu aplicativo está configurado para o Modal.
// Geralmente, isso é feito no index.js ou App.js principal: Modal.setAppElement('#root');
Modal.setAppElement('#root'); // Assumindo que seu elemento raiz é #root



export default function AddPatientModal({ isOpen, onRequestClose, onPatientAdded }) {
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        phone: '', 
        birthDate: '', 
        gender: 'Feminino',
        height: '', 
        currentWeight: '', 
        objective: '', 
        photoFile: null, // Usado temporariamente para o input de arquivo
        photoURL: '' // Armazenará a string Base64 da imagem
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Quando o arquivo é lido, a URL Base64 é armazenada em photoURL
                setFormData(prev => ({ ...prev, photoFile: file, photoURL: reader.result }));
            };
            reader.readAsDataURL(file); // Lê o arquivo como uma URL de dados (Base64)
        } else {
            // Limpa a foto se nenhum arquivo for selecionado ou o existente for removido
            setFormData(prev => ({ ...prev, photoFile: null, photoURL: '' }));
        }
    };

    // Função de validação para todos os campos do formulário
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = "O nome é obrigatório.";
        
        if (!formData.birthDate) {
            newErrors.birthDate = "A data de nascimento é obrigatória.";
        } else {
            const birth = new Date(formData.birthDate);
            const today = new Date();
            // Para garantir que a data de nascimento não seja no futuro
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
        
        // Validação para números positivos para altura e peso
        if (!formData.height || parseFloat(formData.height) <= 0) newErrors.height = "A altura deve ser um número positivo.";
        if (!formData.currentWeight || parseFloat(formData.currentWeight) <= 0) newErrors.currentWeight = "O peso deve ser um número positivo.";
        
        if (!formData.objective.trim()) newErrors.objective = "O objetivo é obrigatório.";

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Executa a validação antes de submeter
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors); // Define os erros para serem exibidos
            return; // Para a submissão se houver erros
        }

        // Limpa os erros se a validação passar
        setErrors({}); 
        setIsSubmitting(true);

        // Define a URL da foto (Base64 ou placeholder padrão)
        const photoURLToSave = formData.photoURL || 'https://via.placeholder.com/80?text=NP'; // NP = Novo Paciente

        // Calcula a idade com base na data de nascimento
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        const newPatientData = {
            // O ID será gerado automaticamente pelo JSON Server ao receber o POST
            name: formData.name, 
            age: age.toString(), // Converter para string se o seu PatientCard espera string
            gender: formData.gender,
            weight: formData.currentWeight, 
            objective: formData.objective, 
            photoURL: photoURLToSave, 
            lastConsult: new Date().toLocaleDateString('pt-BR'), // Data atual da criação
            email: formData.email,
            phone: formData.phone, 
            height: formData.height
        };

        try {
            // Chama a função onPatientAdded passada pelo App.jsx (que fará a requisição POST)
            await onPatientAdded(newPatientData);
            onRequestClose(); // Fecha o modal após a submissão bem-sucedida

            // Limpa o formulário após o sucesso para a próxima abertura do modal
            setFormData({
                name: '', email: '', phone: '', birthDate: '', gender: 'Feminino',
                height: '', currentWeight: '', objective: '', photoFile: null, photoURL: '',
            });
        } catch (error) {
            console.error("Falha ao adicionar paciente:", error);
            // Aqui você poderia definir um erro no estado para exibir uma mensagem para o usuário
        } finally {
            setIsSubmitting(false); // Sempre redefine o estado de submissão
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onRequestClose={onRequestClose} 
            className="modal" 
            overlayClassName="overlay"
            contentLabel="Adicionar Novo Paciente" // Para acessibilidade
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
                                value={formData.name} 
                                onChange={handleInputChange} 
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
                                value={formData.birthDate} 
                                onChange={handleInputChange} 
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
                                value={formData.email} 
                                onChange={handleInputChange} 
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
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                className={errors.phone ? 'has-error' : ''}
                            />
                            {errors.phone && <p className="error-message">{errors.phone}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="gender">Gênero</label>
                            <select 
                                id="gender" 
                                name="gender" 
                                value={formData.gender} 
                                onChange={handleInputChange}
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
                            />
                            {/* Pré-visualização da imagem selecionada */}
                            {formData.photoURL && formData.photoURL.startsWith('data:image') && (
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
                                value={formData.height} 
                                onChange={handleInputChange} 
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
                                value={formData.currentWeight} 
                                onChange={handleInputChange} 
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
                                value={formData.objective} 
                                onChange={handleInputChange} 
                                className={errors.objective ? 'has-error' : ''}
                            />
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