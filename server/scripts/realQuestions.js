// Realistic coding questions for the seed script

const easyQuestions = [
  {
    level: 1,
    question: `What is the output of this C code?\n\nint main() {\n    int x = 5;\n    printf("%d", x++);\n    return 0;\n}`,
    options: [
      '5',
      '6',
      'Compilation error',
      'Runtime error'
    ],
    correctAnswer: 0,
    explanation: 'x++ is post-increment, so it prints 5 first, then increments x to 6.'
  },
  {
    level: 2,
    question: `What does this Python code output?\n\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)`,
    options: [
      '[1, 2, 3]',
      '[1, 2, 3, 4]',
      '[4]',
      'Error'
    ],
    correctAnswer: 1,
    explanation: 'y and x reference the same list object, so modifying y also modifies x.'
  },
  {
    level: 3,
    question: `In C++, what is the size of an int on a 64-bit system typically?`,
    options: [
      '2 bytes',
      '4 bytes',
      '8 bytes',
      'Depends on compiler'
    ],
    correctAnswer: 1,
    explanation: 'On most systems, int is 4 bytes (32 bits), regardless of whether the system is 32-bit or 64-bit.'
  },
  {
    level: 4,
    question: `What is the output?\n\nString str = "Hello";\nSystem.out.println(str.length());`,
    options: [
      '4',
      '5',
      '6',
      'Compilation error'
    ],
    correctAnswer: 1,
    explanation: 'The length() method returns the number of characters in the string. "Hello" has 5 characters.'
  },
  {
    level: 5,
    question: `What will this code print?\n\ndef func(x):\n    x = x * 2\n    return x\n\na = 5\nfunc(a)\nprint(a)`,
    options: [
      '5',
      '10',
      'Error',
      'None'
    ],
    correctAnswer: 0,
    explanation: 'Integers are immutable in Python. The function creates a new value but does not modify the original variable.'
  },
  {
    level: 6,
    question: `What is the output of this code?\n\nint arr[] = {1, 2, 3};\nprintf("%d", arr[3]);`,
    options: [
      '3',
      '0',
      'Garbage value',
      'Compilation error'
    ],
    correctAnswer: 2,
    explanation: 'Array index 3 is out of bounds (valid indices are 0, 1, 2). This will access garbage memory.'
  },
  {
    level: 7,
    question: `What does this print?\n\nfor i in range(3):\n    print(i, end=" ")\nprint(i)`,
    options: [
      '0 1 2 3',
      '0 1 2 2',
      '0 1 2',
      'Error'
    ],
    correctAnswer: 1,
    explanation: 'The loop variable i persists after the loop ends, so the last print(i) prints 2.'
  },
  {
    level: 8,
    question: `In Java, what is the default value of a boolean variable?`,
    options: [
      'true',
      'false',
      'null',
      'undefined'
    ],
    correctAnswer: 1,
    explanation: 'In Java, the default value for boolean primitive type is false.'
  },
  {
    level: 9,
    question: `What is the result?\n\nint x = 10;\nint y = x > 5 ? 20 : 30;\nprintf("%d", y);`,
    options: [
      '10',
      '20',
      '30',
      'Syntax error'
    ],
    correctAnswer: 1,
    explanation: 'This is a ternary operator. Since x (10) > 5 is true, y gets the value 20.'
  },
  {
    level: 10,
    question: `What does this code output?\n\nlist = [1, 2, 3]\nresult = list * 2\nprint(result)`,
    options: [
      '[2, 4, 6]',
      '[1, 2, 3, 1, 2, 3]',
      '[1, 2, 3, 2]',
      'Error'
    ],
    correctAnswer: 1,
    explanation: 'Multiplying a list by an integer repeats the list that many times.'
  }
];

const intermediateCodeBlocks = [
  {
    level: 1,
    description: 'Complete this function to calculate factorial',
    blocks: [
      { order: 1, lines: ['def factorial(n):', '    if n <= 1:'] },
      { order: 2, lines: ['        return 1'] },
      { order: 3, lines: ['    return n * factorial(n - 1)'] },
      { order: 4, lines: ['print(factorial(5))'] }
    ]
  },
  {
    level: 2,
    description: 'Sort this array using bubble sort',
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
    level: 3,
    description: 'Complete binary search function',
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
  }
];

const hardQuestions = {
  'C': [
    {
      level: 1,
      problemStatement: `Write a C program to reverse a linked list.\n\nInput: Linked list with nodes containing values\nOutput: Reversed linked list\n\nFunction signature: struct Node* reverseList(struct Node* head);`,
      testCases: [
        { input: '1->2->3->NULL', output: '3->2->1->NULL', description: 'Basic reversal' },
        { input: '1->NULL', output: '1->NULL', description: 'Single node' },
        { input: '1->2->NULL', output: '2->1->NULL', description: 'Two nodes' }
      ],
      hints: [
        'Use three pointers: prev, current, and next',
        'Traverse the list and reverse links one by one',
        'Start with prev = NULL and current = head'
      ],
      solutionCode: `struct Node* reverseList(struct Node* head) {\n    struct Node* prev = NULL;\n    struct Node* current = head;\n    struct Node* next = NULL;\n    \n    while (current != NULL) {\n        next = current->next;\n        current->next = prev;\n        prev = current;\n        current = next;\n    }\n    \n    return prev;\n}`
    },
    {
      level: 2,
      problemStatement: `Write a C program to check if a string is a palindrome.\n\nInput: A string\nOutput: Return 1 if palindrome, 0 otherwise\n\nFunction signature: int isPalindrome(char* str);`,
      testCases: [
        { input: '"racecar"', output: '1', description: 'Valid palindrome' },
        { input: '"hello"', output: '0', description: 'Not a palindrome' },
        { input: '"a"', output: '1', description: 'Single character' }
      ],
      hints: [
        'Use two pointers: one from start, one from end',
        'Compare characters while moving pointers towards center',
        'Ignore case if needed'
      ],
      solutionCode: `int isPalindrome(char* str) {\n    int left = 0;\n    int right = strlen(str) - 1;\n    \n    while (left < right) {\n        if (str[left] != str[right]) {\n            return 0;\n        }\n        left++;\n        right--;\n    }\n    return 1;\n}`
    }
  ],
  'C++': [
    {
      level: 1,
      problemStatement: `Implement a class Stack with push, pop, and top operations using a vector.\n\nclass Stack {\n    // Implement push, pop, top, and isEmpty methods\n};`,
      testCases: [
        { input: 'push(5), push(10), top()', output: '10', description: 'Basic stack operations' },
        { input: 'push(1), pop(), isEmpty()', output: 'true', description: 'Check empty after pop' }
      ],
      hints: [
        'Use vector<int> to store elements',
        'push adds to back, pop removes from back',
        'Check for empty before pop/top'
      ],
      solutionCode: `class Stack {\nprivate:\n    vector<int> data;\npublic:\n    void push(int x) {\n        data.push_back(x);\n    }\n    void pop() {\n        if (!data.empty()) {\n            data.pop_back();\n        }\n    }\n    int top() {\n        return data.back();\n    }\n    bool isEmpty() {\n        return data.empty();\n    }\n};`
    }
  ],
  'Java': [
    {
      level: 1,
      problemStatement: `Write a Java method to find the maximum element in an array.\n\npublic static int findMax(int[] arr) {\n    // Your code here\n}`,
      testCases: [
        { input: '[3, 7, 2, 9, 1]', output: '9', description: 'Find maximum' },
        { input: '[-5, -2, -10]', output: '-2', description: 'Negative numbers' }
      ],
      hints: [
        'Initialize max with first element',
        'Compare with each element',
        'Return the maximum value'
      ],
      solutionCode: `public static int findMax(int[] arr) {\n    if (arr.length == 0) return Integer.MIN_VALUE;\n    \n    int max = arr[0];\n    for (int i = 1; i < arr.length; i++) {\n        if (arr[i] > max) {\n            max = arr[i];\n        }\n    }\n    return max;\n}`
    }
  ],
  'Python': [
    {
      level: 1,
      problemStatement: `Write a Python function to find the GCD (Greatest Common Divisor) of two numbers using recursion.\n\ndef gcd(a, b):\n    # Your code here`,
      testCases: [
        { input: 'gcd(48, 18)', output: '6', description: 'GCD calculation' },
        { input: 'gcd(17, 13)', output: '1', description: 'Prime numbers' }
      ],
      hints: [
        'Use Euclidean algorithm: gcd(a, b) = gcd(b, a % b)',
        'Base case: if b == 0, return a',
        'Otherwise recurse with gcd(b, a % b)'
      ],
      solutionCode: `def gcd(a, b):\n    if b == 0:\n        return a\n    return gcd(b, a % b)`
    },
    {
      level: 2,
      problemStatement: `Write a Python function to check if a number is prime.\n\ndef is_prime(n):\n    # Your code here`,
      testCases: [
        { input: 'is_prime(7)', output: 'True', description: 'Prime number' },
        { input: 'is_prime(10)', output: 'False', description: 'Composite number' },
        { input: 'is_prime(1)', output: 'False', description: 'Edge case' }
      ],
      hints: [
        'Check divisibility from 2 to sqrt(n)',
        'If any number divides n, it\'s not prime',
        'Handle edge cases: n < 2'
      ],
      solutionCode: `def is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(n**0.5) + 1):\n        if n % i == 0:\n            return False\n    return True`
    }
  ]
};

module.exports = { easyQuestions, intermediateCodeBlocks, hardQuestions };

