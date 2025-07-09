// src/pages/RegisterPage/RegisterPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [crn, setCrn] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password || !fullName || !crn || !cpf || !birthDate || !phone || !specialty) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      // 1. Criar o usuário com email e senha
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Atualizar o perfil do usuário com o nome completo
      await updateProfile(userCredential.user, {
        displayName: fullName
      });

      // 3. Salvar informações adicionais no Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        fullName,
        email,
        crn,
        cpf,
        birthDate,
        phone,
        specialty,
        createdAt: new Date()
      });

      // 4. Navegar para a página inicial
      navigate('/home');
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Este endereço de email já está em uso.');
          break;
        case 'auth/weak-password':
          setError('A senha é muito fraca. Use pelo menos 6 caracteres.');
          break;
        case 'auth/invalid-email':
          setError('O formato do email é inválido.');
          break;
        default:
          setError('Ocorreu um erro ao tentar criar a conta. Tente novamente.');
      }
      console.error("Erro no registro:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="register-icon-placeholder">
          <i className="fa-solid fa-user-plus"></i>
        </div>
        <h2 className="register-title">Criar Conta</h2>
        
        <form onSubmit={handleRegister} noValidate>
          <div className="form-grid">
            <input 
              type="text" 
              placeholder="Nome completo*" 
              className="register-input full-width" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
            <input 
              type="email" 
              placeholder="Email*" 
              className="register-input full-width"
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Senha (mínimo 6 caracteres)*" 
              className="register-input full-width" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <input 
              type="text" 
              placeholder="CRN*" 
              className="register-input" 
              value={crn}
              onChange={(e) => setCrn(e.target.value)}
              required 
            />
            <input 
              type="text" 
              placeholder="CPF*" 
              className="register-input" 
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required 
            />
            <input 
              type="date" 
              placeholder="Data de Nascimento*" 
              className="register-input" 
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required 
            />
            <input 
              type="tel" 
              placeholder="Número de Contato*" 
              className="register-input" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required 
            />
            <select 
              className="register-input" 
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              required
            >
              <option value="">Selecione a Especialidade*</option>
              <option value="Nutrição Clínica">Nutrição Clínica</option>
              <option value="Nutrição Esportiva">Nutrição Esportiva</option>
              <option value="Nutrição Materno-Infantil">Nutrição Materno-Infantil</option>
              <option value="Nutrição Funcional">Nutrição Funcional</option>
              <option value="Nutrição Gerontológica">Nutrição Gerontológica</option>
            </select>
          </div>
          
          {error && <p className="error-message" style={{color: 'red', textAlign: 'center', marginTop: '10px'}}>{error}</p>}
          
          <div className="terms-checkbox">
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">Eu concordo com os Termos de Uso e Política de Privacidade</label>
          </div>
          
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <Link to="/login" className="back-to-login-link" style={{marginTop: '15px', display: 'block', textAlign: 'center'}}>
          Já tem uma conta? Faça Login
        </Link>
      </div>
    </div>
  );
}