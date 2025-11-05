import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';

const AssignmentList = () => {
  const { API_URL, user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();

    // Listen for new assignments
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socket.on('new-assignment', (data) => {
      fetchAssignments(); // Refresh list
    });

    return () => socket.disconnect();
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/assignments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Error deleting assignment');
    }
  };

  const notifyStudents = (assignmentId, title) => {
    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socket.emit('assignment-created', { assignmentId, title });
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="assignments-container">
      <div className="assignments-header">
        <h1>Assignments</h1>
        <Link to="/teacher/assignments/create" className="btn btn-primary">
          Create New Assignment
        </Link>
      </div>

      {assignments.length === 0 ? (
        <div className="no-assignments">No assignments created yet.</div>
      ) : (
        <div className="assignments-list">
          {assignments.map((assignment) => (
            <div key={assignment._id} className="assignment-card">
              <div className="assignment-header">
                <h3>{assignment.title}</h3>
                <div className="assignment-actions">
                  <Link
                    to={`/teacher/assignments/edit/${assignment._id}`}
                    className="btn btn-secondary"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(assignment._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
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
                <span>Created: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                {assignment.dueDate && (
                  <span className="due-date">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;

