import React from 'react';
import './RegisterPage.css';
// Importe FaUserPlus se estiver usando ícones, como no Sidebar.jsx
// import { FaUserPlus } from 'react-icons/fa';

export default function RegisterPage() {
  return (
    <div className="register-page-container">
      <div className="register-card">
        <div className="register-icon-placeholder">
          {/* Use um ícone real aqui, ex: <FaUserPlus /> */}
          <i className="fa-solid fa-user-plus"></i> {/* Exemplo para Font Awesome */}
        </div>
        <h2 className="register-title">Dados Cadastrais</h2>
        <div className="form-grid">
          <input type="text" placeholder="Nome completo*" className="register-input full-width" required />
          <input type="text" placeholder="Especialidade*" className="register-input" required />
          <input type="text" placeholder="CPF*" className="register-input" required />
          <input type="text" placeholder="CRN*" className="register-input" required />
          <input type="text" placeholder="RG*" className="register-input" required />
          <input type="text" placeholder="Número de Contato*" className="register-input" required />
          <input type="date" placeholder="Data de Nascimento*" className="register-input" required />
          <input type="email" placeholder="Email*" className="register-input full-width" required />
          <input type="password" placeholder="Senha*" className="register-input full-width" required />
        </div>
        <div className="terms-checkbox">
          <input type="checkbox" id="terms" required />
          <label htmlFor="terms">Eu concordo com os Termos de Uso e Política de Privacidade</label>
        </div>
        <button className="register-button">Cadastrar</button>
      </div>
    </div>
  );
}