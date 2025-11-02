import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const StudentSignup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    phone: '',
    usn: '',
    dob: '',
    batches: '',
    profilePicture: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const avatars = [
    'avatar1.png',
    'avatar2.png',
    'avatar3.png',
    'avatar4.png',
    'avatar5.png',
    'avatar6.png'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleAvatarSelect = (avatar) => {
    setFormData({
      ...formData,
      profilePicture: avatar
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In production, upload to server first
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          profilePicture: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const submitData = {
      ...formData,
      batches: formData.batches.split(',').map(b => b.trim()).filter(b => b)
    };

    const result = await signup(submitData, 'student');

    if (result.success) {
      navigate('/student/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Student Signup</h1>
        <h2 className="auth-subtitle">Create Your Account</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>USN *</label>
            <input
              type="text"
              name="usn"
              value={formData.usn}
              onChange={handleChange}
              required
              placeholder="e.g., 1MS20CS001"
            />
          </div>

          <div className="form-group">
            <label>Date of Birth *</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Batches (comma separated)</label>
            <input
              type="text"
              name="batches"
              value={formData.batches}
              onChange={handleChange}
              placeholder="e.g., Batch A, Batch B"
            />
          </div>

          <div className="form-group">
            <label>Profile Picture</label>
            <div className="avatar-selection">
              <h4>Choose Avatar:</h4>
              <div className="avatar-grid">
                {avatars.map((avatar, index) => (
                  <div
                    key={index}
                    className={`avatar-option ${formData.profilePicture === avatar ? 'selected' : ''}`}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    <div className="avatar-placeholder">{avatar}</div>
                  </div>
                ))}
              </div>
              <h4>Or Upload from Gallery:</h4>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentSignup;

