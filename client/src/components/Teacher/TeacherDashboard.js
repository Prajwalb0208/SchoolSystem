import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Profile from './Profile';
import Assignments from './Assignments';
import ProgressTracking from './ProgressTracking';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
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
            to="/teacher/assignments" 
            className={activeTab === 'assignments' ? 'active' : ''}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
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
          <Route path="/assignments/*" element={<Assignments />} />
          <Route path="/progress" element={<ProgressTracking />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-home">
      <h1>Welcome, {user?.username}!</h1>
      <div className="teacher-stats">
        <div className="stat-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <Link to="/teacher/assignments" className="action-btn">
              Create Assignment
            </Link>
            <Link to="/teacher/progress" className="action-btn">
              View Student Progress
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;

