import React from 'react';
import { Link } from 'react-router-dom';
import './PreLoginHomePage.css';

export default function PreLoginHomePage() {
  return (
    <div className="pre-login-home-container">
      <div className="pre-login-content">
        <h1 className="pre-login-title">Bem-vindo(a) ao VittAI!</h1>
        <p className="pre-login-description">
          Sua plataforma completa para gerenciamento nutricional.
          Conecte-se com seus pacientes, organize agendamentos,
          acompanhe planos alimentares e feedbacks de forma intuitiva e eficiente.
        </p>
        <div className="pre-login-actions">
          <Link to="/login" className="pre-login-button primary">Entrar</Link>
          <Link to="/register" className="pre-login-button secondary">Cadastrar-se</Link>
        </div>
      </div>
      <div className="pre-login-image">
      </div>
    </div>
  );
}