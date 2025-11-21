import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [usn, setUsn] = useState('');
  const [showUsnInput, setShowUsnInput] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'student') {
      setShowUsnInput(true);
    } else {
      setShowUsnInput(false);
    }
  };

  const handleContinue = async () => {
    if (selectedRole === 'student') {
      if (!usn.trim()) {
        alert('Please enter your USN');
        return;
      }
      
      const usnUpper = usn.toUpperCase();
      localStorage.setItem('studentUSN', usnUpper);
      
      // Store student in database if not exists
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'https://schoolsystem-lyl7.onrender.com/api';
        const response = await fetch(`${API_URL}/auth/student/usn-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ usn: usnUpper })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
        }
      } catch (error) {
        console.error('Error storing USN:', error);
        // Continue anyway - USN is stored in localStorage
      }
      
      navigate('/games');
    } else if (selectedRole === 'teacher') {
      navigate('/teacher/dashboard');
    }
  };

  return (
    <div className="role-selection-page">
      <div className="role-selection-container">
        <h1>Welcome to Coding Habit Builder</h1>
        <p className="subtitle">Select your role to continue</p>
        
        <div className="role-cards">
          <div 
            className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('student')}
          >
            <div className="role-icon">🎮</div>
            <h2>Student</h2>
            <p>Play games and learn coding</p>
          </div>
          
          <div 
            className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
            onClick={() => handleRoleSelect('teacher')}
          >
            <div className="role-icon">👨‍🏫</div>
            <h2>Teacher</h2>
            <p>Monitor student progress</p>
          </div>
        </div>

        {showUsnInput && (
          <div className="usn-input-container">
            <label htmlFor="usn">Enter your USN (e.g., 1MS20CS001)</label>
            <input
              id="usn"
              type="text"
              value={usn}
              onChange={(e) => setUsn(e.target.value.toUpperCase())}
              placeholder="1MS20CS001"
              className="usn-input"
              maxLength={15}
            />
          </div>
        )}

        <button 
          className="continue-btn"
          onClick={handleContinue}
          disabled={!selectedRole || (selectedRole === 'student' && !usn.trim())}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;

