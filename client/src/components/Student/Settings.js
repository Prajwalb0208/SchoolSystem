import React, { useState, useEffect } from 'react';
import soundEffects from '../../utils/soundEffects';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    soundVolume: 100,
    notifications: true,
    streakReminders: true
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('gameSettings', JSON.stringify(newSettings));
    soundEffects.updateSettings();
    // Play test sound when adjusting volume (if enabled)
    if (key === 'soundVolume' && value > 0) {
      soundEffects.playClick();
    }
  };

  const handleVolumeChange = (e) => {
    const volume = parseInt(e.target.value);
    handleChange('soundVolume', volume);
    if (volume === 0) {
      handleChange('soundEnabled', false);
    } else {
      handleChange('soundEnabled', true);
    }
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>
      
      <div className="settings-section">
        <h3>Sound Settings</h3>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) => handleChange('soundEnabled', e.target.checked)}
            />
            Enable Sound
          </label>
        </div>
        <div className="setting-item">
          <label>Sound Volume: {settings.soundVolume}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.soundVolume}
            onChange={handleVolumeChange}
            disabled={!settings.soundEnabled}
          />
        </div>
        {settings.soundVolume === 0 && (
          <p className="setting-note">Sound is muted</p>
        )}
      </div>

      <div className="settings-section">
        <h3>Notification Settings</h3>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleChange('notifications', e.target.checked)}
            />
            Enable Notifications
          </label>
        </div>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.streakReminders}
              onChange={(e) => handleChange('streakReminders', e.target.checked)}
              disabled={!settings.notifications}
            />
            Streak Reminders
          </label>
          <p className="setting-description">
            Get reminders to maintain your daily streak (30 minutes playtime required)
          </p>
        </div>
      </div>

      <div className="settings-info">
        <h4>Current Settings:</h4>
        <ul>
          <li>Sound: {settings.soundEnabled ? 'Enabled' : 'Disabled'} ({settings.soundVolume}%)</li>
          <li>Notifications: {settings.notifications ? 'Enabled' : 'Disabled'}</li>
          <li>Streak Reminders: {settings.streakReminders ? 'Enabled' : 'Disabled'}</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;

