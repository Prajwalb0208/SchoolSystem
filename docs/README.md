# System Documentation

This directory contains comprehensive documentation for the Coding Habit Builder School System, including flowcharts, data flow diagrams, and system architecture.

## Documentation Files

### 1. Student Flowchart (`STUDENT_FLOWCHART.md`)
Contains detailed flowcharts for student workflows:
- **Main Flowchart**: Complete student journey from authentication to game completion
- **Game Flowchart**: Detailed game session flow with quiz mechanics
- **Assignment Flowchart**: Student assignment viewing and submission process

### 2. Teacher Flowchart (`TEACHER_FLOWCHART.md`)
Contains detailed flowcharts for teacher workflows:
- **Main Flowchart**: Complete teacher journey from authentication to student progress tracking
- **Assignment Management Flowchart**: CRUD operations for assignments
- **Student Progress Tracking Flowchart**: How teachers search and view student progress

### 3. Data Flow Diagrams (`DATA_FLOW_DIAGRAMS.md`)
Contains data flow visualizations:
- **Student Data Flow Diagram**: Shows data flow between student client and backend systems
- **Teacher Data Flow Diagram**: Shows data flow between teacher client and backend systems
- **Authentication Data Flow**: Sequence diagram for authentication process
- **Game Session Data Flow**: Sequence diagram for game session interactions
- **Assignment Data Flow**: Sequence diagram for assignment creation and submission

### 4. System Architecture (`SYSTEM_ARCHITECTURE.md`)
Contains system architecture documentation:
- **Overall System Architecture**: High-level view of all system components
- **Component Architecture**: Detailed frontend and backend component structure
- **Database Schema Architecture**: Entity-relationship diagram of database models
- **Request Flow Architecture**: Sequence diagram showing request processing
- **Security Architecture**: Security layers and mechanisms

## System Overview

### Student Features
- Authentication (Signup/Login)
- Game Levels (Easy, Intermediate, Hard)
- Assignment Viewing and Submission
- Notes Download (PDF)
- Profile Management
- Settings Configuration
- Leaderboard Viewing
- Streak Tracking
- Badge System

### Teacher Features
- Authentication (Signup/Login)
- Assignment Management (Create, Read, Update, Delete)
- Student Progress Tracking
- Profile Management
- Settings Configuration
- Real-time Notifications

## Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer

## How to View Diagrams

These diagrams are written in Mermaid syntax. To view them:

1. **GitHub/GitLab**: Mermaid diagrams render automatically in markdown files
2. **VS Code**: Install the "Markdown Preview Mermaid Support" extension
3. **Online**: Copy the mermaid code to [Mermaid Live Editor](https://mermaid.live)
4. **Documentation Tools**: Tools like MkDocs, Docusaurus, or GitBook support Mermaid

## Diagram Types Used

- **Flowcharts**: Process flows and decision trees
- **Sequence Diagrams**: Time-ordered interactions between components
- **Entity-Relationship Diagrams**: Database schema relationships
- **Component Diagrams**: System architecture and component structure

## Key System Flows

### Student Game Flow
1. Student logs in
2. Selects game difficulty (Easy/Intermediate/Hard)
3. Plays game for 5 minutes
4. Quiz appears with questions
5. Answers questions (need 3/5 correct to continue)
6. Progress updates, leaderboard updates
7. Streak maintained if 30 minutes daily playtime

### Teacher Assignment Flow
1. Teacher logs in
2. Creates assignment with questions
3. System notifies all students via Socket.io
4. Students view and submit assignments
5. Teacher tracks student progress by USN
6. View detailed progress reports

## Notes

- All diagrams use standard flowchart and UML notation
- Colors are used to distinguish different system layers
- Arrows indicate data flow direction
- Decision points use diamond shapes
- Processes use rectangular shapes
- Start/End points use rounded rectangles

## Updates

When updating the system, please update the relevant diagrams to maintain documentation accuracy.

