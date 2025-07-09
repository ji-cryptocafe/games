// src/components/LoginScreen.js
import React, { useState } from 'react';

const LoginScreen = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="login-container">
      <h1>Welcome to the Brain Trainer!</h1>
      <p>Please enter your name or a nickname to track your progress.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="name-input"
          autoFocus
        />
        <button type="submit" className="btn">
          Let's Go!
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;
