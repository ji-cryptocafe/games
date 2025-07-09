// src/App.jsx
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen.jsx';
import MainMenu from './components/MainMenu.jsx';
import HeadCountingGame from './components/HeadCountingGame.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'menu', 'head-counting'

  // On initial load, check if a user was stored in session storage
  useEffect(() => {
    const savedUserJson = sessionStorage.getItem('currentUser');
    if (savedUserJson) {
      const savedUser = JSON.parse(savedUserJson);
      handleLogin(savedUser.name);
    }
  }, []);

  const handleLogin = (name) => {
    const storedUsers = JSON.parse(localStorage.getItem('brainTrainerUsers')) || {};
    
    let currentUser;
    if (storedUsers[name]) {
      currentUser = storedUsers[name];
    } else {
      currentUser = { name, history: [] };
    }
    
    setUser(currentUser);
    sessionStorage.setItem('currentUser', JSON.stringify({ name: currentUser.name }));
    setView('menu');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    setUser(null);
    setView('login');
  };

  const handleSelectGame = (game) => {
    if (game === 'head-counting') {
      setView('head-counting');
    }
  };
  
  const handleGameEnd = (result) => {
    const updatedUser = {
      ...user,
      history: [result, ...user.history],
    };
    setUser(updatedUser);

    const storedUsers = JSON.parse(localStorage.getItem('brainTrainerUsers')) || {};
    storedUsers[user.name] = updatedUser;
    localStorage.setItem('brainTrainerUsers', JSON.stringify(storedUsers));

    setTimeout(() => {
      setView('menu');
    }, 4000);
  };

  // ADDED: Function to handle quitting the game
  const handleQuitGame = () => {
    setView('menu');
  };

  const renderView = () => {
    switch(view) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'menu':
        return <MainMenu user={user} onSelectGame={handleSelectGame} onLogout={handleLogout} />;
      case 'head-counting':
        // UPDATED: Pass the new onQuit function as a prop
        return <HeadCountingGame user={user} onGameEnd={handleGameEnd} onQuit={handleQuitGame} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Brain Trainer</h1>
      </header>
      <main>
        {renderView()}
      </main>
    </div>
  );
}

export default App;