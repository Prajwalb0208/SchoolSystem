import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import io from 'socket.io-client';
import Leaderboard from '../Leaderboard';
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
  const [startTime] = useState(Date.now());
  const [passed, setPassed] = useState(false);

  const languages = ['C', 'C++', 'Java', 'Python'];
  const languageTemplates = {
    'C': '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}',
    'C++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}',
    'Java': 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n        \n    }\n}',
    'Python': '# Write your code here\n'
  };

  useEffect(() => {
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
    setSpinning(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * languages.length);
      const language = languages[randomIndex];
      setSelectedLanguage(language);
      setSpinning(false);
      fetchQuestion(language);
      setCode(languageTemplates[language] || '');
    }, 3000);
  };

  const fetchQuestion = async (language) => {
    try {
      // Find question for this level and language
      const token = localStorage.getItem('token');
      // In real implementation, you'd fetch based on language
      const response = await axios.get(`${API_URL}/games/question/hard/${level}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Filter by language if needed
      let questionData = response.data;
      if (questionData.language !== language) {
        // Fetch another question with matching language
        // This is simplified - in production, implement proper filtering
      }
      setQuestion(questionData);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const token = localStorage.getItem('token');
      
      // Submit answer
      const response = await axios.post(
        `${API_URL}/games/submit-answer`,
        {
          questionId: question._id,
          answer: code,
          timeTaken,
          visualTheme: 1
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.isCorrect) {
        // Add to leaderboard
        const leaderboardResponse = await axios.post(
          `${API_URL}/games/leaderboard/add`,
          {
            difficulty: 'hard',
            level: parseInt(level),
            score: response.data.score,
            timeTaken
          },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        setPassed(leaderboardResponse.data.passed);
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
            timeTaken
          });
        }
      } else {
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
    }
  };

  const handleNext = () => {
    if (passed && parseInt(level) < 50) {
      navigate(`/student/games/hard/${parseInt(level) + 1}`);
      setResult(null);
      setSelectedLanguage(null);
      setCode('');
      setPassed(false);
    } else if (!passed) {
      // Restart same level
      setResult(null);
      setSelectedLanguage(null);
      setCode('');
      setPassed(false);
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
          <div className="result-card">
            {result.passed ? (
              <>
                <h2>🎉 Congratulations! You Passed!</h2>
                <p>Position: #{result.position}</p>
                <p>You are among the first 5 to complete correctly!</p>
              </>
            ) : (
              <>
                <h2>{result.isCorrect ? '✅ Code Correct!' : '❌ Code Incorrect'}</h2>
                {!result.isCorrect && (
                  <p>Only the first 5 students who complete correctly pass. Please try again!</p>
                )}
              </>
            )}
            <button onClick={handleNext} className="btn btn-primary">
              {passed ? (parseInt(level) < 50 ? 'Next Level' : 'Back to Games') : 'Try Again'}
            </button>
          </div>
        )}
      </div>

      <Leaderboard difficulty="hard" level={parseInt(level)} />
    </div>
  );
};

export default HardGame;

