// src/App.js
import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen.jsx';
import MainMenu from './components/MainMenu.jsx';
import HeadCountingGame from './components/HeadCountingGame.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'menu', 'head-counting'

  // On initial load, check if a user was stored in session storage
  // This avoids logging in again on a page refresh
  useEffect(() => {
    const savedUserJson = sessionStorage.getItem('currentUser');
    if (savedUserJson) {
      const savedUser = JSON.parse(savedUserJson);
      // We still need to load their full history from localStorage
      handleLogin(savedUser.name);
    }
  }, []);

  const handleLogin = (name) => {
    // Check localStorage for the user's full data
    const storedUsers =
      JSON.parse(localStorage.getItem('brainTrainerUsers')) || {};

    let currentUser;
    if (storedUsers[name]) {
      console.log(`Welcome back, ${name}!`);
      currentUser = storedUsers[name];
    } else {
      console.log(`Creating new user: ${name}`);
      currentUser = { name, history: [] };
    }

    setUser(currentUser);
    sessionStorage.setItem(
      'currentUser',
      JSON.stringify({ name: currentUser.name })
    ); // Save current user for session
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
    // Handle other games later
  };

  const handleGameEnd = (result) => {
    // Update user history
    const updatedUser = {
      ...user,
      history: [result, ...user.history], // Add new result to the top
    };
    setUser(updatedUser);

    // Save to localStorage
    const storedUsers =
      JSON.parse(localStorage.getItem('brainTrainerUsers')) || {};
    storedUsers[user.name] = updatedUser;
    localStorage.setItem('brainTrainerUsers', JSON.stringify(storedUsers));

    // After a delay, go back to the menu
    setTimeout(() => {
      setView('menu');
    }, 4000); // Show result for 4 seconds
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'menu':
        return (
          <MainMenu
            user={user}
            onSelectGame={handleSelectGame}
            onLogout={handleLogout}
          />
        );
      case 'head-counting':
        return <HeadCountingGame user={user} onGameEnd={handleGameEnd} />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Brain Trainer</h1>
      </header>
      <main>{renderView()}</main>
    </div>
  );
}

export default App;
