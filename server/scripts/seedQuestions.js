const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

const questions = [];

// Easy Level Questions (50 MCQ questions) - REAL QUESTIONS
const easyQuestionsData = [
  { q: `What is the output of this C code?\n\nint main() {\n    int x = 5;\n    printf("%d", x++);\n    return 0;\n}`, opts: ['5', '6', 'Compilation error', 'Runtime error'], ans: 0, exp: 'x++ is post-increment, so it prints 5 first, then increments x to 6.' },
  { q: `What does this Python code output?\n\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)`, opts: ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Error'], ans: 1, exp: 'y and x reference the same list object, so modifying y also modifies x.' },
  { q: `In C++, what is the size of an int on a 64-bit system typically?`, opts: ['2 bytes', '4 bytes', '8 bytes', 'Depends on compiler'], ans: 1, exp: 'On most systems, int is 4 bytes (32 bits), regardless of whether the system is 32-bit or 64-bit.' },
  { q: `What is the output?\n\nString str = "Hello";\nSystem.out.println(str.length());`, opts: ['4', '5', '6', 'Compilation error'], ans: 1, exp: 'The length() method returns the number of characters. "Hello" has 5 characters.' },
  { q: `What will this code print?\n\ndef func(x):\n    x = x * 2\n    return x\n\na = 5\nfunc(a)\nprint(a)`, opts: ['5', '10', 'Error', 'None'], ans: 0, exp: 'Integers are immutable in Python. The function creates a new value but does not modify the original variable.' },
  { q: `What is the output of this code?\n\nint arr[] = {1, 2, 3};\nprintf("%d", arr[3]);`, opts: ['3', '0', 'Garbage value', 'Compilation error'], ans: 2, exp: 'Array index 3 is out of bounds (valid indices are 0, 1, 2). This will access garbage memory.' },
  { q: `What does this print?\n\nfor i in range(3):\n    print(i, end=" ")\nprint(i)`, opts: ['0 1 2 3', '0 1 2 2', '0 1 2', 'Error'], ans: 1, exp: 'The loop variable i persists after the loop ends, so the last print(i) prints 2.' },
  { q: `In Java, what is the default value of a boolean variable?`, opts: ['true', 'false', 'null', 'undefined'], ans: 1, exp: 'In Java, the default value for boolean primitive type is false.' },
  { q: `What is the result?\n\nint x = 10;\nint y = x > 5 ? 20 : 30;\nprintf("%d", y);`, opts: ['10', '20', '30', 'Syntax error'], ans: 1, exp: 'This is a ternary operator. Since x (10) > 5 is true, y gets the value 20.' },
  { q: `What does this code output?\n\nlist = [1, 2, 3]\nresult = list * 2\nprint(result)`, opts: ['[2, 4, 6]', '[1, 2, 3, 1, 2, 3]', '[1, 2, 3, 2]', 'Error'], ans: 1, exp: 'Multiplying a list by an integer repeats the list that many times.' },
  { q: `What is the output?\n\nint a = 5, b = 3;\nprintf("%d", a / b);`, opts: ['1', '1.67', '2', 'Compilation error'], ans: 0, exp: 'Integer division in C truncates the decimal part. 5/3 = 1.' },
  { q: `What does this Python code print?\n\nx = "hello"\nprint(x.upper())`, opts: ['hello', 'HELLO', 'Hello', 'Error'], ans: 1, exp: 'upper() converts all characters to uppercase.' },
  { q: `What is sizeof(char) in C?`, opts: ['1 byte', '2 bytes', '4 bytes', 'Depends on system'], ans: 0, exp: 'char is always 1 byte in C, regardless of system.' },
  { q: `What does this Java code output?\n\nint x = 5;\nSystem.out.println(x++ + ++x);`, opts: ['10', '11', '12', '13'], ans: 2, exp: 'x++ returns 5 (then x=6), ++x returns 7 (x=7), so 5+7=12.' },
  { q: `What is the output?\n\nx = True\ny = False\nprint(x and y)`, opts: ['True', 'False', 'Error', 'None'], ans: 1, exp: 'and operator returns False if any operand is False.' },
  { q: `In C++, what does the keyword "virtual" do?`, opts: ['Makes function inline', 'Enables polymorphism', 'Declares variable', 'Makes function static'], ans: 1, exp: 'virtual enables runtime polymorphism through function overriding.' },
  { q: `What does len([1, 2, [3, 4]]) return in Python?`, opts: ['3', '4', '5', 'Error'], ans: 0, exp: 'len() counts top-level elements. The list has 3 elements: 1, 2, and [3,4].' },
  { q: `What is the output?\n\nint x = 0;\nwhile(x < 3) {\n    printf("%d", x);\n    x++;\n}`, opts: ['012', '123', '0123', 'Infinite loop'], ans: 0, exp: 'Loop prints 0, 1, 2 (when x=3, condition fails).' },
  { q: `What does this print?\n\ns = "Python"\nprint(s[1:4])`, opts: ['Pyt', 'yth', 'ytho', 'thon'], ans: 1, exp: 'Slicing [1:4] gets characters from index 1 to 3 (not including 4).' },
  { q: `In Java, what is String a = new String("hello")?`, opts: ['Primitive type', 'Object reference', 'Array', 'Integer'], ans: 1, exp: 'String is a class in Java, so new String() creates an object.' }
];

// Generate 50 easy questions by cycling through the sample
for (let i = 1; i <= 50; i++) {
  const qData = easyQuestionsData[(i - 1) % easyQuestionsData.length];
  questions.push({
    difficulty: 'easy',
    level: i,
    questionType: 'mcq',
    question: qData.q + (i > easyQuestionsData.length ? ` (Variation ${Math.floor(i / easyQuestionsData.length) + 1})` : ''),
    options: qData.opts.map((opt, idx) => `${opt}${i > easyQuestionsData.length ? ` (Q${i})` : ''}`),
    correctAnswer: qData.ans,
    explanation: qData.exp
  });
}

// Intermediate Level Questions (100 code block questions) - REAL CODE
const intermediateTemplates = [
  {
    desc: 'Complete this function to calculate factorial',
    blocks: [
      { order: 1, lines: ['def factorial(n):', '    if n <= 1:'] },
      { order: 2, lines: ['        return 1'] },
      { order: 3, lines: ['    return n * factorial(n - 1)'] },
      { order: 4, lines: ['print(factorial(5))'] }
    ]
  },
  {
    desc: 'Sort this array using bubble sort',
    blocks: [
      { order: 1, lines: ['int arr[] = {5, 2, 8, 1, 9};', 'int n = 5;'] },
      { order: 2, lines: ['for(int i = 0; i < n-1; i++) {'] },
      { order: 3, lines: ['    for(int j = 0; j < n-i-1; j++) {'] },
      { order: 4, lines: ['        if(arr[j] > arr[j+1]) {'] },
      { order: 5, lines: ['            int temp = arr[j];', '            arr[j] = arr[j+1];', '            arr[j+1] = temp;'] },
      { order: 6, lines: ['        }'] },
      { order: 7, lines: ['    }'] },
      { order: 8, lines: ['}'] }
    ]
  },
  {
    desc: 'Complete binary search function',
    blocks: [
      { order: 1, lines: ['int binarySearch(int arr[], int left, int right, int target) {'] },
      { order: 2, lines: ['    if (right >= left) {'] },
      { order: 3, lines: ['        int mid = left + (right - left) / 2;'] },
      { order: 4, lines: ['        if (arr[mid] == target)', '            return mid;'] },
      { order: 5, lines: ['        if (arr[mid] > target)', '            return binarySearch(arr, left, mid-1, target);'] },
      { order: 6, lines: ['        return binarySearch(arr, mid+1, right, target);'] },
      { order: 7, lines: ['    }'] },
      { order: 8, lines: ['    return -1;'] },
      { order: 9, lines: ['}'] }
    ]
  },
  {
    desc: 'Check if a number is prime',
    blocks: [
      { order: 1, lines: ['def is_prime(n):', '    if n < 2:'] },
      { order: 2, lines: ['        return False'] },
      { order: 3, lines: ['    for i in range(2, int(n**0.5) + 1):'] },
      { order: 4, lines: ['        if n % i == 0:'] },
      { order: 5, lines: ['            return False'] },
      { order: 6, lines: ['    return True'] }
    ]
  },
  {
    desc: 'Find maximum element in array',
    blocks: [
      { order: 1, lines: ['int findMax(int arr[], int n) {'] },
      { order: 2, lines: ['    int max = arr[0];'] },
      { order: 3, lines: ['    for(int i = 1; i < n; i++) {'] },
      { order: 4, lines: ['        if(arr[i] > max)'] },
      { order: 5, lines: ['            max = arr[i];'] },
      { order: 6, lines: ['    }'] },
      { order: 7, lines: ['    return max;'] },
      { order: 8, lines: ['}'] }
    ]
  }
];

for (let i = 1; i <= 100; i++) {
  const template = intermediateTemplates[(i - 1) % intermediateTemplates.length];
  questions.push({
    difficulty: 'intermediate',
    level: i,
    questionType: 'codeBlocks',
    codeDescription: `${template.desc} (Level ${i})`,
    codeBlocks: template.blocks
  });
}

// Hard Level Questions - REAL CODING PROBLEMS
const hardQuestionsData = {
  'C': [
    {
      level: 1,
      problem: `Write a C program to reverse a linked list.\n\nInput: Linked list with nodes\nOutput: Reversed linked list\n\nFunction: struct Node* reverseList(struct Node* head);`,
      testCases: [
        { input: '1->2->3->NULL', output: '3->2->1->NULL', description: 'Basic reversal' },
        { input: '1->NULL', output: '1->NULL', description: 'Single node' }
      ],
      hints: ['Use three pointers: prev, current, and next', 'Traverse and reverse links one by one', 'Start with prev = NULL'],
      solution: `struct Node* reverseList(struct Node* head) {\n    struct Node* prev = NULL;\n    struct Node* current = head;\n    struct Node* next = NULL;\n    \n    while (current != NULL) {\n        next = current->next;\n        current->next = prev;\n        prev = current;\n        current = next;\n    }\n    return prev;\n}`
    },
    {
      level: 2,
      problem: `Write a C function to check if a string is a palindrome.\n\nFunction: int isPalindrome(char* str);\nReturn: 1 if palindrome, 0 otherwise`,
      testCases: [
        { input: '"racecar"', output: '1', description: 'Valid palindrome' },
        { input: '"hello"', output: '0', description: 'Not palindrome' }
      ],
      hints: ['Use two pointers from start and end', 'Compare characters moving towards center'],
      solution: `int isPalindrome(char* str) {\n    int left = 0;\n    int right = strlen(str) - 1;\n    while (left < right) {\n        if (str[left] != str[right]) return 0;\n        left++;\n        right--;\n    }\n    return 1;\n}`
    }
  ],
  'C++': [
    {
      level: 1,
      problem: `Implement a Stack class with push, pop, top, and isEmpty using vector.\n\nclass Stack {\n    // Implement the methods\n};`,
      testCases: [
        { input: 'push(5), push(10), top()', output: '10', description: 'Stack operations' }
      ],
      hints: ['Use vector<int> to store elements', 'push adds to back, pop removes from back'],
      solution: `class Stack {\nprivate:\n    vector<int> data;\npublic:\n    void push(int x) { data.push_back(x); }\n    void pop() { if (!data.empty()) data.pop_back(); }\n    int top() { return data.back(); }\n    bool isEmpty() { return data.empty(); }\n};`
    }
  ],
  'Java': [
    {
      level: 1,
      problem: `Write a Java method to find maximum element in array.\n\npublic static int findMax(int[] arr)`,
      testCases: [
        { input: '[3, 7, 2, 9, 1]', output: '9', description: 'Find maximum' }
      ],
      hints: ['Initialize max with first element', 'Compare with each element'],
      solution: `public static int findMax(int[] arr) {\n    if (arr.length == 0) return Integer.MIN_VALUE;\n    int max = arr[0];\n    for (int i = 1; i < arr.length; i++) {\n        if (arr[i] > max) max = arr[i];\n    }\n    return max;\n}`
    }
  ],
  'Python': [
    {
      level: 1,
      problem: `Write a Python function to find GCD using recursion (Euclidean algorithm).\n\ndef gcd(a, b):`,
      testCases: [
        { input: 'gcd(48, 18)', output: '6', description: 'GCD calculation' }
      ],
      hints: ['gcd(a, b) = gcd(b, a % b)', 'Base case: if b == 0, return a'],
      solution: `def gcd(a, b):\n    if b == 0:\n        return a\n    return gcd(b, a % b)`
    },
    {
      level: 2,
      problem: `Write a Python function to check if a number is prime.\n\ndef is_prime(n):`,
      testCases: [
        { input: 'is_prime(7)', output: 'True', description: 'Prime number' }
      ],
      hints: ['Check divisibility from 2 to sqrt(n)', 'If any divides, not prime'],
      solution: `def is_prime(n):\n    if n < 2: return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0: return False\n    return True`
    }
  ]
};

// Generate hard questions
['C', 'C++', 'Java', 'Python'].forEach(lang => {
  const langQuestions = hardQuestionsData[lang] || [];
  langQuestions.forEach(qData => {
    // Create multiple variations for each level
    for (let variation = 0; variation < Math.ceil(50 / langQuestions.length); variation++) {
      const level = qData.level + (variation * langQuestions.length);
      if (level <= 50) {
        questions.push({
          difficulty: 'hard',
          level: level,
          questionType: 'codeWrite',
          language: lang,
          problemStatement: qData.problem + (variation > 0 ? ` (Version ${variation + 1})` : ''),
          testCases: qData.testCases,
          solutionCode: qData.solution,
          hints: qData.hints,
          timeLimit: 300
        });
      }
    }
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolsystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  await Question.deleteMany({});
  console.log('Cleared existing questions');
  
  await Question.insertMany(questions);
  console.log(`Inserted ${questions.length} questions`);
  
  const easyCount = await Question.countDocuments({ difficulty: 'easy' });
  const intermediateCount = await Question.countDocuments({ difficulty: 'intermediate' });
  const hardCount = await Question.countDocuments({ difficulty: 'hard' });
  
  console.log('\nSummary:');
  console.log(`Easy questions: ${easyCount}`);
  console.log(`Intermediate questions: ${intermediateCount}`);
  console.log(`Hard questions: ${hardCount}`);
  console.log(`Total: ${easyCount + intermediateCount + hardCount}`);
  
  process.exit(0);
})
.catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
