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
  const [submittedQuestions, setSubmittedQuestions] = useState(new Set()); // Track which questions have been submitted
  const [showReview, setShowReview] = useState(false); // Show review screen after final submission

  useEffect(() => {
    soundEffects.updateSettings();
    if (!passed) {
      soundEffects.playPopup();
    }
  }, [passed]);

  const handleAnswerChange = (questionId, answer) => {
    // Only allow changing answer if question hasn't been submitted yet
    if (!submittedQuestions.has(questionId)) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
      soundEffects.playClick();
    }
  };

  const handleSubmitAnswer = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (answers[currentQuestion._id] === undefined || answers[currentQuestion._id] === null) {
      alert('Please select an answer before submitting.');
      soundEffects.playError();
      return;
    }
    
    soundEffects.playSubmit();
    setSubmittedQuestions(prev => new Set([...prev, currentQuestion._id]));
    
    // Move to next question if not last
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 500);
    }
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
          level: quiz.level || 1,
          usn: localStorage.getItem('studentUSN')
        },
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );

      setResult(response.data);
      setShowReview(true); // Show review screen with answers
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Fallback: get correct answers from quiz questions
      const questionResults = quiz.questions.map(q => {
        const isCorrect = answers[q._id] === q.correctAnswer;
        return {
          questionId: q._id,
          question: q.question,
          options: q.options,
          userAnswer: answers[q._id],
          correctAnswer: q.correctAnswer,
          isCorrect,
          explanation: q.explanation
        };
      });
      
      const correctCount = questionResults.filter(r => r.isCorrect).length;
      const passed = correctCount >= 3;
      setResult({
        passed,
        correctAnswers: correctCount,
        totalQuestions: 5,
        score: correctCount * 20,
        answers: questionResults
      });
      setShowReview(true);
    }
  };

  const handleContinueAfterReview = () => {
    if (result && result.passed) {
      onComplete(true, result.answers || []);
    } else {
      onRetry();
    }
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const allAnswered = quiz.questions.every(q => answers[q._id] !== undefined && answers[q._id] !== null);
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const isCurrentQuestionSubmitted = submittedQuestions.has(currentQuestion._id);

  // Review screen - show all questions with correct/incorrect answers
  if (showReview && result) {
    return (
      <div className="quiz-popup-overlay">
        <div className={`quiz-popup ${result.passed ? 'passed' : 'failed'}`}>
          <div className="quiz-result-icon">
            {result.passed ? '🎉' : '❌'}
          </div>
          <h2>{result.passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
          <p className="result-summary">You got {result.correctAnswers} out of {result.totalQuestions} questions correct.</p>
          
          <div className="quiz-review-section">
            <h3>Question Review</h3>
            {quiz.questions.map((q, idx) => {
              // Get result from backend response if available
              const resultData = result.answers?.find(a => a.questionId === q._id || a.questionId?.toString() === q._id?.toString());
              const userAnswer = resultData?.userAnswer !== undefined ? resultData.userAnswer : answers[q._id];
              const correctAnswer = resultData?.correctAnswer !== undefined ? resultData.correctAnswer : q.correctAnswer;
              const isCorrect = resultData?.isCorrect !== undefined ? resultData.isCorrect : userAnswer === correctAnswer;
              const explanation = resultData?.explanation || q.explanation;
              const options = resultData?.options || q.options;
              
              return (
                <div key={q._id} className={`review-question-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="review-question-header">
                    <span className="review-question-number">Question {idx + 1}</span>
                    <span className={`review-status ${isCorrect ? 'correct-badge' : 'incorrect-badge'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  
                  <div className="review-question-text">
                    <pre className="code-snippet">{q.question}</pre>
                  </div>
                  
                  <div className="review-answers">
                    <div className="review-answer-item">
                      <strong>Your Answer:</strong>
                      <span className={`user-answer ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {userAnswer !== undefined && userAnswer !== null 
                          ? `${String.fromCharCode(65 + userAnswer)}. ${options?.[userAnswer] || 'Not answered'}`
                          : 'Not answered'}
                      </span>
                    </div>
                    {!isCorrect && correctAnswer !== undefined && correctAnswer !== null && (
                      <div className="review-answer-item">
                        <strong>Correct Answer:</strong>
                        <span className="correct-answer">
                          {String.fromCharCode(65 + correctAnswer)}. {options?.[correctAnswer]}
                        </span>
                      </div>
                    )}
                    {explanation && (
                      <div className="review-explanation">
                        <strong>Explanation:</strong>
                        <p>{explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="result-message">
            {result.passed 
              ? 'Great job! You can continue playing.' 
              : 'You need at least 3 correct answers to continue. Try again!'}
          </p>
          
          <div className="quiz-actions">
            {result.passed ? (
              <button 
                onClick={handleContinueAfterReview}
                className="btn-continue"
              >
                Continue Playing
              </button>
            ) : (
              <button 
                onClick={handleContinueAfterReview}
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

  // Main quiz screen
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
                {isCurrentQuestionSubmitted ? '✓ Submitted' : answers[currentQuestion._id] !== undefined ? 'Selected' : 'Not Answered'}
              </span>
            </div>
            
            <div className="question-text">
              <pre className="code-snippet">{currentQuestion.question}</pre>
            </div>
            
            <div className="options">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = answers[currentQuestion._id] === index;
                const isDisabled = isCurrentQuestionSubmitted;
                
                return (
                  <button
                    key={index}
                    className={`option-btn ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => handleAnswerChange(currentQuestion._id, index)}
                    onMouseEnter={() => !isDisabled && soundEffects.playHover()}
                    disabled={isDisabled}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
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
                  className={`question-indicator ${idx === currentQuestionIndex ? 'active' : ''} ${submittedQuestions.has(q._id) ? 'submitted' : answers[q._id] !== undefined ? 'answered' : ''}`}
                  onClick={() => setCurrentQuestionIndex(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {isLastQuestion ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={!allAnswered || submitted}
                className="btn-submit"
              >
                {submitted ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                {!isCurrentQuestionSubmitted && (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={answers[currentQuestion._id] === undefined}
                    className="btn-submit-answer"
                  >
                    Submit Answer
                  </button>
                )}
                <button
                  onClick={handleNextQuestion}
                  className="btn-nav"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPopup;

