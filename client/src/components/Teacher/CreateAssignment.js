import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';

const CreateAssignment = () => {
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    questions: [{ question: '', language: 'General', points: 10 }]
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { question: '', language: 'General', points: 10 }]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/assignments`,
        formData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Notify students
      const socket = io(process.env.REACT_APP_SOCKET_URL || 'https://schoolsystem-lyl7.onrender.com');
      socket.emit('assignment-created', {
        assignmentId: response.data.assignment._id,
        title: formData.title
      });

      navigate('/teacher/assignments');
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Error creating assignment');
      setLoading(false);
    }
  };

  return (
    <div className="assignments-container">
      <h1>Create New Assignment</h1>
      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>

        <div className="questions-section">
          <h3>Questions</h3>
          {formData.questions.map((q, idx) => (
            <div key={idx} className="question-form">
              <div className="form-group">
                <label>Question {idx + 1} *</label>
                <textarea
                  value={q.question}
                  onChange={(e) => handleQuestionChange(idx, 'question', e.target.value)}
                  rows="3"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={q.language}
                    onChange={(e) => handleQuestionChange(idx, 'language', e.target.value)}
                  >
                    <option value="General">General</option>
                    <option value="C">C</option>
                    <option value="C++">C++</option>
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Points</label>
                  <input
                    type="number"
                    value={q.points}
                    onChange={(e) => handleQuestionChange(idx, 'points', parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                {formData.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="btn btn-danger"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="btn btn-secondary">
            Add Question
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Assignment'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/teacher/assignments')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssignment;

