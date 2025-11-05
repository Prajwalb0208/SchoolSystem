import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, API_URL } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/students/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        batches: response.data.batches?.join(', ') || '',
        profilePicture: response.data.profilePicture || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarSelect = (avatar) => {
    setFormData({
      ...formData,
      profilePicture: avatar
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${API_URL}/students/profile`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setProfile(response.data.student);
        setFormData({
          ...formData,
          profilePicture: response.data.student.profilePicture
        });
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const submitData = {
        ...formData,
        batches: formData.batches.split(',').map(b => b.trim()).filter(b => b)
      };
      
      const response = await axios.put(
        `${API_URL}/students/profile`,
        submitData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setProfile(response.data.student);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const avatars = ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png', 'avatar6.png'];

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>My Profile</h2>
        
        {profile && (
          <>
            <div className="profile-header">
              <div className="profile-picture">
                {profile.profilePicture ? (
                  <img src={`${process.env.REACT_APP_BASE_URL || 'http://localhost:5000'}${profile.profilePicture}`} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">{profile.name?.[0]?.toUpperCase()}</div>
                )}
              </div>
              <h3>{profile.name}</h3>
              <p>{profile.usn}</p>
            </div>

            {!editing ? (
              <div className="profile-info">
                <div className="info-item">
                  <label>Email:</label>
                  <span>{profile.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{profile.phone}</span>
                </div>
                <div className="info-item">
                  <label>DOB:</label>
                  <span>{new Date(profile.dob).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <label>Batches:</label>
                  <span>{profile.batches?.join(', ') || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Streak Level:</label>
                  <span>{profile.streakLevel || 0} days</span>
                </div>
                <div className="info-item">
                  <label>Total Badges:</label>
                  <span>{profile.totalBadges || 0}</span>
                </div>
                {profile.badges?.length > 0 && (
                  <div className="info-item">
                    <label>Badges:</label>
                    <div className="badges-list">
                      {profile.badges.map((badge, idx) => (
                        <span key={idx} className={`badge badge-${badge.type}`}>
                          {badge.type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => setEditing(true)} className="btn btn-primary">
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="profile-edit-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
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
                    <input type="file" accept="image/*" onChange={handleFileUpload} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;

