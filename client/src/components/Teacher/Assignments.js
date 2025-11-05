import React from 'react';
import { Routes, Route } from 'react-router-dom';
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

