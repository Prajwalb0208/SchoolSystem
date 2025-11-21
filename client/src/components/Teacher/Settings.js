import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Settings.css';
import API_BASE_URL from '../../config';

const Settings = () => {
  const { API_URL: contextAPI_URL } = useAuth();
  const apiUrl = contextAPI_URL || API_BASE_URL;
  const [settings, setSettings] = useState({
    gameTimeLimit: 120, // 2 minutes default
    quizQuestionCount: 5,
    quizPassingScore: 3
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/settings`);
      setSettings({
        gameTimeLimit: response.data.gameTimeLimit || 120,
        quizQuestionCount: response.data.quizQuestionCount || 5,
        quizPassingScore: response.data.quizPassingScore || 3
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setError('Failed to load settings');
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: parseInt(value, 10) || 0
    }));
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${apiUrl}/settings`,
        settings,
        {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }
      );

      setMessage('Settings saved successfully!');
      setSettings(response.data.settings);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <h1>⚙️ Game Settings</h1>
      <p className="settings-description">
        Configure game time limits and quiz requirements for all students.
      </p>

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="setting-item">
          <label htmlFor="gameTimeLimit">
            <span className="setting-label">Game Time Limit</span>
            <span className="setting-description">
              How long students can play before a quiz appears (60 seconds - 30 minutes)
            </span>
          </label>
          <div className="setting-input-group">
            <input
              type="number"
              id="gameTimeLimit"
              name="gameTimeLimit"
              value={settings.gameTimeLimit}
              onChange={handleChange}
              min="60"
              max="1800"
              step="30"
              required
              className="setting-input"
            />
            <span className="setting-unit">
              seconds ({formatTime(settings.gameTimeLimit)})
            </span>
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="quizQuestionCount">
            <span className="setting-label">Quiz Questions Count</span>
            <span className="setting-description">
              Number of questions in each quiz (3-10 questions)
            </span>
          </label>
          <div className="setting-input-group">
            <input
              type="number"
              id="quizQuestionCount"
              name="quizQuestionCount"
              value={settings.quizQuestionCount}
              onChange={handleChange}
              min="3"
              max="10"
              required
              className="setting-input"
            />
            <span className="setting-unit">questions</span>
          </div>
        </div>

        <div className="setting-item">
          <label htmlFor="quizPassingScore">
            <span className="setting-label">Quiz Passing Score</span>
            <span className="setting-description">
              Minimum correct answers needed to pass the quiz (must be less than or equal to quiz questions count)
            </span>
          </label>
          <div className="setting-input-group">
            <input
              type="number"
              id="quizPassingScore"
              name="quizPassingScore"
              value={settings.quizPassingScore}
              onChange={handleChange}
              min="1"
              max={settings.quizQuestionCount}
              required
              className="setting-input"
            />
            <span className="setting-unit">
              correct answers (out of {settings.quizQuestionCount})
            </span>
          </div>
        </div>

        {message && (
          <div className="message success">{message}</div>
        )}

        {error && (
          <div className="message error">{error}</div>
        )}

        <button type="submit" className="save-btn" disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Settings'}
        </button>
      </form>

      <div className="settings-info">
        <h3>📋 Current Settings Summary</h3>
        <div className="settings-summary">
          <div className="summary-item">
            <span className="summary-label">Game Duration:</span>
            <span className="summary-value">{formatTime(settings.gameTimeLimit)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Quiz Questions:</span>
            <span className="summary-value">{settings.quizQuestionCount}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Passing Score:</span>
            <span className="summary-value">{settings.quizPassingScore} out of {settings.quizQuestionCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

