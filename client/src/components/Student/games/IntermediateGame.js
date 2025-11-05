import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import io from 'socket.io-client';
import Leaderboard from '../Leaderboard';
import LevelCompletion from './LevelCompletion';
import soundEffects from '../../../utils/soundEffects';
import './Game.css';

const IntermediateGame = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const { user, API_URL } = useAuth();
  const [question, setQuestion] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [result, setResult] = useState(null);
  const [visualTheme, setVisualTheme] = useState(1);
  const [socket, setSocket] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeTaken, setTimeTaken] = useState(0);
  const lastWarningTimeRef = useRef(0);

  useEffect(() => {
    soundEffects.updateSettings();
    fetchQuestion();
    
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'https://schoolsystem-lyl7.onrender.com');
    newSocket.emit('join-game', {
      difficulty: 'intermediate',
      level: parseInt(level),
      studentId: user?.id
    });
    setSocket(newSocket);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        // Play warning sound every 10 seconds when time is low
        if (prev <= 60 && prev % 10 === 0 && Date.now() - lastWarningTimeRef.current > 9000) {
          soundEffects.playTimeWarning();
          lastWarningTimeRef.current = Date.now();
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
      const response = await axios.get(`${API_URL}/games/question/intermediate/${level}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuestion(response.data);
      setBlocks(response.data.codeBlocks || []);
      setVisualTheme(response.data.visualTheme || 1);
      setTimeLeft(300);
      setSelectedBlocks([]);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const handleTimeUp = () => {
    if (!question) {
      fetchQuestion();
    }
  };

  const handleBlockClick = (block) => {
    soundEffects.playClick();
    if (selectedBlocks.includes(block.id)) {
      setSelectedBlocks(selectedBlocks.filter(id => id !== block.id));
    } else {
      setSelectedBlocks([...selectedBlocks, block.id]);
    }
  };

  const handleSubmit = async () => {
    if (selectedBlocks.length === 0) {
      soundEffects.playError();
      return;
    }

    soundEffects.playSubmit();
    const calculatedTimeTaken = Math.floor((Date.now() - startTime) / 1000);
    setTimeTaken(calculatedTimeTaken);
    
    // Get the order values from selected blocks
    const answer = selectedBlocks
      .map(blockId => {
        const block = blocks.find(b => b.id === blockId);
        return block ? (block.order || blockId) : blockId;
      })
      .join(',');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/games/submit-answer`,
        {
          questionId: question._id,
          answer,
          timeTaken: calculatedTimeTaken,
          visualTheme
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setResult(response.data);

      if (response.data.isCorrect && socket) {
        soundEffects.playSuccess();
        socket.emit('submit-answer', {
          difficulty: 'intermediate',
          level: parseInt(level),
          studentId: user?.id,
          score: response.data.score,
          timeTaken: calculatedTimeTaken
        });

        // Check for badge eligibility
        const badgeResponse = await axios.post(
          `${API_URL}/games/check-badge`,
          { difficulty: 'intermediate' },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (badgeResponse.data.badgeEarned) {
          soundEffects.playBadge();
        }
      } else {
        soundEffects.playError();
      }

      await axios.post(
        `${API_URL}/students/update-streak`,
        { playTime: 1 },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Error submitting answer:', error);
      soundEffects.playError();
    }
  };

  const handleNext = () => {
    soundEffects.playClick();
    setResult(null);
    setSelectedBlocks([]);
    if (parseInt(level) < 100) {
      navigate(`/student/games/intermediate/${parseInt(level) + 1}`);
    } else {
      navigate('/student/games');
    }
  };

  const getVisualStyle = () => {
    const themes = {
      1: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🧩' },
      2: { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '🎯' },
      3: { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: '🔧' },
      4: { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: '⚡' },
      5: { background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: '🎨' }
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
        <h2>Intermediate Level {level} {visual.icon}</h2>
        <div className="timer">Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
      </div>

      <div className="game-content">
        {!result ? (
          <>
            <div className="question-card">
              <h3>{question.codeDescription}</h3>
              <p>Arrange the code blocks in the correct order:</p>
              
              <div className="blocks-container">
                <div className="available-blocks">
                  <h4>Available Blocks:</h4>
                  {blocks.map((block, idx) => (
                    !selectedBlocks.includes(block.id) && (
                      <div
                        key={block.id}
                        className="code-block"
                        onClick={() => handleBlockClick(block)}
                      >
                        {block.lines.map((line, i) => (
                          <div key={i} className="code-line">{line}</div>
                        ))}
                      </div>
                    )
                  ))}
                </div>

                <div className="selected-blocks">
                  <h4>Your Sequence:</h4>
                  {selectedBlocks.map((blockId, idx) => {
                    const block = blocks.find(b => b.id === blockId);
                    return block ? (
                      <div
                        key={blockId}
                        className="code-block selected"
                        onClick={() => handleBlockClick(block)}
                      >
                        <span className="block-number">{idx + 1}</span>
                        {block.lines.map((line, i) => (
                          <div key={i} className="code-line">{line}</div>
                        ))}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={selectedBlocks.length === 0}
                className="btn btn-primary submit-btn"
              >
                Submit Answer
              </button>
            </div>
          </>
        ) : (
          <LevelCompletion
            isCorrect={result.isCorrect}
            score={result.score}
            level={parseInt(level)}
            difficulty="intermediate"
            maxLevel={100}
            explanation={result.explanation}
            timeTaken={timeTaken}
            nextLevelPath={parseInt(level) < 100 ? `/student/games/intermediate/${parseInt(level) + 1}` : null}
            onClose={handleNext}
          />
        )}
      </div>

      <Leaderboard difficulty="intermediate" level={parseInt(level)} />
    </div>
  );
};

export default IntermediateGame;

