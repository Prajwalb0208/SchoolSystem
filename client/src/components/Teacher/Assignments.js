import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import AssignmentList from './AssignmentList';
import CreateAssignment from './CreateAssignment';
import EditAssignment from './EditAssignment';
import './Assignments.css';

const Assignments = () => {
  return (
    <div className="teacher-assignments">
      <Routes>
        <Route path="/" element={<AssignmentList />} />
        <Route path="/create" element={<CreateAssignment />} />
        <Route path="/edit/:id" element={<EditAssignment />} />
      </Routes>
    </div>
  );
};

export default Assignments;

