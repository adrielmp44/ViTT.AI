import React from 'react';
import { FaUsers, FaCalendarCheck, FaClock } from 'react-icons/fa';
import DashboardCard from '../../components/components_HomePage/DashboardCard.jsx'; // AGORA ESTE PATH FUNCIONA SE O ARQUIVO FOI MOVIDO
import ConsultasChart from '../../components/components_HomePage/ConsultasChart.jsx'; // AGORA ESTE PATH FUNCIONA SE O ARQUIVO FOI MOVIDO
import FeedbacksList from '../../components/components_HomePage/FeedbacksList.jsx'; // AGORA ESTE PATH FUNCIONA SE O ARQUIVO FOI MOVIDO
import Agendamentos from '../../components/components_HomePage/Agendamentos.jsx'; // AGORA ESTE PATH FUNCIONA SE O ARQUIVO FOI MOVIDO
import './HomePage.css';

export default function HomePage() {
  return (
    <div className="homepage-container">
      <section className="header-cards">
        <DashboardCard
          title="Total de Pacientes"
          value="4.666"
          detail="+58% vs. mês anterior"
          icon={<FaUsers />}
          iconBgColor="#29B6F6"
        />
        <DashboardCard
          title="Consultas essa semana"
          value="777"
          detail="+58% vs. mês anterior"
          icon={<FaCalendarCheck />}
          iconBgColor="#008080"
        />
        <DashboardCard
          title="Próxima Consulta"
          value="Hoje, 3:33"
          detail="31 de fevereiro de 2424"
          icon={<FaClock />}
          iconBgColor="#FFA726"
        />
      </section>

      <section className="main-content-grid">
        <ConsultasChart />
        <FeedbacksList />
      </section>

      <section className="bottom-content">
        <Agendamentos />
      </section>
    </div>
  );
}