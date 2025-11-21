import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { API_URL } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get(`${API_URL}/teachers/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data) {
        setProfile(response.data);
        setFormData({
          email: response.data.email || '',
          phone: response.data.phone || ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
      }
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
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      const uploadFormData = new FormData();
      uploadFormData.append('profilePicture', file);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${API_URL}/teachers/profile`,
          uploadFormData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setProfile(response.data.teacher);
        alert('Profile picture updated successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(error.response?.data?.message || 'Error uploading image. Please try again.');
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
      setFormData({
        email: response.data.teacher.email,
        phone: response.data.teacher.phone
      });
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Error updating profile. Please try again.');
    }
  };

  if (loading) return <div className="spinner"></div>;

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>My Profile</h2>
          <div className="error-message">
            <p>Unable to load profile. Please try again later.</p>
            <button onClick={fetchProfile} className="btn btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>My Profile</h2>
        
        <div className="profile-header">
          <div className="profile-picture">
            {profile.profilePicture ? (
              <img 
                src={`${API_URL.replace('/api', '')}${profile.profilePicture}`} 
                alt="Profile"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.parentElement.querySelector('.avatar-placeholder');
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
            ) : (
              <div className="avatar-placeholder">
                {profile.username?.[0]?.toUpperCase() || 'T'}
              </div>
            )}
          </div>
          <h3>{profile.username || 'Teacher'}</h3>
        </div>

        {!editing ? (
          <div className="profile-info">
            <div className="info-item">
              <label>Username:</label>
              <span>{profile.username || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{profile.email || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Phone:</label>
              <span>{profile.phone || 'N/A'}</span>
            </div>
            {profile.createdAt && (
              <div className="info-item">
                <label>Member Since:</label>
                <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            )}
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
                value={formData.email || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
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
      </div>
    </div>
  );
};

export default Profile;

