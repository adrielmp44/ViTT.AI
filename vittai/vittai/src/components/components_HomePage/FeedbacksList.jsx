import React from 'react';
import { FaRegCommentAlt } from 'react-icons/fa';
import './FeedbacksList.css';

const feedbacks = [
  { name: 'Jacinto Pinto de Sousa', date: '31 de dexembro de 2025', time: '23:99' },
  { name: 'Clodovaldo Lima', date: '13 de fevereiro de 2024', time: '23:99' },
  { name: 'Marcos Leo', date: '16 de março de 2024', time: '23:99' },
  { name: 'Leopoldina Roniele Silva', date: '21 de julho de 2024', time: '23:99' },
];

export default function FeedbacksList() {
  return (
    <div className="card-container">
      <h3 className="card-title-header">Feedbacks</h3>
      <ul className="feedbacks-list">
        {feedbacks.map((fb, index) => (
          <li key={index} className="feedback-item">
            <div className="feedback-info">
              <p className="feedback-name">{fb.name}</p>
              <span className="feedback-date">{`${fb.date}  ${fb.time}`}</span>
            </div>
            <button className="respond-button">
              <FaRegCommentAlt /> Responder
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}