// src/pages/ForgotPasswordPage/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { auth } from '../../firebase/firebase'; // Importa o auth
import { sendPasswordResetEmail } from 'firebase/auth'; // Importa a função de redefinição
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    
    try {
      // Envia o email de redefinição usando a função do Firebase
      await sendPasswordResetEmail(auth, email);
      setMessage('Verifique seu email! Um link para redefinição de senha foi enviado.');
    } catch (err) {
      setError('Falha ao enviar o email. Verifique se o endereço está correto e tente novamente.');
      console.error("Erro ao enviar email de redefinição:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page-container">
      <div className="forgot-password-card">
        <h2 className="card-title-header">Redefinir Senha</h2>
        <p style={{textAlign: 'center', marginBottom: '20px', color: '#666'}}>
          Insira seu email de cadastro para receber um link de redefinição.
        </p>
        <form onSubmit={handleRequestSubmit}>
          <input 
            type="email" 
            placeholder="Email" 
            className="forgot-password-input" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          {message && <p style={{color: 'green', textAlign: 'center', marginTop: '15px'}}>{message}</p>}
          {error && <p style={{color: 'red', textAlign: 'center', marginTop: '15px'}}>{error}</p>}
          <button type="submit" className="forgot-password-button" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link'}
          </button>
          <Link to="/login" className="back-to-login-link">Voltar ao Login</Link>
        </form>
      </div>
    </div>
  );
}