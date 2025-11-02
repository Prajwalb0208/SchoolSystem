import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Assignments.css';

const Assignments = () => {
  const { API_URL } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState({});
  const [answers, setAnswers] = useState({}); // { assignmentId: { questionIndex: answer } }
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [submitting, setSubmitting] = useState({});

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/assignments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAssignments(response.data);
      
      // Fetch submissions for each assignment
      const submissionsData = {};
      for (const assignment of response.data) {
        try {
          const subResponse = await axios.get(`${API_URL}/assignments/${assignment._id}/submission`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (subResponse.data.submission) {
            submissionsData[assignment._id] = subResponse.data.submission;
            // Pre-fill answers if submission exists
            const existingAnswers = {};
            subResponse.data.submission.answers.forEach(ans => {
              existingAnswers[ans.questionIndex] = ans.answer;
            });
            setAnswers(prev => ({
              ...prev,
              [assignment._id]: existingAnswers
            }));
          }
        } catch (error) {
          console.error(`Error fetching submission for ${assignment._id}:`, error);
        }
      }
      setSubmissions(submissionsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setLoading(false);
    }
  };

  const handleAnswerChange = (assignmentId, questionIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [assignmentId]: {
        ...(prev[assignmentId] || {}),
        [questionIndex]: value
      }
    }));
  };

  const handleSubmit = async (assignmentId) => {
    if (!answers[assignmentId] || Object.keys(answers[assignmentId]).length === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    setSubmitting(prev => ({ ...prev, [assignmentId]: true }));

    try {
      const token = localStorage.getItem('token');
      const assignment = assignments.find(a => a._id === assignmentId);
      const answersArray = assignment.questions.map((q, idx) => ({
        questionIndex: idx,
        answer: answers[assignmentId][idx] || ''
      }));

      const response = await axios.post(
        `${API_URL}/assignments/${assignmentId}/submit`,
        { answers: answersArray },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setSubmissions(prev => ({
        ...prev,
        [assignmentId]: response.data.submission
      }));

      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    } finally {
      setSubmitting(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="assignments-container">
      <h1>Assignments</h1>
      {assignments.length === 0 ? (
        <div className="no-assignments">No assignments available yet.</div>
      ) : (
        <div className="assignments-list">
          {assignments.map((assignment) => {
            const submission = submissions[assignment._id];
            const isExpanded = expandedAssignment === assignment._id;
            const assignmentAnswers = answers[assignment._id] || {};

            return (
              <div key={assignment._id} className="assignment-card">
                <div className="assignment-header">
                  <div>
                    <h3>{assignment.title}</h3>
                    {submission && (
                      <span className="submission-status submitted">
                        ✓ Submitted on {new Date(submission.submittedAt).toLocaleDateString()}
                        {submission.score !== undefined && submission.score !== null && (
                          <span className="score">Score: {submission.score}</span>
                        )}
                      </span>
                    )}
                  </div>
                  {assignment.dueDate && (
                    <span className="due-date">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="assignment-description">{assignment.description}</p>
                
                <button
                  className="btn btn-secondary"
                  onClick={() => setExpandedAssignment(isExpanded ? null : assignment._id)}
                >
                  {isExpanded ? 'Hide Questions' : 'View Questions & Submit'}
                </button>

                {isExpanded && (
                  <div className="assignment-questions">
                    <h4>Questions ({assignment.questions.length}):</h4>
                    {assignment.questions.map((q, idx) => (
                      <div key={idx} className="question-item">
                        <p><strong>{idx + 1}.</strong> {q.question}</p>
                        <span className="question-meta">
                          Language: {q.language} | Points: {q.points}
                        </span>
                        <textarea
                          className="answer-textarea"
                          placeholder="Write your answer here..."
                          value={assignmentAnswers[idx] || ''}
                          onChange={(e) => handleAnswerChange(assignment._id, idx, e.target.value)}
                          rows={4}
                          disabled={submission && submission.status === 'graded'}
                        />
                        {submission && submission.answers[idx] && (
                          <div className="submission-info">
                            <small>Your answer: {submission.answers[idx].answer}</small>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="submit-section">
                      {submission ? (
                        <div className="already-submitted">
                          <p>Assignment submitted on {new Date(submission.submittedAt).toLocaleString()}</p>
                          {submission.status === 'submitted' && (
                            <button
                              className="btn btn-primary"
                              onClick={() => handleSubmit(assignment._id)}
                              disabled={submitting[assignment._id]}
                            >
                              {submitting[assignment._id] ? 'Updating...' : 'Update Submission'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary submit-assignment-btn"
                          onClick={() => handleSubmit(assignment._id)}
                          disabled={submitting[assignment._id]}
                        >
                          {submitting[assignment._id] ? 'Submitting...' : 'Submit Assignment'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="assignment-footer">
                  <span className="created-by">
                    Created by: {assignment.createdBy?.username || 'Unknown'}
                  </span>
                  <span className="created-at">
                    {new Date(assignment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Assignments;

