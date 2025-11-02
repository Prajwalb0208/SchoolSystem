import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Profile from './Profile';
import GameLevels from './GameLevels';
import Assignments from './Assignments';
import Notes from './Notes';
import Settings from './Settings';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="student-dashboard">
      <nav className="student-nav">
        <div className="nav-brand">
          <h2>Coding Habit Builder</h2>
        </div>
        <div className="nav-links">
          <Link 
            to="/student/dashboard" 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </Link>
          <Link 
            to="/student/games" 
            className={activeTab === 'games' ? 'active' : ''}
            onClick={() => setActiveTab('games')}
          >
            Games
          </Link>
          <Link 
            to="/student/assignments" 
            className={activeTab === 'assignments' ? 'active' : ''}
            onClick={() => setActiveTab('assignments')}
          >
            Assignments
          </Link>
          <Link 
            to="/student/notes" 
            className={activeTab === 'notes' ? 'active' : ''}
            onClick={() => setActiveTab('notes')}
          >
            Notes
          </Link>
          <Link 
            to="/student/profile" 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </Link>
          <Link 
            to="/student/settings" 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </Link>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <Routes>
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/games/*" element={<GameLevels />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
};

const DashboardHome = () => {
  const { user, API_URL } = useAuth();
  const [stats, setStats] = useState(null);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_URL}/students/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    if (API_URL) {
      fetchProfile();
    }
  }, [API_URL]);

  return (
    <div className="dashboard-home">
      <h1>Welcome, {user?.name || user?.username}!</h1>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Streak Level</h3>
            <p className="stat-value">{stats.streakLevel || 0}</p>
            <p className="stat-label">Days</p>
          </div>
          
          <div className="stat-card">
            <h3>Total Badges</h3>
            <p className="stat-value">{stats.totalBadges || 0}</p>
            <p className="stat-label">Badges Earned</p>
          </div>
          
          <div className="stat-card">
            <h3>Easy Levels</h3>
            <p className="stat-value">{stats.easyLevelCompleted || 0}/50</p>
            <p className="stat-label">Completed</p>
          </div>
          
          <div className="stat-card">
            <h3>Intermediate Levels</h3>
            <p className="stat-value">{stats.intermediateLevelCompleted || 0}/100</p>
            <p className="stat-label">Completed</p>
          </div>
          
          <div className="stat-card">
            <h3>Hard Levels</h3>
            <p className="stat-value">{stats.hardLevelCompleted || 0}/50</p>
            <p className="stat-label">Completed</p>
          </div>
          
          <div className="stat-card">
            <h3>Wins</h3>
            <p className="stat-value">{stats.wins || 0}</p>
            <p className="stat-label">Total Wins</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

