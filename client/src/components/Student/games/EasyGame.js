import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import io from 'socket.io-client';
import Leaderboard from '../Leaderboard';
import './Game.css';

const EasyGame = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const { user, API_URL } = useAuth();
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [result, setResult] = useState(null);
  const [visualTheme, setVisualTheme] = useState(1);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchQuestion();
    
    // Initialize socket
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    newSocket.emit('join-game', {
      difficulty: 'easy',
      level: parseInt(level),
      studentId: user?.id
    });
    setSocket(newSocket);

    // Timer for 5 minutes
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      newSocket.disconnect();
    };
  }, [level]);

  const fetchQuestion = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/games/question/easy/${level}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuestion(response.data);
      setVisualTheme(response.data.visualTheme || 1);
      setTimeLeft(300);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const handleTimeUp = () => {
    // Trigger question after 5 minutes
    if (!question) {
      fetchQuestion();
    }
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null) return;

    const startTime = Date.now();
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/games/submit-answer`,
        {
          questionId: question._id,
          answer: selectedAnswer,
          timeTaken,
          visualTheme
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setResult(response.data);

      if (response.data.isCorrect && socket) {
        socket.emit('submit-answer', {
          difficulty: 'easy',
          level: parseInt(level),
          studentId: user?.id,
          score: response.data.score,
          timeTaken
        });
      }

      // Update streak
      await axios.post(
        `${API_URL}/students/update-streak`,
        { playTime: 1 },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNext = () => {
    if (parseInt(level) < 50) {
      navigate(`/student/games/easy/${parseInt(level) + 1}`);
      setResult(null);
      setSelectedAnswer(null);
      fetchQuestion();
    } else {
      navigate('/student/games');
    }
  };

  const getVisualStyle = () => {
    const themes = {
      1: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🎮' },
      2: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '🚀' },
      3: { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: '⭐' },
      4: { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: '🔥' },
      5: { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: '💎' }
    };
    return themes[visualTheme] || themes[1];
  };

  const visual = getVisualStyle();

  if (!question) {
    return <div className="game-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="game-container" style={{ background: visual.background }}>
      <div className="game-header">
        <h2>Easy Level {level} {visual.icon}</h2>
        <div className="timer">Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
      </div>

      <div className="game-content">
        {!result ? (
          <>
            <div className="question-card">
              <h3>{question.question}</h3>
              <div className="options">
                {question.options?.map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn ${selectedAnswer === index ? 'selected' : ''}`}
                    onClick={() => setSelectedAnswer(index)}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={selectedAnswer === null}
                className="btn btn-primary submit-btn"
              >
                Submit Answer
              </button>
            </div>
          </>
        ) : (
          <div className="result-card">
            <h2>{result.isCorrect ? '✅ Correct!' : '❌ Incorrect'}</h2>
            {result.explanation && <p>{result.explanation}</p>}
            <p>Score: {result.score}</p>
            <button onClick={handleNext} className="btn btn-primary">
              {parseInt(level) < 50 ? 'Next Level' : 'Back to Games'}
            </button>
          </div>
        )}
      </div>

      <Leaderboard difficulty="easy" level={parseInt(level)} />
    </div>
  );
};

export default EasyGame;

