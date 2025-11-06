# System Architecture Diagram

## Overall System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend<br/>Port: 3000]
        A1[Student Components]
        A2[Teacher Components]
        A3[Auth Components]
        A4[Game Components]
        A --> A1
        A --> A2
        A --> A3
        A --> A4
    end
    
    subgraph "API Gateway Layer"
        B[Express.js Server<br/>Port: 5000]
        B1[Auth Middleware]
        B2[Role Middleware]
        B3[Error Handler]
        B --> B1
        B --> B2
        B --> B3
    end
    
    subgraph "Business Logic Layer"
        C[Route Handlers]
        C1[/api/auth]
        C2[/api/students]
        C3[/api/teachers]
        C4[/api/games]
        C5[/api/assignments]
        C6[/api/progress]
        C7[/api/notes]
        C --> C1
        C --> C2
        C --> C3
        C --> C4
        C --> C5
        C --> C6
        C --> C7
    end
    
    subgraph "Data Access Layer"
        D[Mongoose ODM]
        D1[Student Model]
        D2[Teacher Model]
        D3[Assignment Model]
        D4[Question Model]
        D5[GameSession Model]
        D6[Leaderboard Model]
        D --> D1
        D --> D2
        D --> D3
        D --> D4
        D --> D5
        D --> D6
    end
    
    subgraph "Data Storage Layer"
        E[(MongoDB Database)]
        E1[(students)]
        E2[(teachers)]
        E3[(assignments)]
        E4[(questions)]
        E5[(gamesessions)]
        E6[(leaderboards)]
        E --> E1
        E --> E2
        E --> E3
        E --> E4
        E --> E5
        E --> E6
    end
    
    subgraph "Real-time Communication"
        F[Socket.io Server]
        F1[Notification Service]
        F2[Leaderboard Updates]
        F --> F1
        F --> F2
    end
    
    subgraph "File Storage"
        G[File System]
        G1[Profile Pictures<br/>/uploads/profiles]
        G2[PDF Notes<br/>/notes]
        G --> G1
        G --> G2
    end
    
    subgraph "External Services"
        H[JWT Service]
        I[bcrypt Service]
        J[Multer Upload]
        H --> B1
        I --> C1
        J --> C2
        J --> C3
    end
    
    A -->|HTTP/HTTPS| B
    A -->|WebSocket| F
    B --> C
    C --> D
    D --> E
    C --> F
    C --> G
    C --> H
    C --> I
    C --> J
    F --> A
    
    style A fill:#e1f5ff
    style B fill:#fff5e1
    style C fill:#e1ffe1
    style D fill:#ffe1f5
    style E fill:#f5e1ff
    style F fill:#ffffe1
    style G fill:#e1ffff
```

## Component Architecture

```mermaid
graph TB
    subgraph "Frontend Architecture"
        subgraph "React App"
            A[App.js]
            A --> B[AuthContext]
            A --> C[Routes]
        end
        
        subgraph "Student Module"
            C --> D[StudentDashboard]
            D --> D1[GameLevels]
            D --> D2[Assignments]
            D --> D3[Notes]
            D --> D4[Profile]
            D --> D5[Settings]
            D --> D6[Leaderboard]
            D1 --> D1A[EasyGame]
            D1 --> D1B[IntermediateGame]
            D1 --> D1C[HardGame]
        end
        
        subgraph "Teacher Module"
            C --> E[TeacherDashboard]
            E --> E1[ProgressTracking]
            E --> E2[Assignments]
            E --> E3[CreateAssignment]
            E --> E4[EditAssignment]
            E --> E5[Profile]
            E --> E6[Settings]
        end
        
        subgraph "Shared Components"
            C --> F[GameSelection]
            C --> G[QuizPopup]
            C --> H[GameControls]
            F --> F1[SnakeGame]
            F --> F2[BlockRush]
            F --> F3[SudokuGame]
            F --> F4[Other Games...]
        end
        
        subgraph "Auth Module"
            C --> I[Login]
            C --> J[StudentSignup]
            C --> K[TeacherSignup]
            C --> L[ProtectedRoute]
        end
    end
    
    subgraph "Backend Architecture"
        subgraph "Server Entry"
            M[server.js]
            M --> N[Express App]
            M --> O[Socket.io]
        end
        
        subgraph "Middleware"
            N --> P[auth.js]
            P --> P1[JWT Verification]
            P --> P2[Role Check]
        end
        
        subgraph "Routes"
            N --> Q[auth.js]
            N --> R[students.js]
            N --> S[teachers.js]
            N --> T[games.js]
            N --> U[assignments.js]
            N --> V[progress.js]
            N --> W[notes.js]
        end
        
        subgraph "Models"
            Q --> X[Student Model]
            Q --> Y[Teacher Model]
            R --> X
            S --> Y
            T --> Z[Question Model]
            T --> AA[GameSession Model]
            T --> AB[Leaderboard Model]
            U --> AC[Assignment Model]
            V --> X
            V --> AA
        end
        
        subgraph "Socket Handlers"
            O --> AD[socketHandler.js]
            AD --> AE[Notification Events]
            AD --> AF[Leaderboard Events]
        end
    end
    
    style A fill:#e1f5ff
    style M fill:#fff5e1
    style D fill:#e1ffe1
    style E fill:#ffe1f5
```

## Database Schema Architecture

```mermaid
erDiagram
    STUDENT ||--o{ GAME_SESSION : has
    STUDENT ||--o{ ASSIGNMENT_SUBMISSION : submits
    TEACHER ||--o{ ASSIGNMENT : creates
    ASSIGNMENT ||--o{ ASSIGNMENT_SUBMISSION : contains
    QUESTION ||--o{ GAME_SESSION : used_in
    STUDENT ||--o{ LEADERBOARD : appears_in
    
    STUDENT {
        ObjectId _id PK
        string username UK
        string email UK
        string password
        string name
        string phone
        string usn UK
        date dob
        array batches
        string profilePicture
        number streakLevel
        number totalBadges
        number easyLevelCompleted
        number intermediateLevelCompleted
        number hardLevelCompleted
        number wins
        date createdAt
        date updatedAt
    }
    
    TEACHER {
        ObjectId _id PK
        string username UK
        string email UK
        string password
        string phone
        string profilePicture
        date createdAt
        date updatedAt
    }
    
    ASSIGNMENT {
        ObjectId _id PK
        string title
        string description
        array questions
        ObjectId createdBy FK
        date dueDate
        array submissions
        date createdAt
        date updatedAt
    }
    
    ASSIGNMENT_SUBMISSION {
        ObjectId studentId FK
        array answers
        date submittedAt
        string status
    }
    
    QUESTION {
        ObjectId _id PK
        string difficulty
        number level
        string type
        string question
        array options
        string correctAnswer
        string language
        string codeBlocks
    }
    
    GAME_SESSION {
        ObjectId _id PK
        ObjectId studentId FK
        string difficulty
        number level
        ObjectId questionId FK
        boolean answered
        boolean correct
        number timeTaken
        date createdAt
    }
    
    LEADERBOARD {
        ObjectId _id PK
        string difficulty
        number level
        ObjectId studentId FK
        number score
        number timeTaken
        date createdAt
    }
```

## Request Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client (React)
    participant R as Router
    participant M as Middleware
    participant H as Handler
    participant D as Database
    participant S as Socket.io
    
    U->>C: User Action
    C->>C: Prepare Request<br/>(Add Token if Auth)
    C->>R: HTTP Request
    
    R->>M: Route to Middleware
    alt Requires Auth
        M->>M: Verify JWT Token
        alt Token Invalid
            M-->>C: 401 Unauthorized
            C->>U: Show Error/Redirect Login
        else Token Valid
            M->>H: Proceed to Handler
        end
    else Public Route
        M->>H: Proceed to Handler
    end
    
    H->>H: Validate Request Data
    alt Validation Failed
        H-->>C: 400 Bad Request
        C->>U: Show Validation Error
    else Validation Passed
        H->>D: Database Operation
        D-->>H: Data Result
        
        alt Requires Real-time Update
            H->>S: Emit Event
            S->>C: Broadcast to Clients
            C->>U: Update UI
        end
        
        H-->>C: Success Response
        C->>C: Update State
        C->>U: Update UI
    end
```

## Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        A[React App]
        A1[Token Storage<br/>localStorage]
        A2[Protected Routes]
        A3[Input Validation]
        A --> A1
        A --> A2
        A --> A3
    end
    
    subgraph "Network Security"
        B[HTTPS/WSS]
        B1[CORS Configuration]
        B2[Request Headers]
        B --> B1
        B --> B2
    end
    
    subgraph "Authentication Security"
        C[JWT Tokens]
        C1[Token Expiration]
        C2[Secret Key]
        C3[Token Refresh]
        C --> C1
        C --> C2
        C --> C3
    end
    
    subgraph "Authorization Security"
        D[Role-Based Access]
        D1[Student Routes]
        D2[Teacher Routes]
        D3[Public Routes]
        D --> D1
        D --> D2
        D --> D3
    end
    
    subgraph "Data Security"
        E[Password Hashing]
        E1[bcrypt]
        E2[Salt Rounds]
        E --> E1
        E --> E2
        
        F[Input Sanitization]
        F1[express-validator]
        F2[SQL Injection Prevention]
        F --> F1
        F --> F2
        
        G[File Upload Security]
        G1[Multer Validation]
        G2[File Type Check]
        G3[Size Limits]
        G --> G1
        G --> G2
        G --> G3
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    
    style A fill:#e1f5ff
    style C fill:#fff5e1
    style D fill:#e1ffe1
    style E fill:#ffe1f5
```

