import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Auth/Login';
import StudentSignup from './components/Auth/StudentSignup';
import TeacherSignup from './components/Auth/TeacherSignup';
import StudentDashboard from './components/Student/StudentDashboard';
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup/student" element={<StudentSignup />} />
            <Route path="/signup/teacher" element={<TeacherSignup />} />
            <Route
              path="/student/*"
              element={
                <ProtectedRoute userType="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute userType="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

