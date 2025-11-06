# Teacher Flowchart - Simple Guide

## What is a Flowchart?
A flowchart shows step-by-step what happens when a teacher uses the system. Think of it like a map showing the path from start to finish.

## Teacher Journey - Simple Version

```mermaid
flowchart TD
    Start([Teacher Opens Website]) --> LoginPage[Login Page]
    LoginPage --> Choice{New Teacher or<br/>Existing Teacher?}
    
    Choice -->|New Teacher| Signup[Create Account<br/>Enter: Name, Email,<br/>Password, Phone]
    Choice -->|Existing Teacher| Login[Enter Username<br/>and Password]
    
    Signup --> CreateAccount[Account Created]
    Login --> CheckPassword{Password<br/>Correct?}
    CheckPassword -->|No| LoginError[Show Error] --> Login
    CheckPassword -->|Yes| Dashboard[Teacher Dashboard]
    CreateAccount --> Dashboard
    
    Dashboard --> WhatToDo{What do you<br/>want to do?}
    
    WhatToDo -->|View Overview| Overview[See System Information<br/>How Students Use It]
    WhatToDo -->|Check Student Progress| TrackProgress[Search Student by USN]
    WhatToDo -->|Manage Assignments| ManageAssignments[Create/Edit/Delete<br/>Assignments]
    WhatToDo -->|Update Profile| UpdateProfile[Change Profile Picture<br/>Update Information]
    
    Overview --> Dashboard
    UpdateProfile --> Dashboard
    
    TrackProgress --> EnterUSN[Enter Student USN<br/>University Serial Number]
    EnterUSN --> Search{Student<br/>Found?}
    Search -->|No| NotFound[Show Error<br/>Student Not Found] --> EnterUSN
    Search -->|Yes| ShowReport[Show Student Report<br/>- Levels Completed<br/>- Badges Earned<br/>- Streak Level<br/>- Assignment Submissions<br/>- Game Statistics]
    ShowReport --> TrackProgress
    
    ManageAssignments --> Action{What Action?}
    Action -->|Create New| CreateAssignment[Create Assignment]
    Action -->|Edit Existing| EditAssignment[Edit Assignment]
    Action -->|Delete| DeleteAssignment[Delete Assignment]
    Action -->|View All| ViewAll[View All Assignments<br/>See Submissions]
    
    ViewAll --> ManageAssignments
    
    CreateAssignment --> FillForm[Fill Form<br/>- Title<br/>- Description<br/>- Add Questions<br/>- Set Due Date]
    FillForm --> Validate{All Fields<br/>Filled?}
    Validate -->|No| ShowError[Show Error] --> FillForm
    Validate -->|Yes| Save[Save Assignment]
    Save --> Notify[Notify All Students<br/>They See New Assignment]
    Notify --> Success[Assignment Created!]
    Success --> ManageAssignments
    
    EditAssignment --> Select[Select Assignment to Edit]
    Select --> Load[Load Assignment Details]
    Load --> Edit[Make Changes]
    Edit --> Validate2{Changes<br/>Valid?}
    Validate2 -->|No| ShowError2[Show Error] --> Edit
    Validate2 -->|Yes| Update[Update Assignment]
    Update --> Notify2[Notify Students<br/>of Changes]
    Notify2 --> Success2[Assignment Updated!]
    Success2 --> ManageAssignments
    
    DeleteAssignment --> Select2[Select Assignment to Delete]
    Select2 --> Confirm{Are You Sure?}
    Confirm -->|No| ManageAssignments
    Confirm -->|Yes| Delete[Delete Assignment]
    Delete --> Success3[Assignment Deleted!]
    Success3 --> ManageAssignments
    
    End([Logout])
```

## How Assignments Work - Simple Explanation

**Step 1:** Teacher clicks "Create Assignment"

**Step 2:** Teacher fills in:
- Title (e.g., "Week 1 Quiz")
- Description (what students need to do)
- Questions (add multiple questions with options)
- Due Date (when students must submit)

**Step 3:** Teacher saves the assignment

**Step 4:** All students automatically get notified about the new assignment

**Step 5:** Students can view and submit the assignment

**Step 6:** Teacher can see all student submissions

## Tracking Student Progress - Simple Explanation

**Step 1:** Teacher enters student's USN (University Serial Number)

**Step 2:** System searches for the student

**Step 3:** If found, teacher sees:
- How many levels completed (Easy, Medium, Hard)
- How many badges earned
- Current streak level
- Assignment submissions
- Overall game statistics

**Step 4:** Teacher can use this information to help the student improve

## Key Points for Teachers

1. **Login:** Use your username and password
2. **Create Assignments:** Add questions, set due dates, notify students
3. **Track Progress:** Search by USN to see how each student is doing
4. **Edit/Delete:** Can modify or remove assignments you created
5. **Notifications:** Students automatically get notified when you create or update assignments
