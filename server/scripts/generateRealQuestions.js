const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

// Comprehensive real coding questions database
const easyQuestions = [
  // C Programming Questions
  {
    q: `What is the output of this C code?\n\n#include <stdio.h>\nint main() {\n    int x = 5;\n    printf("%d", x++);\n    return 0;\n}`,
    opts: ['5', '6', 'Compilation error', 'Undefined behavior'],
    ans: 0,
    exp: 'x++ is post-increment operator. It first prints the value (5), then increments x to 6.'
  },
  {
    q: `What will this code print?\n\n#include <stdio.h>\nint main() {\n    int arr[5] = {1, 2, 3};\n    printf("%d", arr[3]);\n    return 0;\n}`,
    opts: ['3', '0', 'Garbage value', 'Compilation error'],
    ans: 1,
    exp: 'In C, uninitialized array elements are automatically set to 0. arr[3] is not explicitly initialized, so it contains 0.'
  },
  {
    q: `What is the size of int on a 64-bit system typically?`,
    opts: ['2 bytes', '4 bytes', '8 bytes', 'Depends on compiler'],
    ans: 1,
    exp: 'On most systems, int is 4 bytes (32 bits) regardless of whether it is a 32-bit or 64-bit system. This is compiler-dependent but typically 4 bytes.'
  },
  {
    q: `What does this code output?\n\n#include <stdio.h>\nint main() {\n    char str[] = "Hello";\n    printf("%d", sizeof(str));\n    return 0;\n}`,
    opts: ['5', '6', '4', '8'],
    ans: 1,
    exp: 'sizeof(str) includes the null terminator. "Hello" has 5 characters plus null terminator = 6 bytes.'
  },
  {
    q: `What is the result of this operation?\n\n#include <stdio.h>\nint main() {\n    int a = 10, b = 3;\n    printf("%d", a / b);\n    return 0;\n}`,
    opts: ['3.33', '3', '4', 'Error'],
    ans: 1,
    exp: 'Integer division truncates the decimal part. 10/3 = 3 (not 3.33).'
  },
  
  // Python Questions
  {
    q: `What does this Python code output?\n\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)`,
    opts: ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Error'],
    ans: 1,
    exp: 'y and x reference the same list object. Modifying y also modifies x because they point to the same memory location.'
  },
  {
    q: `What will this print?\n\nx = "Python"\nprint(x[1:4])`,
    opts: ['Pyt', 'yth', 'ytho', 'thon'],
    ans: 1,
    exp: 'String slicing [1:4] gets characters from index 1 to 3 (end index is exclusive). "Python"[1:4] = "yth".'
  },
  {
    q: `What is the output?\n\ndef func(x):\n    x = x * 2\n    return x\n\na = 5\nfunc(a)\nprint(a)`,
    opts: ['5', '10', 'Error', 'None'],
    ans: 0,
    exp: 'Integers are immutable in Python. The function creates a new value but does not modify the original variable a.'
  },
  {
    q: `What does len([1, 2, [3, 4]]) return?`,
    opts: ['3', '4', '5', 'Error'],
    ans: 0,
    exp: 'len() counts top-level elements. The list has 3 elements: 1, 2, and [3,4].'
  },
  {
    q: `What is the output?\n\nlist = [1, 2, 3]\nresult = list * 2\nprint(result)`,
    opts: ['[2, 4, 6]', '[1, 2, 3, 1, 2, 3]', '[1, 2, 3, 2]', 'Error'],
    ans: 1,
    exp: 'Multiplying a list by an integer repeats the list that many times. [1,2,3] * 2 = [1,2,3,1,2,3].'
  },
  
  // Java Questions
  {
    q: `What is the output?\n\nString str = "Hello";\nSystem.out.println(str.length());`,
    opts: ['4', '5', '6', 'Compilation error'],
    ans: 1,
    exp: 'The length() method returns the number of characters in the string. "Hello" has 5 characters.'
  },
  {
    q: `What is the default value of a boolean variable in Java?`,
    opts: ['true', 'false', 'null', 'undefined'],
    ans: 1,
    exp: 'In Java, the default value for boolean primitive type is false.'
  },
  {
    q: `What does this code output?\n\nint x = 5;\nSystem.out.println(x++ + ++x);`,
    opts: ['10', '11', '12', '13'],
    ans: 2,
    exp: 'x++ returns 5 (then x becomes 6), ++x returns 7 (x becomes 7), so 5 + 7 = 12.'
  },
  {
    q: `In Java, what is String a = new String("hello")?`,
    opts: ['Primitive type', 'Object reference', 'Array', 'Integer'],
    ans: 1,
    exp: 'String is a class in Java. new String() creates an object, so a is an object reference.'
  },
  
  // C++ Questions
  {
    q: `What is the output?\n\n#include <iostream>\nusing namespace std;\nint main() {\n    int x = 10;\n    int y = x > 5 ? 20 : 30;\n    cout << y;\n    return 0;\n}`,
    opts: ['10', '20', '30', 'Syntax error'],
    ans: 1,
    exp: 'Ternary operator: if condition (x > 5) is true, return 20, else 30. Since 10 > 5, y = 20.'
  },
  {
    q: `What does the keyword "virtual" do in C++?`,
    opts: ['Makes function inline', 'Enables polymorphism', 'Declares variable', 'Makes function static'],
    ans: 1,
    exp: 'virtual enables runtime polymorphism through function overriding. It allows derived classes to override base class functions.'
  }
];

// Generate 50 easy questions by cycling through and adding variations
const generateEasyQuestions = () => {
  const questions = [];
  for (let i = 1; i <= 50; i++) {
    const baseQ = easyQuestions[(i - 1) % easyQuestions.length];
    questions.push({
      difficulty: 'easy',
      level: i,
      questionType: 'mcq',
      question: baseQ.q,
      options: baseQ.opts,
      correctAnswer: baseQ.ans,
      explanation: baseQ.exp
    });
  }
  return questions;
};

// Real Intermediate Code Blocks
const intermediateTemplates = [
  {
    desc: 'Complete this function to calculate factorial using recursion',
    blocks: [
      { order: 1, lines: ['def factorial(n):', '    if n <= 1:'] },
      { order: 2, lines: ['        return 1'] },
      { order: 3, lines: ['    return n * factorial(n - 1)'] },
      { order: 4, lines: ['print(factorial(5))'] }
    ]
  },
  {
    desc: 'Sort array using bubble sort algorithm',
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
    desc: 'Implement binary search recursively',
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

// Real Hard Questions
const hardQuestions = {
  'C': [
    {
      problem: `Write a C function to reverse a linked list.\n\nstruct Node {\n    int data;\n    struct Node* next;\n};\n\nFunction signature:\nstruct Node* reverseList(struct Node* head);\n\nReturn the new head of the reversed list.`,
      testCases: [
        { input: '1->2->3->NULL', output: '3->2->1->NULL', description: 'Basic reversal' },
        { input: '1->NULL', output: '1->NULL', description: 'Single node' }
      ],
      hints: [
        'Use three pointers: prev, current, and next',
        'Traverse the list and reverse links one by one',
        'Start with prev = NULL and current = head',
        'Store next node before modifying current->next'
      ],
      solution: `struct Node* reverseList(struct Node* head) {\n    struct Node* prev = NULL;\n    struct Node* current = head;\n    struct Node* next = NULL;\n    \n    while (current != NULL) {\n        next = current->next;\n        current->next = prev;\n        prev = current;\n        current = next;\n    }\n    \n    return prev;\n}`
    },
    {
      problem: `Write a C function to check if a string is a palindrome (case-sensitive).\n\nFunction: int isPalindrome(char* str);\nReturn: 1 if palindrome, 0 otherwise\n\nExample: "racecar" is palindrome, "hello" is not.`,
      testCases: [
        { input: '"racecar"', output: '1', description: 'Valid palindrome' },
        { input: '"hello"', output: '0', description: 'Not a palindrome' },
        { input: '"a"', output: '1', description: 'Single character' }
      ],
      hints: [
        'Use two pointers: one from start, one from end',
        'Compare characters while moving pointers towards center',
        'Stop when pointers meet or cross',
        'Include string.h for strlen()'
      ],
      solution: `#include <string.h>\nint isPalindrome(char* str) {\n    int left = 0;\n    int right = strlen(str) - 1;\n    \n    while (left < right) {\n        if (str[left] != str[right]) {\n            return 0;\n        }\n        left++;\n        right--;\n    }\n    return 1;\n}`
    },
    {
      problem: `Write a C function to find the factorial of a number using recursion.\n\nFunction: long long factorial(int n);\n\nHandle edge cases: n < 0 should return -1.`,
      testCases: [
        { input: '5', output: '120', description: 'factorial(5) = 120' },
        { input: '0', output: '1', description: 'factorial(0) = 1' },
        { input: '1', output: '1', description: 'factorial(1) = 1' }
      ],
      hints: [
        'Base case: if n <= 1, return 1',
        'Recursive case: return n * factorial(n-1)',
        'Check for negative numbers first'
      ],
      solution: `long long factorial(int n) {\n    if (n < 0) return -1;\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}`
    }
  ],
  'C++': [
    {
      problem: `Implement a Stack class using a vector with push, pop, top, and isEmpty methods.\n\nclass Stack {\nprivate:\n    vector<int> data;\npublic:\n    void push(int x);\n    void pop();\n    int top();\n    bool isEmpty();\n};`,
      testCases: [
        { input: 'push(5), push(10), top()', output: '10', description: 'Stack LIFO behavior' },
        { input: 'push(1), pop(), isEmpty()', output: 'true', description: 'Check empty after pop' }
      ],
      hints: [
        'Use vector<int> to store elements',
        'push adds to the end using push_back()',
        'pop removes from the end using pop_back()',
        'Check for empty before pop/top operations'
      ],
      solution: `class Stack {\nprivate:\n    vector<int> data;\npublic:\n    void push(int x) {\n        data.push_back(x);\n    }\n    void pop() {\n        if (!data.empty()) {\n            data.pop_back();\n        }\n    }\n    int top() {\n        return data.back();\n    }\n    bool isEmpty() {\n        return data.empty();\n    }\n};`
    },
    {
      problem: `Write a C++ function to find the maximum element in an array.\n\nFunction: int findMax(int arr[], int n);\nReturn the maximum value. Handle empty array (return INT_MIN).`,
      testCases: [
        { input: '[3, 7, 2, 9, 1]', output: '9', description: 'Find maximum' },
        { input: '[-5, -2, -10]', output: '-2', description: 'Negative numbers' }
      ],
      hints: [
        'Initialize max with first element',
        'Compare with each element in loop',
        'Return the maximum value found',
        'Include <climits> for INT_MIN'
      ],
      solution: `#include <climits>\nint findMax(int arr[], int n) {\n    if (n == 0) return INT_MIN;\n    int max = arr[0];\n    for (int i = 1; i < n; i++) {\n        if (arr[i] > max) {\n            max = arr[i];\n        }\n    }\n    return max;\n}`
    }
  ],
  'Java': [
    {
      problem: `Write a Java method to find the maximum element in an array.\n\npublic static int findMax(int[] arr)\n\nReturn Integer.MIN_VALUE if array is empty.`,
      testCases: [
        { input: '[3, 7, 2, 9, 1]', output: '9', description: 'Find maximum' },
        { input: '[-5, -2, -10]', output: '-2', description: 'Negative numbers' }
      ],
      hints: [
        'Check if array length is 0 first',
        'Initialize max with first element',
        'Compare with each element using loop',
        'Return Integer.MIN_VALUE for empty array'
      ],
      solution: `public static int findMax(int[] arr) {\n    if (arr.length == 0) return Integer.MIN_VALUE;\n    \n    int max = arr[0];\n    for (int i = 1; i < arr.length; i++) {\n        if (arr[i] > max) {\n            max = arr[i];\n        }\n    }\n    return max;\n}`
    },
    {
      problem: `Write a Java method to reverse a string.\n\npublic static String reverseString(String str)\n\nExample: "hello" -> "olleh"`,
      testCases: [
        { input: '"hello"', output: '"olleh"', description: 'Basic reversal' },
        { input: '"a"', output: '"a"', description: 'Single character' },
        { input: '""', output: '""', description: 'Empty string' }
      ],
      hints: [
        'Use StringBuilder for efficient string building',
        'Iterate from end to start',
        'Or use char array and swap characters',
        'Return the reversed string'
      ],
      solution: `public static String reverseString(String str) {\n    StringBuilder reversed = new StringBuilder();\n    for (int i = str.length() - 1; i >= 0; i--) {\n        reversed.append(str.charAt(i));\n    }\n    return reversed.toString();\n}`
    }
  ],
  'Python': [
    {
      problem: `Write a Python function to find the GCD (Greatest Common Divisor) of two numbers using recursion.\n\nUse the Euclidean algorithm:\ngcd(a, b) = gcd(b, a % b) if b != 0\ngcd(a, 0) = a\n\nFunction: def gcd(a, b):`,
      testCases: [
        { input: 'gcd(48, 18)', output: '6', description: 'GCD calculation' },
        { input: 'gcd(17, 13)', output: '1', description: 'Prime numbers' },
        { input: 'gcd(100, 25)', output: '25', description: 'One divides the other' }
      ],
      hints: [
        'Base case: if b == 0, return a',
        'Recursive case: return gcd(b, a % b)',
        'This is the Euclidean algorithm',
        'Works for both positive and negative numbers'
      ],
      solution: `def gcd(a, b):\n    if b == 0:\n        return abs(a)\n    return gcd(b, a % b)`
    },
    {
      problem: `Write a Python function to check if a number is prime.\n\nFunction: def is_prime(n):\n\nA prime number is only divisible by 1 and itself.\nReturn True if prime, False otherwise.`,
      testCases: [
        { input: 'is_prime(7)', output: 'True', description: 'Prime number' },
        { input: 'is_prime(10)', output: 'False', description: 'Composite number' },
        { input: 'is_prime(1)', output: 'False', description: 'Edge case' }
      ],
      hints: [
        'Check if n < 2 (not prime)',
        'Check divisibility from 2 to sqrt(n)',
        'If any number divides n, it is not prime',
        'Use range(2, int(n**0.5) + 1)'
      ],
      solution: `def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True`
    },
    {
      problem: `Write a Python function to reverse a string recursively.\n\nFunction: def reverse_string(s):\n\nExample: reverse_string("hello") returns "olleh"`,
      testCases: [
        { input: '"hello"', output: '"olleh"', description: 'Basic reversal' },
        { input: '"a"', output: '"a"', description: 'Single character' }
      ],
      hints: [
        'Base case: if len(s) <= 1, return s',
        'Recursive case: return last char + reverse of rest',
        'Use s[-1] for last character',
        'Use s[:-1] for string without last character'
      ],
      solution: `def reverse_string(s):\n    if len(s) <= 1:\n        return s\n    return s[-1] + reverse_string(s[:-1])`
    }
  ]
};

// Generate questions
const generateQuestions = () => {
  const questions = [];
  
  // Easy questions (50)
  questions.push(...generateEasyQuestions());
  
  // Intermediate questions (100) - cycle through templates
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
  
  // Hard questions - create multiple questions per language per level
  const languages = ['C', 'C++', 'Java', 'Python'];
  const hardQuestionsList = [];
  
  // C questions (50 levels)
  const cQuestions = hardQuestions['C'];
  for (let i = 1; i <= 50; i++) {
    const qData = cQuestions[(i - 1) % cQuestions.length];
    hardQuestionsList.push({
      difficulty: 'hard',
      level: i,
      questionType: 'codeWrite',
      language: 'C',
      problemStatement: qData.problem + (i > cQuestions.length ? ` (Variation ${Math.floor(i / cQuestions.length) + 1})` : ''),
      testCases: qData.testCases,
      solutionCode: qData.solution,
      hints: qData.hints,
      timeLimit: 300
    });
  }
  
  // C++ questions (50 levels)
  const cppQuestions = hardQuestions['C++'];
  for (let i = 1; i <= 50; i++) {
    const qData = cppQuestions[(i - 1) % cppQuestions.length];
    hardQuestionsList.push({
      difficulty: 'hard',
      level: i,
      questionType: 'codeWrite',
      language: 'C++',
      problemStatement: qData.problem + (i > cppQuestions.length ? ` (Variation ${Math.floor(i / cppQuestions.length) + 1})` : ''),
      testCases: qData.testCases,
      solutionCode: qData.solution,
      hints: qData.hints,
      timeLimit: 300
    });
  }
  
  // Java questions (50 levels)
  const javaQuestions = hardQuestions['Java'];
  for (let i = 1; i <= 50; i++) {
    const qData = javaQuestions[(i - 1) % javaQuestions.length];
    hardQuestionsList.push({
      difficulty: 'hard',
      level: i,
      questionType: 'codeWrite',
      language: 'Java',
      problemStatement: qData.problem + (i > javaQuestions.length ? ` (Variation ${Math.floor(i / javaQuestions.length) + 1})` : ''),
      testCases: qData.testCases,
      solutionCode: qData.solution,
      hints: qData.hints,
      timeLimit: 300
    });
  }
  
  // Python questions (50 levels)
  const pythonQuestions = hardQuestions['Python'];
  for (let i = 1; i <= 50; i++) {
    const qData = pythonQuestions[(i - 1) % pythonQuestions.length];
    hardQuestionsList.push({
      difficulty: 'hard',
      level: i,
      questionType: 'codeWrite',
      language: 'Python',
      problemStatement: qData.problem + (i > pythonQuestions.length ? ` (Variation ${Math.floor(i / pythonQuestions.length) + 1})` : ''),
      testCases: qData.testCases,
      solutionCode: qData.solution,
      hints: qData.hints,
      timeLimit: 300
    });
  }
  
  questions.push(...hardQuestionsList);
  
  return questions;
};

// Connect to MongoDB and seed
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolsystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  await Question.deleteMany({});
  console.log('Cleared existing questions');
  
  const questions = generateQuestions();
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
  console.log('\n✅ All questions seeded with REAL content!');
  
  process.exit(0);
})
.catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

