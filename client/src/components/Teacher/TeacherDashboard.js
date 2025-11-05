import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Profile from './Profile';
import ProgressTracking from './ProgressTracking';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="teacher-dashboard">
      <nav className="teacher-nav">
        <div className="nav-brand">
          <h2>Coding Habit Builder</h2>
        </div>
        <div className="nav-links">
          <Link 
            to="/teacher/dashboard" 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </Link>
          <Link 
            to="/teacher/progress" 
            className={activeTab === 'progress' ? 'active' : ''}
            onClick={() => setActiveTab('progress')}
          >
            Student Progress
          </Link>
          <Link 
            to="/teacher/profile" 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <Routes>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/progress" element={<ProgressTracking />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  return (
    <div className="dashboard-home">
      <h1>Welcome, Teacher!</h1>
      <div className="teacher-stats">
        <div className="stat-card">
          <h3>Monitor Student Progress</h3>
          <p>View how students are performing in their coding quizzes and track their progress through different difficulty levels.</p>
          <div className="quick-actions">
            <Link to="/teacher/progress" className="action-btn">
              View Student Progress
            </Link>
          </div>
        </div>
        <div className="stat-card">
          <h3>📊 Overview</h3>
          <p>Students play a game for 5 minutes. After 5 minutes, a quiz appears with 5 questions. They need at least 3 correct answers to continue playing.</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

