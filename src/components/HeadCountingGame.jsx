// src/components/HeadCountingGame.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Card from './Card.jsx';
import { createDeck, shuffleDeck, calculateDeckSum } from '../utils/deck.js';

// Legend cards are defined outside the component so they are not recreated on every render
const legendCards = [
  { suit: '♠', rank: 'J', value: 11 },
  { suit: '♠', rank: 'Q', value: 12 },
  { suit: '♠', rank: 'K', value: 13 },
  { suit: '♠', rank: 'A', value: 14 },
];

const HeadCountingGame = ({ user, onGameEnd }) => {
  const [deck, setDeck] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(-1);
  const [gameState, setGameState] = useState('loading'); // loading, playing, finished
  const [time, setTime] = useState(0);
  const [userSum, setUserSum] = useState('');
  const [result, setResult] = useState(null);
  const [tempSum, setTempSum] = useState('');
  const [checkpoints, setCheckpoints] = useState([]); // Stores checkpoint data

  const timerRef = useRef(null);
  const correctSumRef = useRef(0);

  // Initialize game on component mount
  useEffect(() => {
    // --- CHANGED: Logic to create a random partial deck ---

    // 1. Create and shuffle a full deck as before.
    const fullShuffledDeck = shuffleDeck(createDeck());

    // 2. Determine a random number of cards to "cut" from the top.
    //    Using a range of 5 to 15 creates good variability.
    const cardsToCut = Math.floor(Math.random() * 5 + 1);

    // 3. Create the partial deck that the player will actually use.
    //    .slice() creates a new array from the cut point to the end.
    const partialDeck = fullShuffledDeck.slice(cardsToCut);

    // 4. Set the correct sum and the deck state using ONLY the partial deck.
    correctSumRef.current = calculateDeckSum(partialDeck);
    setDeck(partialDeck);

    // --- END OF CHANGES ---

    startTimer();
    setGameState('playing');

    return () => clearInterval(timerRef.current);
  }, []);

  // --- Card Movement Logic ---
  const drawNextCard = useCallback(() => {
    if (currentCardIndex < deck.length - 1) {
      setCurrentCardIndex((prevIndex) => prevIndex + 1);
    } else {
      setGameState('finished');
      stopTimer();
    }
  }, [currentCardIndex, deck.length]);

  const goBackOneCard = useCallback(() => {
    if (currentCardIndex >= 0) {
      setCurrentCardIndex((prevIndex) => prevIndex - 1);
    }
  }, [currentCardIndex]);

  // --- Checkpoint Logic ---
  const handleSetCheckpoint = useCallback(() => {
    if (!tempSum) return;

    const partialDeck = deck.slice(0, currentCardIndex + 1);
    const correctPartialSum = calculateDeckSum(partialDeck);

    const newCheckpoint = {
      index: currentCardIndex,
      userValue: parseInt(tempSum, 10),
      correctPartialSum,
      timeAtCheckpoint: time,
    };

    setCheckpoints((prev) => [...prev, newCheckpoint]);
    setTempSum(''); // Clear the input after saving
  }, [tempSum, deck, currentCardIndex, time]);

  // --- Input Handling ---
  useEffect(() => {
    const handleKeyboardInput = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (tempSum) {
          handleSetCheckpoint();
        }
        drawNextCard();
      }
      if (e.code === 'Backspace') {
        e.preventDefault();
        goBackOneCard();
      }
    };

    const handleMouseInput = (e) => {
      if (e.target.closest('.scratchpad-area')) {
        return;
      }
      if (e.button === 0) {
        // Left click
        if (tempSum) {
          handleSetCheckpoint();
        }
        drawNextCard();
      }
    };

    const handleContextMenu = (e) => {
      // Right click
      if (e.target.closest('.scratchpad-area')) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      goBackOneCard();
    };

    if (gameState === 'playing') {
      const gameArea = document.getElementById('game-area');
      window.addEventListener('keydown', handleKeyboardInput);
      if (gameArea) {
        gameArea.addEventListener('click', handleMouseInput);
        gameArea.addEventListener('contextmenu', handleContextMenu);
      }

      return () => {
        window.removeEventListener('keydown', handleKeyboardInput);
        if (gameArea) {
          gameArea.removeEventListener('click', handleMouseInput);
          gameArea.removeEventListener('contextmenu', handleContextMenu);
        }
      };
    }
  }, [gameState, tempSum, drawNextCard, goBackOneCard, handleSetCheckpoint]);

  const handleScratchpadKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSetCheckpoint();
    }
  };

  const handleGoToLastCheckpoint = () => {
    if (checkpoints.length > 0) {
      const lastCheckpoint = checkpoints[checkpoints.length - 1];
      setCurrentCardIndex(lastCheckpoint.index);
    }
  };

  // --- Helper Functions ---
  const startTimer = () => {
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
  };
  const stopTimer = () => clearInterval(timerRef.current);

  const handleSumSubmit = (e) => {
    e.preventDefault();
    const isCorrect = parseInt(userSum) === correctSumRef.current;
    const gameResult = {
      date: new Date().toISOString(),
      time,
      correct: isCorrect,
    };
    setResult({ correct: isCorrect, correctSum: correctSumRef.current });
    onGameEnd(gameResult);
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const currentCard = deck[currentCardIndex];

  return (
    <div className="app-layout">
      {gameState === 'loading' && (
        <div className="game-container">
          <h2>Loading Deck...</h2>
        </div>
      )}

      {gameState !== 'loading' && (
        <div className="game-container" id="game-area">
          <div className="legend-container">
            {legendCards.map((card) => (
              <div key={card.rank} className="legend-item">
                <Card card={card} />
                <div className="legend-value-overlay">{card.value}</div>
              </div>
            ))}
          </div>

          {gameState === 'playing' && (
            <>
              <div className="card-piles-wrapper">
                <div className="card-piles">
                  <div className="pile-label">
                    Deck (
                    {deck.length > 0 ? deck.length - 1 - currentCardIndex : 0}{' '}
                    left)
                  </div>
                  <div className="card-stack">
                    {deck.length - 1 - currentCardIndex > 0 ? (
                      <Card faceUp={false} />
                    ) : (
                      <div className="card-placeholder"></div>
                    )}
                  </div>
                </div>
                <div className="card-piles">
                  <div className="pile-label">
                    Used Pile ({currentCardIndex + 1})
                  </div>
                  <div className="card-stack">
                    {currentCard ? (
                      <Card card={currentCard} />
                    ) : (
                      <div className="card-placeholder">
                        Click to draw first card
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="scratchpad-area">
                <div className="scratchpad-container">
                  <label htmlFor="temp-sum">Scratchpad (Enter to save)</label>
                  <input
                    id="temp-sum"
                    type="number"
                    className="temp-sum-input"
                    value={tempSum}
                    onChange={(e) => setTempSum(e.target.value)}
                    placeholder="Type partial sum"
                    onKeyDown={handleScratchpadKeyDown}
                  />
                </div>
                <button
                  className="btn-secondary"
                  onClick={handleGoToLastCheckpoint}
                  disabled={checkpoints.length === 0}
                  title="Go back to the last saved checkpoint"
                >
                  Go Back
                </button>
              </div>
            </>
          )}

          {gameState === 'finished' && !result && (
            <div className="result-form">
              <h2>Deck Finished!</h2>
              <p>Time Taken: {formatTime(time)}</p>
              <form onSubmit={handleSumSubmit}>
                <label htmlFor="total-sum">
                  What was the total sum of all cards?
                </label>
                <input
                  id="total-sum"
                  type="number"
                  value={userSum}
                  onChange={(e) => setUserSum(e.target.value)}
                  placeholder="Enter total sum"
                  className="name-input"
                  autoFocus
                />
                <button type="submit" className="btn">
                  Check Answer
                </button>
              </form>
            </div>
          )}

          {result && (
            <div className="result-feedback">
              {result.correct ? (
                <h2 className="correct">🎉 Correct! Well done! 🎉</h2>
              ) : (
                <h2 className="incorrect">😥 Not quite. Keep practicing!</h2>
              )}
              <p>Your answer was: {userSum}</p>
              <p>The correct sum was: {result.correctSum}</p>
              {checkpoints.length > 0 && (
                <div className="checkpoint-summary">
                  <h4>Your Checkpoints:</h4>
                  <ul className="checkpoint-list">
                    {checkpoints.map((cp, i) => (
                      <li
                        key={i}
                        className={
                          cp.userValue === cp.correctPartialSum
                            ? 'correct-checkpoint'
                            : 'incorrect-checkpoint'
                        }
                      >
                        {cp.userValue === cp.correctPartialSum ? '✅' : '❌'}
                        At card #{cp.index + 1} (Time:{' '}
                        {formatTime(cp.timeAtCheckpoint)}), you entered{' '}
                        <strong>{cp.userValue}</strong>. (Correct was:{' '}
                        {cp.correctPartialSum})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="sidebar">
        <h3>Game Info</h3>
        <div className="timer">
          <strong>Timer:</strong> {formatTime(time)}
        </div>
        <hr />
        <h3>{user.name}'s History</h3>
        <ul className="history-list">
          {user.history.length === 0 ? (
            <li>No history yet.</li>
          ) : (
            user.history.slice(0, 5).map((item, index) => (
              <li
                key={index}
                className={item.correct ? 'correct' : 'incorrect'}
              >
                {new Date(item.date).toLocaleDateString()} -{' '}
                {formatTime(item.time)} - {item.correct ? '✅' : '❌'}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default HeadCountingGame;
