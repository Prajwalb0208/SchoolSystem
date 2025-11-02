import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Assignments.css';

const Assignments = () => {
  const { API_URL } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setLoading(false);
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
          {assignments.map((assignment) => (
            <div key={assignment._id} className="assignment-card">
              <div className="assignment-header">
                <h3>{assignment.title}</h3>
                {assignment.dueDate && (
                  <span className="due-date">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="assignment-description">{assignment.description}</p>
              <div className="assignment-questions">
                <h4>Questions ({assignment.questions.length}):</h4>
                {assignment.questions.map((q, idx) => (
                  <div key={idx} className="question-item">
                    <p><strong>{idx + 1}.</strong> {q.question}</p>
                    <span className="question-meta">
                      Language: {q.language} | Points: {q.points}
                    </span>
                  </div>
                ))}
              </div>
              <div className="assignment-footer">
                <span className="created-by">
                  Created by: {assignment.createdBy?.username || 'Unknown'}
                </span>
                <span className="created-at">
                  {new Date(assignment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assignments;

