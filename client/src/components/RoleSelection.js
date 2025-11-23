import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RoleSelection.css';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [usn, setUsn] = useState('');
  const [showUsnInput, setShowUsnInput] = useState(false);
  const [showTeacherLogin, setShowTeacherLogin] = useState(false);
  const [teacherAuthMode, setTeacherAuthMode] = useState('login');
  const [teacherCreds, setTeacherCreds] = useState({ username: '', password: '' });
  const [teacherSignupData, setTeacherSignupData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setError('');
    if (role === 'student') {
      setShowUsnInput(true);
      setShowTeacherLogin(false);
    } else {
      setShowUsnInput(false);
      setShowTeacherLogin(true);
    }
  };

  const handleContinue = async () => {
    setError('');
    if (selectedRole === 'student') {
      if (!usn.trim()) {
        alert('Please enter your USN');
        return;
      }
      
      const usnUpper = usn.toUpperCase();
      localStorage.setItem('studentUSN', usnUpper);
      
      // Store student in database if not exists
      try {
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
      setLoading(true);
      if (teacherAuthMode === 'login') {
        if (!teacherCreds.username.trim() || !teacherCreds.password.trim()) {
          setError('Please enter your teacher username and password');
          setLoading(false);
          return;
        }
        const result = await login(teacherCreds.username.trim(), teacherCreds.password, 'teacher');
        setLoading(false);

        if (result.success) {
          navigate('/teacher/dashboard');
        } else {
          setError(result.message || 'Failed to log in as teacher');
        }
      } else {
        const { username, email, phone, password, confirmPassword } = teacherSignupData;
        if (!username.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
          setError('Please fill in all teacher registration fields');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        const result = await signup(
          {
            username: username.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            confirmPassword
          },
          'teacher'
        );
        setLoading(false);

        if (result.success) {
          navigate('/teacher/dashboard');
        } else {
          setError(result.message || 'Failed to register teacher');
        }
      }
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

        {showTeacherLogin && (
          <div className="teacher-auth-container">
            <div className="teacher-auth-toggle">
              <button
                className={teacherAuthMode === 'login' ? 'active' : ''}
                onClick={() => { setTeacherAuthMode('login'); setError(''); }}
              >
                Login
              </button>
              <button
                className={teacherAuthMode === 'register' ? 'active' : ''}
                onClick={() => { setTeacherAuthMode('register'); setError(''); }}
              >
                Register
              </button>
            </div>

            {teacherAuthMode === 'login' ? (
              <div className="teacher-login-container">
                <label>Teacher Login</label>
                <input
                  type="text"
                  placeholder="Teacher username"
                  value={teacherCreds.username}
                  onChange={(e) => setTeacherCreds(prev => ({ ...prev, username: e.target.value }))}
                />
                <input
                  type="password"
                  placeholder="Teacher password"
                  value={teacherCreds.password}
                  onChange={(e) => setTeacherCreds(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
            ) : (
              <div className="teacher-register-container">
                <label>Teacher Registration</label>
                <input
                  type="text"
                  placeholder="Username"
                  value={teacherSignupData.username}
                  onChange={(e) => setTeacherSignupData(prev => ({ ...prev, username: e.target.value }))}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={teacherSignupData.email}
                  onChange={(e) => setTeacherSignupData(prev => ({ ...prev, email: e.target.value }))}
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={teacherSignupData.phone}
                  onChange={(e) => setTeacherSignupData(prev => ({ ...prev, phone: e.target.value }))}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={teacherSignupData.password}
                  onChange={(e) => setTeacherSignupData(prev => ({ ...prev, password: e.target.value }))}
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={teacherSignupData.confirmPassword}
                  onChange={(e) => setTeacherSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            )}
          </div>
        )}

        {error && <div className="role-error">{error}</div>}

        <button 
          className="continue-btn"
          onClick={handleContinue}
          disabled={
            loading ||
            !selectedRole ||
            (selectedRole === 'student' && !usn.trim()) ||
            (selectedRole === 'teacher' && teacherAuthMode === 'login' && (!teacherCreds.username.trim() || !teacherCreds.password.trim())) ||
            (selectedRole === 'teacher' && teacherAuthMode === 'register' && (!teacherSignupData.username.trim() || !teacherSignupData.email.trim() || !teacherSignupData.phone.trim() || !teacherSignupData.password.trim() || !teacherSignupData.confirmPassword.trim()))
          }
        >
          {loading ? 'Logging in...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default RoleSelection;

