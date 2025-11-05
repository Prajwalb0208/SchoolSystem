import React, { useState, useEffect } from 'react';
import axios from 'axios';
import soundEffects from '../utils/soundEffects';
import './QuizPopup.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';

const QuizPopup = ({ quiz, onComplete, onRetry, passed }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    soundEffects.updateSettings();
    if (!passed) {
      soundEffects.playPopup();
    }
  }, [passed]);

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
    const allAnswered = quiz.questions.every(q => answers[q._id] !== undefined && answers[q._id] !== null);
    if (!allAnswered) {
      alert('Please answer all 5 questions before submitting.');
      soundEffects.playError();
      return;
    }

    soundEffects.playSubmit();
    setSubmitted(true);

    try {
      const token = localStorage.getItem('token');
      const answerArray = quiz.questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id],
        timeTaken: 30 // Default time
      }));

      const response = await axios.post(
        `${API_URL}/games/submit-quiz`,
        {
          gameType: quiz.gameType || 'typing',
          answers: answerArray,
          totalTimeTaken: 300,
          gameScore: quiz.gameScore || 0,
          usn: localStorage.getItem('studentUSN')
        },
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );

      setResult(response.data);
      onComplete(response.data.passed, response.data.answers);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Fallback: simple validation
      const correctAnswers = {
        '1': 1, // 4
        '2': 1, // 6
        '3': 1, // 8
        '4': 1, // 10
        '5': 1  // 12
      };
      
      let correctCount = 0;
      quiz.questions.forEach(q => {
        if (answers[q._id] === correctAnswers[q._id]) {
          correctCount++;
        }
      });

      const passed = correctCount >= 3;
      setResult({
        passed,
        correctAnswers: correctCount,
        totalQuestions: 5,
        score: correctCount * 20
      });
      onComplete(passed, []);
    }
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const allAnswered = quiz.questions.every(q => answers[q._id] !== undefined && answers[q._id] !== null);

  if (result) {
    return (
      <div className="quiz-popup-overlay">
        <div className={`quiz-popup ${result.passed ? 'passed' : 'failed'}`}>
          <div className="quiz-result-icon">
            {result.passed ? '🎉' : '❌'}
          </div>
          <h2>{result.passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
          <p>You got {result.correctAnswers} out of {result.totalQuestions} questions correct.</p>
          <p className="result-message">
            {result.passed 
              ? 'Great job! You can continue playing.' 
              : 'You need at least 3 correct answers to continue. Try again!'}
          </p>
          <div className="quiz-actions">
            {result.passed ? (
              <button 
                onClick={() => onComplete(true, [])}
                className="btn-continue"
              >
                Continue Playing
              </button>
            ) : (
              <button 
                onClick={onRetry}
                className="btn-retry"
              >
                Retry Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-popup-overlay">
      <div className="quiz-popup">
        <div className="quiz-header">
          <h2>⏱️ Time's Up! Complete the Quiz</h2>
          <p>Answer at least 3 out of 5 questions correctly to continue playing</p>
        </div>

        <div className="quiz-progress">
          <div className="progress-info">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="quiz-content">
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
          </div>

          <div className="quiz-navigation">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="btn-nav"
            >
              ← Previous
            </button>
            
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

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="btn-nav"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered || submitted}
                className="btn-submit"
              >
                {submitted ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPopup;

