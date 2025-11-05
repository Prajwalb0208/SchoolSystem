import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import io from 'socket.io-client';
import Leaderboard from '../Leaderboard';
import LevelCompletion from './LevelCompletion';
import soundEffects from '../../../utils/soundEffects';
import './Game.css';
import './HardGame.css';

const HardGame = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const { user, API_URL } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [socket, setSocket] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [passed, setPassed] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  const languages = ['C', 'C++', 'Java', 'Python'];
  const languageTemplates = {
    'C': '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}',
    'C++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}',
    'Java': 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n        \n    }\n}',
    'Python': '# Write your code here\n'
  };

  useEffect(() => {
    soundEffects.updateSettings();
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    newSocket.emit('join-game', {
      difficulty: 'hard',
      level: parseInt(level),
      studentId: user?.id
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [level]);

  const spinWheel = () => {
    if (spinning) return;
    soundEffects.playSpin();
    setSpinning(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * languages.length);
      const language = languages[randomIndex];
      setSelectedLanguage(language);
      setSpinning(false);
      soundEffects.playPopup();
      fetchQuestion(language);
      setCode(languageTemplates[language] || '');
      setStartTime(Date.now());
    }, 3000);
  };

  const fetchQuestion = async (language) => {
    try {
      const token = localStorage.getItem('token');
      // Fetch question with language parameter
      const response = await axios.get(`${API_URL}/games/question/hard/${level}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: { language }
      });
      
      setQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
      if (error.response?.status === 404) {
        alert('Question not found for this language and level. Please try again or contact support.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      soundEffects.playError();
      return;
    }

    soundEffects.playSubmit();
    const calculatedTimeTaken = Math.floor((Date.now() - startTime) / 1000);
    setTimeTaken(calculatedTimeTaken);

    try {
      const token = localStorage.getItem('token');
      
      // Submit answer
      const response = await axios.post(
        `${API_URL}/games/submit-answer`,
        {
          questionId: question._id,
          answer: code,
          timeTaken: calculatedTimeTaken,
          visualTheme: 1
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.isCorrect) {
        soundEffects.playSuccess();
        // Add to leaderboard
        const leaderboardResponse = await axios.post(
          `${API_URL}/games/leaderboard/add`,
          {
            difficulty: 'hard',
            level: parseInt(level),
            score: response.data.score,
            timeTaken: calculatedTimeTaken
          },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        setPassed(leaderboardResponse.data.passed);
        
        if (leaderboardResponse.data.passed) {
          soundEffects.playBadge();
        }
        
        setResult({
          ...response.data,
          passed: leaderboardResponse.data.passed,
          position: leaderboardResponse.data.position
        });

        if (socket && leaderboardResponse.data.passed) {
          socket.emit('submit-answer', {
            difficulty: 'hard',
            level: parseInt(level),
            studentId: user?.id,
            score: response.data.score,
            timeTaken: calculatedTimeTaken
          });
        }
      } else {
        soundEffects.playError();
        setResult(response.data);
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
    const wasPassed = passed;
    setResult(null);
    setSelectedLanguage(null);
    setCode('');
    setPassed(false);
    
    if (wasPassed && parseInt(level) < 50) {
      navigate(`/student/games/hard/${parseInt(level) + 1}`);
    } else if (!wasPassed) {
      // Restart same level - nothing to do, already reset state
    } else {
      navigate('/student/games');
    }
  };

  return (
    <div className="game-container hard-game">
      <div className="game-header">
        <h2>Hard Level {level}</h2>
      </div>

      <div className="game-content">
        {!selectedLanguage ? (
          <div className="spinning-wheel-container">
            <h3>Spin the Wheel to Select Programming Language!</h3>
            <div className={`spinning-wheel ${spinning ? 'spinning' : ''}`}>
              <div className="wheel">
                {languages.map((lang, idx) => (
                  <div
                    key={lang}
                    className="wheel-segment"
                    style={{ '--rotation': idx * 90 + 'deg' }}
                  >
                    {lang}
                  </div>
                ))}
              </div>
              <div className="wheel-pointer"></div>
            </div>
            <button
              onClick={spinWheel}
              disabled={spinning}
              className="btn btn-primary"
              onMouseEnter={() => soundEffects.playHover()}
            >
              {spinning ? 'Spinning...' : 'Spin Wheel'}
            </button>
          </div>
        ) : !result ? (
          <div className="question-card">
            <div className="language-badge">Language: {selectedLanguage}</div>
            <h3>{question?.problemStatement}</h3>
            {question?.testCases && (
              <div className="test-cases">
                <h4>Test Cases:</h4>
                {question.testCases.map((tc, idx) => (
                  <div key={idx} className="test-case">
                    <p><strong>Input:</strong> {tc.input}</p>
                    <p><strong>Expected Output:</strong> {tc.output}</p>
                  </div>
                ))}
              </div>
            )}
            {question?.hints && (
              <div className="hints">
                <h4>Hints:</h4>
                <ul>
                  {question.hints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="code-editor">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="code-textarea"
                placeholder="Write your code here..."
                rows={20}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!code.trim()}
              className="btn btn-primary submit-btn"
            >
              Submit Code
            </button>
          </div>
        ) : (
          <LevelCompletion
            isCorrect={result.isCorrect}
            score={result.score}
            level={parseInt(level)}
            difficulty="hard"
            maxLevel={50}
            explanation={result.explanation}
            timeTaken={timeTaken}
            nextLevelPath={result?.passed && parseInt(level) < 50 ? `/student/games/hard/${parseInt(level) + 1}` : null}
            onClose={handleNext}
            specialAchievement={
              result.passed 
                ? `🏆 Position #${result.position} - Among Top 5!` 
                : result.isCorrect 
                  ? 'Correct but not fast enough. Try again!' 
                  : null
            }
          />
        )}
      </div>

      <Leaderboard difficulty="hard" level={parseInt(level)} />
    </div>
  );
};

export default HardGame;

