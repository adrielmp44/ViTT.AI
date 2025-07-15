import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Usa a função do Firebase para fazer login
      await signInWithEmailAndPassword(auth, email, password);
      // O listener em App.jsx cuidará da atualização do estado e o redirecionamento ocorrerá
      navigate('/home');
    } catch (err) {
      setError('Email ou senha incorretos. Por favor, tente novamente.');
      console.error("Erro no login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-image-section">
        {/* Background definido via CSS */}
      </div>
      <div className="login-form-section">
        <div className="login-card">
          <h2 className="login-title">Login</h2>
          <div className="login-icon-placeholder">
            <i className="fa-solid fa-user"></i>
          </div>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Email" 
              className="login-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Senha" 
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            {error && <p style={{color: 'red', textAlign: 'center', margin: '10px 0'}}>{error}</p>}
            <Link to="/forgot-password" className="forgot-password-link">Esqueceu sua Senha?</Link>
            <button type="submit" className="login-button primary" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <Link to="/register" className="login-button secondary">Cadastro</Link>
        </div>
      </div>
    </div>
  );
}