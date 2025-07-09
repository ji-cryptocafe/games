// src/components/Card.jsx
import React from 'react';

const Card = ({ card, faceUp = true }) => {
  if (!faceUp) {
    return <div className="card card-back"></div>;
  }

  const color = card.suit === '♥' || card.suit === '♦' ? 'red' : 'black';

  return (
    <div className="card card-front" style={{ color }}>
      <div className="card-rank top-left">{card.rank}</div>
      <div className="card-suit-main">{card.suit}</div>
      <div className="card-rank bottom-right">{card.rank}</div>
    </div>
  );
};

export default Card;
