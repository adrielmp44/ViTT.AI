import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaClipboardList, FaFileMedical, FaChartLine, FaCalendarAlt, FaCommentDots, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { auth } from '../../firebase/firebase';
import { signOut } from 'firebase/auth';
import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const user = auth.currentUser; // Obter o usuário atual do Firebase

  const handleLogout = async () => {
    if (window.confirm("Tem certeza de que deseja sair?")) {
      try {
        await signOut(auth);
        navigate('/login');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Não foi possível sair. Por favor, tente novamente.');
      }
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo-text">vittAI</h1>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/home" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <FaHome /> <span>Home</span>
        </NavLink>
        <NavLink to="/pacientes" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}><FaUsers /> <span>Pacientes</span></NavLink>
        <NavLink to="/planos" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}><FaClipboardList /> <span>Planos Alimentares</span></NavLink>
        <NavLink to="/anamneses" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}><FaFileMedical /> <span>Anamneses</span></NavLink>
        <NavLink to="/progressos" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}><FaChartLine /> <span>Progressos</span></NavLink>
        <NavLink to="/agendamentos" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}><FaCalendarAlt /> <span>Agendamentos</span></NavLink>
        <NavLink to="/feedbacks" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}><FaCommentDots /> <span>Feedbacks</span></NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="nav-link settings">
          <FaCog /> <span>Configurações</span>
        </div>
        <div className="user-profile">
          <div className="user-info">
            {/* Mostrar o displayName do usuário ou email caso displayName não exista */}
            <span className="user-name">{user?.displayName || user?.email || 'Usuário'}</span>
            <span className="user-crn">CRN 40C5822</span>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Sair">
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </aside>
  );
}