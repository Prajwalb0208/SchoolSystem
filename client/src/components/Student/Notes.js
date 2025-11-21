import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Notes.css';

const Notes = () => {
  const { API_URL } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/notes`);
      setNotes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setLoading(false);
    }
  };

  const handleDownload = async (language) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/notes/${language}`, {
        responseType: 'blob',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${language}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading notes:', error);
      if (error.response?.status === 404) {
        alert('Notes file not found. Please contact administrator.');
      } else {
        alert('Error downloading notes. Please try again.');
      }
    }
  };

  if (loading) return <div className="spinner"></div>;

  const languages = [
    { name: 'C', icon: '📘', color: '#00599c' },
    { name: 'C++', icon: '📗', color: '#00599c' },
    { name: 'Java', icon: '☕', color: '#ed8b00' },
    { name: 'Python', icon: '🐍', color: '#3776ab' }
  ];

  return (
    <div className="notes-container">
      <h1>Programming Language Notes</h1>
      <p className="notes-description">
        Access and download one-page concept notes for each programming language.
        All notes are in PDF format and cover intermediate key concepts.
      </p>
      
      {notes.length === 0 ? (
        <div className="no-notes-message">
          <p>Notes are being loaded. Please wait...</p>
        </div>
      ) : (
        <div className="notes-grid">
          {languages.map((lang) => {
            const note = notes.find(n => n.language === lang.name);
            const noteExists = note !== undefined;
            return (
              <div key={lang.name} className="note-card" style={{ borderColor: lang.color }}>
                <div className="note-icon" style={{ color: lang.color }}>
                  {lang.icon}
                </div>
                <h3>{lang.name}</h3>
                <p>One-page PDF covering intermediate key concepts</p>
                {noteExists ? (
                  <>
                    <button
                      onClick={() => handleDownload(lang.name)}
                      className="btn btn-primary"
                      style={{ background: lang.color }}
                    >
                      Download PDF
                    </button>
                    <a
                      href={`${API_URL}${note.downloadUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-link"
                      style={{ color: lang.color }}
                    >
                      View Online →
                    </a>
                  </>
                ) : (
                  <div className="note-unavailable">
                    <p>Note not available</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notes;

