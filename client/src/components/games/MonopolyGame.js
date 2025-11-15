import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import './MonopolyGame.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const PROPERTIES = [
  { name: 'GO', type: 'special', color: '#8B4513' },
  { name: 'Mediterranean Ave', type: 'property', color: '#8B4513', price: 60, rent: 2 },
  { name: 'Community Chest', type: 'special', color: '#DAA520' },
  { name: 'Baltic Ave', type: 'property', color: '#8B4513', price: 60, rent: 4 },
  { name: 'Income Tax', type: 'tax', color: '#FF6347', amount: 200 },
  { name: 'Reading Railroad', type: 'railroad', color: '#000000', price: 200, rent: 25 },
  { name: 'Oriental Ave', type: 'property', color: '#00CED1', price: 100, rent: 6 },
  { name: 'Chance', type: 'special', color: '#FFD700' },
  { name: 'Vermont Ave', type: 'property', color: '#00CED1', price: 100, rent: 6 },
  { name: 'Connecticut Ave', type: 'property', color: '#00CED1', price: 120, rent: 8 },
  { name: 'Jail', type: 'special', color: '#696969' },
  { name: 'St. Charles Place', type: 'property', color: '#FF1493', price: 140, rent: 10 },
  { name: 'Electric Company', type: 'utility', color: '#FFFF00', price: 150, rent: 0 },
  { name: 'States Ave', type: 'property', color: '#FF1493', price: 140, rent: 10 },
  { name: 'Virginia Ave', type: 'property', color: '#FF1493', price: 160, rent: 12 },
  { name: 'Pennsylvania Railroad', type: 'railroad', color: '#000000', price: 200, rent: 25 },
  { name: 'St. James Place', type: 'property', color: '#FF8C00', price: 180, rent: 14 },
  { name: 'Community Chest', type: 'special', color: '#DAA520' },
  { name: 'Tennessee Ave', type: 'property', color: '#FF8C00', price: 180, rent: 14 },
  { name: 'New York Ave', type: 'property', color: '#FF8C00', price: 200, rent: 16 },
  { name: 'Free Parking', type: 'special', color: '#228B22' },
  { name: 'Kentucky Ave', type: 'property', color: '#FF0000', price: 220, rent: 18 },
  { name: 'Chance', type: 'special', color: '#FFD700' },
  { name: 'Indiana Ave', type: 'property', color: '#FF0000', price: 220, rent: 18 },
  { name: 'Illinois Ave', type: 'property', color: '#FF0000', price: 240, rent: 20 },
  { name: 'B&O Railroad', type: 'railroad', color: '#000000', price: 200, rent: 25 },
  { name: 'Atlantic Ave', type: 'property', color: '#FFFF00', price: 260, rent: 22 },
  { name: 'Ventnor Ave', type: 'property', color: '#FFFF00', price: 260, rent: 22 },
  { name: 'Water Works', type: 'utility', color: '#00BFFF', price: 150, rent: 0 },
  { name: 'Marvin Gardens', type: 'property', color: '#FFFF00', price: 280, rent: 24 },
  { name: 'Go To Jail', type: 'special', color: '#8B0000' },
  { name: 'Pacific Ave', type: 'property', color: '#00FF00', price: 300, rent: 26 },
  { name: 'North Carolina Ave', type: 'property', color: '#00FF00', price: 300, rent: 26 },
  { name: 'Community Chest', type: 'special', color: '#DAA520' },
  { name: 'Pennsylvania Ave', type: 'property', color: '#00FF00', price: 320, rent: 28 },
  { name: 'Short Line', type: 'railroad', color: '#000000', price: 200, rent: 25 },
  { name: 'Chance', type: 'special', color: '#FFD700' },
  { name: 'Park Place', type: 'property', color: '#0000FF', price: 350, rent: 35 },
  { name: 'Luxury Tax', type: 'tax', color: '#FF6347', amount: 100 },
  { name: 'Boardwalk', type: 'property', color: '#0000FF', price: 400, rent: 50 }
];

const MonopolyGame = ({ gameRunning, onScoreChange, isPaused, level = 1, onLevelComplete }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [gameState, setGameState] = useState('setup'); // setup, waiting, playing, finished
  const [dice, setDice] = useState([1, 1]);
  const [myPlayer, setMyPlayer] = useState(null);
  const [money, setMoney] = useState(1500);
  const [position, setPosition] = useState(0);
  const [canRoll, setCanRoll] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [score, setScore] = useState(0);
  const [numBots, setNumBots] = useState(3); // Default 3 bots (4 players total)

  useEffect(() => {
    if (!gameRunning || isPaused) return;

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to Monopoly game');
      // Don't join yet, wait for bot selection
    });

    newSocket.on('monopoly-state', (state) => {
      setPlayers(state.players || []);
      const currentPlayerIndex = state.currentPlayerIndex || 0;
      const turnOrder = state.turnOrder || [];
      if (turnOrder.length > 0 && state.players && state.players[turnOrder[currentPlayerIndex]]) {
        setCurrentPlayer(state.players[turnOrder[currentPlayerIndex]]);
      } else {
        setCurrentPlayer(null);
      }
      setGameState(state.gameState || 'waiting');
      
      const myPlayerData = state.players?.find(p => 
        (p.id && (p.id === (user?.id || 'guest'))) || 
        (p.usn && (p.usn === (user?.usn || 'GUEST')))
      );
      if (myPlayerData) {
        setMyPlayer(myPlayerData);
        setMoney(myPlayerData.money || 1500);
        setPosition(myPlayerData.position || 0);
        setCanRoll(myPlayerData.canRoll || false);
        setScore(myPlayerData.money || 0);
        onScoreChange(myPlayerData.money || 0);
      }
    });

    newSocket.on('monopoly-dice-rolled', (data) => {
      setDice(data.dice || [1, 1]);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `${data.playerName} rolled ${data.dice[0] + data.dice[1]}`,
        type: 'info'
      }]);
    });

    newSocket.on('monopoly-player-moved', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `${data.playerName} moved to ${PROPERTIES[data.position]?.name || 'Unknown'}`,
        type: 'info'
      }]);
    });

    newSocket.on('monopoly-property-action', (data) => {
      setSelectedProperty(data.property);
      setShowPropertyModal(true);
    });

    newSocket.on('monopoly-game-over', (data) => {
      setGameState('finished');
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Game Over! Winner: ${data.winner}`,
        type: 'success'
      }]);
      if (data.winnerId === (user?.id || 'guest')) {
        const finalScore = money * 2;
        setScore(finalScore);
        onScoreChange(finalScore);
        onLevelComplete();
      }
    });

    newSocket.on('monopoly-message', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: data.message,
        type: data.type || 'info'
      }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [gameRunning, isPaused, user, onScoreChange, onLevelComplete, money]);

  const handleStartGame = () => {
    if (!socket) return;
    
    // Join with specified number of bots
    socket.emit('join-monopoly', {
      studentId: user?.id || 'guest',
      studentName: user?.name || user?.username || 'Player',
      studentUSN: user?.usn || 'GUEST',
      numBots: numBots
    });
    
    setGameState('waiting');
  };

  const rollDice = () => {
    if (!socket || !canRoll || gameState !== 'playing') return;
    
    socket.emit('monopoly-roll-dice', {
      studentId: user?.id || 'guest'
    });
    setCanRoll(false);
  };

  const buyProperty = () => {
    if (!socket || !selectedProperty) return;
    
    socket.emit('monopoly-buy-property', {
      studentId: user?.id || 'guest',
      propertyIndex: selectedProperty.index
    });
    setShowPropertyModal(false);
    setSelectedProperty(null);
  };

  const passTurn = () => {
    if (!socket) return;
    
    socket.emit('monopoly-pass-turn', {
      studentId: user?.id || 'guest'
    });
  };

  const startGame = () => {
    if (!socket) return;
    socket.emit('monopoly-start-game');
  };

  const isMyTurn = currentPlayer && myPlayer && 
    ((currentPlayer.id && myPlayer.id && currentPlayer.id === myPlayer.id) || 
     (currentPlayer.usn && myPlayer.usn && currentPlayer.usn === myPlayer.usn));

  return (
    <div className="monopoly-game">
      <div className="monopoly-stats">
        <div className="stat">Money: ${money}</div>
        <div className="stat">Level: {level}</div>
        <div className="stat">Score: {score}</div>
        <div className="stat">Players: {players.length}</div>
      </div>

      {gameState === 'setup' && (
        <div className="setup-overlay">
          <h2>Monopoly Setup</h2>
          <p>Select number of bots to play against:</p>
          <div className="bot-selection">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                className={`bot-btn ${numBots === num ? 'selected' : ''}`}
                onClick={() => setNumBots(num)}
              >
                {num} Bot{num !== 1 ? 's' : ''} ({num + 1} Total)
              </button>
            ))}
          </div>
          <button onClick={handleStartGame} className="start-btn">Start Game</button>
        </div>
      )}

      {gameState === 'waiting' && (
        <div className="waiting-overlay">
          <h2>Setting up game...</h2>
          <p>Players: {players.length}</p>
          {players.length >= numBots + 1 && (
            <button onClick={startGame} className="start-btn">Start Game</button>
          )}
          <div className="players-list">
            {players.map((player, i) => (
              <div key={i} className="player-badge" style={{ background: player.color }}>
                {player.name} {player.isBot ? '(Bot)' : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="monopoly-container">
        <div className="board-container">
          <div className="monopoly-board">
            {PROPERTIES.map((property, index) => {
              const isCorner = index % 10 === 0;
              const side = Math.floor(index / 10);
              const positionOnSide = index % 10;
              
              let style = {
                backgroundColor: property.color,
                width: isCorner ? '80px' : '44px',
                height: isCorner ? '80px' : '44px'
              };
              
              if (side === 0) {
                style.position = 'absolute';
                style.bottom = '0';
                style.left = isCorner ? '0' : `${80 + (positionOnSide - 1) * 44}px`;
              } else if (side === 1) {
                style.position = 'absolute';
                style.left = '0';
                style.bottom = isCorner ? '80px' : `${80 + (positionOnSide - 1) * 44}px`;
              } else if (side === 2) {
                style.position = 'absolute';
                style.top = '0';
                style.left = isCorner ? '520px' : `${520 - (positionOnSide - 1) * 44}px`;
              } else if (side === 3) {
                style.position = 'absolute';
                style.right = '0';
                style.top = isCorner ? '80px' : `${80 + (positionOnSide - 1) * 44}px`;
              }
              
              return (
                <div
                  key={index}
                  className={`board-space ${isCorner ? 'corner' : ''}`}
                  style={style}
                >
                  <div className="space-name">{property.name}</div>
                  {property.price && (
                    <div className="space-price">${property.price}</div>
                  )}
                  
                  {/* Player tokens */}
                  {players.map((player, pIdx) => {
                    if (player && player.position === index) {
                      return (
                        <div
                          key={pIdx}
                          className="player-token"
                          style={{ 
                            backgroundColor: player.color || '#FF4444',
                            top: `${2 + (pIdx % 2) * 14}px`,
                            left: `${2 + Math.floor(pIdx / 2) * 14}px`
                          }}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className="game-controls-panel">
          <div className="dice-container">
            <div className="dice">
              <div className="die">{dice[0]}</div>
              <div className="die">{dice[1]}</div>
            </div>
            {isMyTurn && canRoll && gameState === 'playing' && (
              <button onClick={rollDice} className="roll-btn">Roll Dice</button>
            )}
            {isMyTurn && !canRoll && gameState === 'playing' && (
              <button onClick={passTurn} className="pass-btn">End Turn</button>
            )}
          </div>

          <div className="current-player">
            {currentPlayer && (
              <div>
                <strong>Current Player:</strong> {currentPlayer.name}
                {currentPlayer.isBot && ' (Bot)'}
                {isMyTurn && <span className="your-turn"> (Your Turn!)</span>}
              </div>
            )}
          </div>

          <div className="messages-container">
            <h3>Game Log</h3>
            <div className="messages">
              {messages.slice(-10).map(msg => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPropertyModal && selectedProperty && (
        <div className="property-modal-overlay" onClick={() => setShowPropertyModal(false)}>
          <div className="property-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedProperty.name}</h2>
            {selectedProperty.type === 'property' && (
              <>
                <p>Price: ${selectedProperty.price}</p>
                <p>Rent: ${selectedProperty.rent}</p>
                {!selectedProperty.owner && money >= selectedProperty.price && (
                  <button onClick={buyProperty} className="buy-btn">Buy Property</button>
                )}
                {selectedProperty.owner && (
                  <p>Owned by: {selectedProperty.owner}</p>
                )}
              </>
            )}
            <button onClick={() => setShowPropertyModal(false)} className="close-btn">Close</button>
          </div>
        </div>
      )}

      <div className="controls-hint">
        <p>Roll dice on your turn. Buy properties to earn rent from other players!</p>
      </div>
    </div>
  );
};

export default MonopolyGame;
