import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

export default function LoginPage({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    console.log('Tentativa de Login (Simulado)');
    setIsLoggedIn(true); // Define o usuário como logado
    navigate('/');      // Redireciona para a HomePage do usuário logado
  };

  return (
    <div className="login-page-container">
      {/* REMOVIDO: style={{ backgroundImage: url(${loginImage}) }} */}
      <div className="login-image-section">
        {/* Agora esta div terá seu background definido puramente pelo CSS */}
      </div>
      <div className="login-form-section">
        <div className="login-card">
          <h2 className="login-title">Login</h2>
          <div className="login-icon-placeholder">
            <i className="fa-solid fa-user"></i>
          </div>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" className="login-input" />
            <input type="password" placeholder="Senha" className="login-input" />
            <Link to="/forgot-password" className="forgot-password-link">Esqueceu sua Senha?</Link>
            <button type="submit" className="login-button primary">Entrar</button>
          </form>
          <Link to="/register" className="login-button secondary">Cadastro</Link>
        </div>
      </div>
    </div>
  );
}