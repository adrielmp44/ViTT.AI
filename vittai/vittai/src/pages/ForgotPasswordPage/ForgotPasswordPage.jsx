import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './ForgotPasswordPage.css';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState('request'); 

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    console.log('Email de recuperação enviado!');
    setStep('reset'); 
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    // Lógica para redefinir a senha
    alert('Senha redefinida com sucesso!');

  };

  return (
    <div className="forgot-password-page-container">
      {step === 'request' ? (
        <div className="forgot-password-card">
          <h2 className="card-title-header">Solicitar nova senha</h2>
          <form onSubmit={handleRequestSubmit}>
            <input type="email" placeholder="Email" className="forgot-password-input" required />
            <button type="submit" className="forgot-password-button">Enviar</button>
            <Link to="/login" className="back-to-login-link">Voltar ao Login</Link> {/* Botão para voltar */}
          </form>
        </div>
      ) : (
        <div className="forgot-password-card">
          <h2 className="card-title-header">Nova senha</h2>
          <form onSubmit={handleResetSubmit}>
            <input type="password" placeholder="Nova senha*" className="forgot-password-input" required />
            <input type="password" placeholder="Repetir nova senha*" className="forgot-password-input" required />
            <button type="submit" className="forgot-password-button">Salvar</button>
            <Link to="/login" className="back-to-login-link">Voltar ao Login</Link> {/* Botão para voltar */}
          </form>
        </div>
      )}
    </div>
  );
}