import React from 'react';
import './GameControls.css';

const GameControls = ({ isPaused, onPause, onResume, onRestart, onQuit }) => {
  return (
    <div className="game-controls-bar">
      <button 
        className="control-btn pause-btn" 
        onClick={isPaused ? onResume : onPause}
        title={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? '▶️ Resume' : '⏸️ Pause'}
      </button>
      <button 
        className="control-btn restart-btn" 
        onClick={onRestart}
        title="Restart Game"
      >
        🔄 Restart
      </button>
      <button 
        className="control-btn quit-btn" 
        onClick={onQuit}
        title="Quit Game"
      >
        🚪 Quit
      </button>
    </div>
  );
};

export default GameControls;

