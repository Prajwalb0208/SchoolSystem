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
      const response = await axios.get(`${API_URL}/teachers/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfile(response.data);
      setFormData({
        email: response.data.email,
        phone: response.data.phone
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${API_URL}/teachers/profile`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setProfile(response.data.teacher);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/teachers/profile`,
        formData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setProfile(response.data.teacher);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

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
                  <img src={`${process.env.REACT_APP_BASE_URL || 'https://schoolsystem-lyl7.onrender.com'}${profile.profilePicture}`} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">{profile.username?.[0]?.toUpperCase()}</div>
                )}
              </div>
              <h3>{profile.username}</h3>
            </div>

            {!editing ? (
              <div className="profile-info">
                <div className="info-item">
                  <label>Username:</label>
                  <span>{profile.username}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{profile.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{profile.phone}</span>
                </div>
                <button onClick={() => setEditing(true)} className="btn btn-primary">
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="profile-edit-form">
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
                  <label>Profile Picture (Upload from Gallery)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
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

