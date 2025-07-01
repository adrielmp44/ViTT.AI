import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaClipboardList, FaFileMedical, FaChartLine, FaCalendarAlt, FaCommentDots, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('User logged out');
    setIsLoggedIn(false); 
    navigate('/login'); 
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="logo-text">vittAI</h1>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <FaHome /> <span>Home</span>
        </NavLink>
        <NavLink to="/pacientes" className="nav-link"><FaUsers /> <span>Pacientes</span></NavLink>
        <NavLink to="/planos" className="nav-link"><FaClipboardList /> <span>Planos Alimentares</span></NavLink>
        <NavLink to="/anamneses" className="nav-link"><FaFileMedical /> <span>Anamneses</span></NavLink>
        <NavLink to="/progressos" className="nav-link"><FaChartLine /> <span>Progressos</span></NavLink>
        <NavLink to="/agendamentos" className="nav-link"><FaCalendarAlt /> <span>Agendamentos</span></NavLink>
        <NavLink to="/feedbacks" className="nav-link"><FaCommentDots /> <span>Feedbacks</span></NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="nav-link settings">
          <FaCog /> <span>Configurações</span>
        </div>
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Paulo Costa</span>
            <span className="user-crn">CRN 40C5822</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </aside>
  );
}