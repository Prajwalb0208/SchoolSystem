const COMPUTER_SCIENCE_QUIZ_BANK = [
  {
    id: 'cs-1',
    question: `What is the time complexity of binary search on a sorted array?`,
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    correctAnswer: 1,
    explanation: 'Binary search halves the search space each step, yielding O(log n).',
  },
  {
    id: 'cs-2',
    question: `Which data structure uses FIFO (First In, First Out) ordering?`,
    options: ['Stack', 'Queue', 'Tree', 'Graph'],
    correctAnswer: 1,
    explanation: 'Queues remove items in the same order they were added.',
  },
  {
    id: 'cs-3',
    question: `What does HTML stand for?`,
    options: [
      'Hyper Trainer Marking Language',
      'Hyper Text Markup Language',
      'Hyper Text Marketing Language',
      'Hyperlinks and Text Markup Language',
    ],
    correctAnswer: 1,
    explanation: 'HTML is Hyper Text Markup Language.',
  },
  {
    id: 'cs-4',
    question: `Which sorting algorithm is a divide and conquer algorithm?`,
    options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
    correctAnswer: 2,
    explanation: 'Merge sort splits the array, sorts subarrays, and merges results.',
  },
  {
    id: 'cs-5',
    question: `In databases, what does SQL stand for?`,
    options: ['Structured Query Language', 'Simple Query Logic', 'Sequential Query Language', 'Standard Query Loop'],
    correctAnswer: 0,
    explanation: 'SQL stands for Structured Query Language.',
  },
  {
    id: 'cs-6',
    question: `Which HTTP status code indicates "Not Found"?`,
    options: ['200', '301', '404', '500'],
    correctAnswer: 2,
    explanation: '404 means the requested resource was not found.',
  },
  {
    id: 'cs-7',
    question: `Which keyword declares a constant in JavaScript (ES6)?`,
    options: ['var', 'let', 'const', 'static'],
    correctAnswer: 2,
    explanation: '`const` prevents reassignment.',
  },
  {
    id: 'cs-8',
    question: `Which of the following is NOT an OOP principle?`,
    options: ['Encapsulation', 'Polymorphism', 'Abstraction', 'Recursion'],
    correctAnswer: 3,
    explanation: 'Recursion is a programming technique, not an OOP principle.',
  },
  {
    id: 'cs-9',
    question: `In networking, what does TCP stand for?`,
    options: ['Transfer Control Protocol', 'Transmission Control Protocol', 'Transport Core Protocol', 'Transmission Core Procedure'],
    correctAnswer: 1,
    explanation: 'TCP is Transmission Control Protocol.',
  },
  {
    id: 'cs-10',
    question: `Which command lists files in a Unix directory?`,
    options: ['ls', 'cd', 'rm', 'pwd'],
    correctAnswer: 0,
    explanation: '`ls` lists directory contents.',
  },
  {
    id: 'cs-11',
    question: `What is the main purpose of CSS?`,
    options: ['Structuring data', 'Styling web pages', 'Handling database queries', 'Executing server logic'],
    correctAnswer: 1,
    explanation: 'CSS (Cascading Style Sheets) handles styling.',
  },
  {
    id: 'cs-12',
    question: `Which of these is a NoSQL database?`,
    options: ['MySQL', 'PostgreSQL', 'MongoDB', 'SQLite'],
    correctAnswer: 2,
    explanation: 'MongoDB stores JSON-like documents (NoSQL).',
  },
  {
    id: 'cs-13',
    question: `In Git, which command creates a new branch and switches to it?`,
    options: ['git switch', 'git checkout -b', 'git branch', 'git merge'],
    correctAnswer: 1,
    explanation: '`git checkout -b branchName` creates and checks out the branch.',
  },
  {
    id: 'cs-14',
    question: `Which operation on a stack removes the top element?`,
    options: ['push', 'enqueue', 'pop', 'shift'],
    correctAnswer: 2,
    explanation: 'Pop removes and returns the top of the stack.',
  },
  {
    id: 'cs-15',
    question: `What does JSON stand for?`,
    options: ['Java Syntax Object Notation', 'JavaScript Object Notation', 'Java Serialized Object Network', 'Java Source Open Notation'],
    correctAnswer: 1,
    explanation: 'JSON = JavaScript Object Notation.',
  },
  {
    id: 'cs-16',
    question: `Which design pattern ensures only one instance of a class exists?`,
    options: ['Observer', 'Singleton', 'Factory', 'Decorator'],
    correctAnswer: 1,
    explanation: 'Singleton restricts instantiation to a single object.',
  },
  {
    id: 'cs-17',
    question: `Which protocol secures HTTP traffic?`,
    options: ['FTP', 'SSH', 'HTTPS', 'SMTP'],
    correctAnswer: 2,
    explanation: 'HTTPS = HTTP over TLS/SSL.',
  },
  {
    id: 'cs-18',
    question: `What is the output of 5 % 2 in most languages?`,
    options: ['0', '1', '2', '2.5'],
    correctAnswer: 1,
    explanation: 'Modulo returns remainder; 5 divided by 2 leaves remainder 1.',
  },
  {
    id: 'cs-19',
    question: `Which HTML element is used for the largest heading?`,
    options: ['<heading>', '<h1>', '<header>', '<title>'],
    correctAnswer: 1,
    explanation: '`<h1>` is the largest heading level.',
  },
  {
    id: 'cs-20',
    question: `In OS concepts, what is a deadlock?`,
    options: [
      'Processes waiting for each other indefinitely',
      'A process running too fast',
      'A memory leak',
      'A thread priority inversion'
    ],
    correctAnswer: 0,
    explanation: 'Deadlock occurs when processes wait on resources held by each other.',
  },
];

export default COMPUTER_SCIENCE_QUIZ_BANK;




