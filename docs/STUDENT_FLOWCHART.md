# Student Flowchart - Simple Guide

## What is a Flowchart?
A flowchart shows step-by-step what happens when a student uses the system. Think of it like a map showing the path from start to finish.

## Student Journey - Simple Version

```mermaid
flowchart TD
    Start([Student Opens Website]) --> LoginPage[Login Page]
    LoginPage --> Choice{New Student or<br/>Existing Student?}
    
    Choice -->|New Student| Signup[Create Account<br/>Enter: Name, Email,<br/>Password, USN]
    Choice -->|Existing Student| Login[Enter Username<br/>and Password]
    
    Signup --> CreateAccount[Account Created]
    Login --> CheckPassword{Password<br/>Correct?}
    CheckPassword -->|No| LoginError[Show Error] --> Login
    CheckPassword -->|Yes| Dashboard[Student Dashboard]
    CreateAccount --> Dashboard
    
    Dashboard --> WhatToDo{What do you<br/>want to do?}
    
    WhatToDo -->|View Progress| ViewStats[See Your Stats<br/>- Days Streak<br/>- Badges Earned<br/>- Levels Completed]
    WhatToDo -->|Play Games| SelectGame[Select Game Level]
    WhatToDo -->|View Assignments| ViewAssignments[See Teacher Assignments]
    WhatToDo -->|Download Notes| DownloadNotes[Get PDF Notes]
    WhatToDo -->|Update Profile| UpdateProfile[Change Profile Picture<br/>Update Information]
    
    ViewStats --> Dashboard
    ViewAssignments --> Dashboard
    DownloadNotes --> Dashboard
    UpdateProfile --> Dashboard
    
    SelectGame --> GameType{Which Level?}
    GameType -->|Easy| EasyGame[Easy Game<br/>50 Levels<br/>Multiple Choice Questions]
    GameType -->|Medium| MediumGame[Medium Game<br/>100 Levels<br/>Arrange Code Blocks]
    GameType -->|Hard| HardGame[Hard Game<br/>50 Levels<br/>Write Full Code]
    
    EasyGame --> PlayEasy[Play for 5 Minutes]
    PlayEasy --> QuizAppears[Quiz Appears<br/>5 Questions]
    QuizAppears --> AnswerQuiz{Answer Questions<br/>Need 3 Correct?}
    AnswerQuiz -->|Yes, 3+ Correct| PassLevel[Level Passed!<br/>Move to Next Level]
    AnswerQuiz -->|No, Less than 3| RetryLevel[Try Again]
    
    MediumGame --> PlayMedium[Play for 5 Minutes]
    PlayMedium --> QuizAppears2[Quiz Appears<br/>Arrange Code Blocks]
    QuizAppears2 --> ArrangeCode{Arrange Correctly<br/>in 45 seconds?}
    ArrangeCode -->|Yes| GetBadge[Earn Gold Badge!]
    ArrangeCode -->|No| PassLevel2[Level Passed<br/>No Badge]
    
    HardGame --> SpinWheel[Spin Wheel<br/>Pick Language]
    SpinWheel --> WriteCode[Write Code<br/>15-20 Lines]
    WriteCode --> SubmitCode[Submit Code]
    SubmitCode --> CheckRank{Are you in<br/>First 5 to Complete?}
    CheckRank -->|Yes| PassHard[Level Passed!]
    CheckRank -->|No| RetryHard[Try Again<br/>Others Finished First]
    
    PassLevel --> UpdateProgress[Update Your Progress<br/>Update Leaderboard]
    PassLevel2 --> UpdateProgress
    GetBadge --> UpdateProgress
    PassHard --> UpdateProgress
    
    UpdateProgress --> CheckStreak{Played 30 minutes<br/>today?}
    CheckStreak -->|Yes| UpdateStreak[Streak Updated!<br/>Keep it going!]
    CheckStreak -->|No| BackToGames[Back to Games]
    UpdateStreak --> BackToGames
    RetryLevel --> PlayEasy
    RetryHard --> HardGame
    
    End([Logout])
    BackToGames --> End
```

## How Games Work - Simple Explanation

**Step 1:** Student selects a game level (Easy, Medium, or Hard)

**Step 2:** Student plays a fun game for 5 minutes

**Step 3:** After 5 minutes, a quiz appears automatically

**Step 4:** Student answers 5 questions

**Step 5:** 
- If student gets 3 or more correct → Pass! Can continue playing
- If student gets less than 3 correct → Must try again

**Step 6:** Progress is saved, leaderboard updates, and streak is maintained if student played 30 minutes today

## Easy Level
- **What:** Multiple choice questions (pick the right answer)
- **How many:** 50 levels
- **Example:** "What does this code do?" with 4 options

## Medium Level  
- **What:** Arrange code blocks in correct order
- **How many:** 100 levels
- **Special:** Get gold badge if you answer 5 questions correctly in under 45 seconds each

## Hard Level
- **What:** Write complete code (15-20 lines)
- **How many:** 50 levels
- **Special:** Only first 5 students to complete correctly can pass. Others must try again.

## Assignments - Simple Flow

```mermaid
flowchart TD
    Start([View Assignments]) --> SeeList[See List of Assignments<br/>from Teachers]
    SeeList --> Select{Click on<br/>Assignment?}
    Select -->|Yes| ViewDetails[See Assignment Details<br/>- Title<br/>- Questions<br/>- Due Date]
    Select -->|No| End([Done])
    
    ViewDetails --> Check{Already<br/>Submitted?}
    Check -->|Yes| ViewOld[See Your Submission]
    Check -->|No| StartNow[Start Assignment]
    
    StartNow --> Answer[Answer All Questions]
    Answer --> Submit{Ready to<br/>Submit?}
    Submit -->|No| Answer
    Submit -->|Yes| Send[Submit Assignment]
    Send --> Saved[Assignment Saved!<br/>Teacher Can See It]
    Saved --> SeeList
    ViewOld --> SeeList
```

## Key Points for Students

1. **Login:** Use your username and password
2. **Games:** Play for 5 minutes, then answer quiz questions
3. **Progress:** System tracks your levels, badges, and streaks
4. **Streak:** Play 30 minutes daily to keep your streak going
5. **Assignments:** View and submit assignments from teachers
6. **Notes:** Download PDF notes for C, C++, Java, Python
