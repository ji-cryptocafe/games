// src/components/MainMenu.js
import React from 'react';

const MainMenu = ({ user, onSelectGame, onLogout }) => {
  return (
    <div className="main-menu-container">
      <div className="main-menu-header">
        <h2>Welcome, {user.name}!</h2>
        <button onClick={onLogout} className="btn-secondary">
          Switch User
        </button>
      </div>
      <p>Choose a challenge to begin:</p>
      <div className="game-selection">
        <div
          className="game-card"
          onClick={() => onSelectGame('head-counting')}
        >
          <h3>Head Counting</h3>
          <p>Test your mental addition skills with a deck of cards.</p>
        </div>
        <div className="game-card disabled">
          <h3>Logic Puzzle (Sudoku)</h3>
          <p>Coming Soon!</p>
        </div>
        <div className="game-card disabled">
          <h3>Computer Science</h3>
          <p>Beginner programming challenges. Coming Soon!</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
