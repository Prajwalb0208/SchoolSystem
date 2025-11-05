import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import io from 'socket.io-client';
import Leaderboard from '../Leaderboard';
import LevelCompletion from './LevelCompletion';
import soundEffects from '../../../utils/soundEffects';
import './Game.css';

const EasyGame = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  const { user, API_URL } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: answer }
  const [questionStartTimes, setQuestionStartTimes] = useState({}); // { questionId: startTime }
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes total for quiz
  const [result, setResult] = useState(null);
  const [socket, setSocket] = useState(null);
  const [totalStartTime] = useState(Date.now());
  const lastWarningTimeRef = useRef(0);

  useEffect(() => {
    soundEffects.updateSettings();
    fetchQuiz();
    
    // Initialize socket
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'https://schoolsystem-lyl7.onrender.com');
    newSocket.emit('join-game', {
      difficulty: 'easy',
      level: parseInt(level),
      studentId: user?.id
    });
    setSocket(newSocket);

    // Timer for 5 minutes total quiz time
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const fetchQuiz = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/games/quiz/easy/${level}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setQuiz(response.data);
      // Initialize start times for all questions
      const startTimes = {};
      response.data.questions.forEach(q => {
        startTimes[q._id] = Date.now();
      });
      setQuestionStartTimes(startTimes);
      setTimeLeft(300);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert(error.response?.data?.message || 'Error loading quiz');
    }
  };

  const handleTimeUp = () => {
    // Auto-submit quiz when time is up
    if (quiz && Object.keys(answers).length === quiz.questions.length) {
      handleSubmitQuiz();
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    soundEffects.playClick();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      soundEffects.playClick();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      soundEffects.playClick();
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const allAnswered = quiz.questions.every(q => answers[q._id] !== undefined && answers[q._id] !== null);
    if (!allAnswered) {
      alert('Please answer all 5 questions before submitting.');
      soundEffects.playError();
      return;
    }

    soundEffects.playSubmit();
    const totalTimeTaken = Math.floor((Date.now() - totalStartTime) / 1000);

    try {
      const token = localStorage.getItem('token');
      const answerArray = quiz.questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id],
        timeTaken: Math.floor((Date.now() - questionStartTimes[q._id]) / 1000)
      }));

      const response = await axios.post(
        `${API_URL}/games/submit-quiz`,
        {
          difficulty: 'easy',
          level: parseInt(level),
          answers: answerArray,
          totalTimeTaken
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setResult(response.data);

      if (response.data.passed && socket) {
        soundEffects.playSuccess();
        socket.emit('submit-answer', {
          difficulty: 'easy',
          level: parseInt(level),
          studentId: user?.id,
          score: response.data.score,
          timeTaken: totalTimeTaken
        });
      } else {
        soundEffects.playError();
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      soundEffects.playError();
      alert('Error submitting quiz. Please try again.');
    }
  };

  const handleNext = () => {
    soundEffects.playClick();
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    if (parseInt(level) < 50) {
      navigate(`/student/games/easy/${parseInt(level) + 1}`);
    } else {
      navigate('/student/games');
    }
  };

  const handleRetry = () => {
    soundEffects.playClick();
    setResult(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    fetchQuiz();
  };

  if (!quiz) {
    return <div className="game-container"><div className="spinner"></div></div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const allAnswered = quiz.questions.every(q => answers[q._id] !== undefined && answers[q._id] !== null);

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>Easy Level {level} - Quiz</h2>
        <div className="quiz-progress">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className={`timer ${timeLeft < 60 ? 'warning' : ''}`}>
          Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="game-content">
        {!result ? (
          <>
            <div className="question-card">
              <div className="question-header">
                <span className="question-number">Question {currentQuestionIndex + 1}</span>
                <span className="question-status">
                  {answers[currentQuestion._id] !== undefined ? '✓ Answered' : 'Not Answered'}
                </span>
              </div>
              <div className="question-text">
                <pre className="code-snippet">{currentQuestion.question}</pre>
              </div>
              <div className="options">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    className={`option-btn ${answers[currentQuestion._id] === index ? 'selected' : ''}`}
                    onClick={() => handleAnswerChange(currentQuestion._id, index)}
                    onMouseEnter={() => soundEffects.playHover()}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                ))}
              </div>
              
              <div className="quiz-navigation">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="btn btn-secondary"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={!allAnswered}
                    className="btn btn-primary submit-btn"
                  >
                    Submit Quiz
                  </button>
                )}
              </div>

              <div className="quiz-overview">
                <h4>Question Status:</h4>
                <div className="question-indicators">
                  {quiz.questions.map((q, idx) => (
                    <button
                      key={q._id}
                      className={`question-indicator ${idx === currentQuestionIndex ? 'active' : ''} ${answers[q._id] !== undefined ? 'answered' : ''}`}
                      onClick={() => setCurrentQuestionIndex(idx)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <LevelCompletion
            isCorrect={result.passed}
            score={result.score}
            level={parseInt(level)}
            difficulty="easy"
            maxLevel={50}
            explanation={`You got ${result.correctAnswers} out of ${result.totalQuestions} questions correct. ${result.passed ? 'Congratulations! You passed!' : 'You need at least 3 correct to pass.'}`}
            timeTaken={Math.floor((Date.now() - totalStartTime) / 1000)}
            nextLevelPath={result.passed && parseInt(level) < 50 ? `/student/games/easy/${parseInt(level) + 1}` : null}
            onClose={result.passed ? handleNext : handleRetry}
            showRetry={!result.passed}
            onRetry={handleRetry}
            answers={result.answers}
          />
        )}
      </div>

      <Leaderboard difficulty="easy" level={parseInt(level)} />
    </div>
  );
};

export default EasyGame;
