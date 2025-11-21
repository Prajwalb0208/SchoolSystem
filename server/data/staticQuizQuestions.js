export const STATIC_QUIZ_QUESTIONS = [
  {
    _id: 'static-q1',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What is the output of this C code?

int main() {
    int x = 5;
    printf("%d", x++);
    return 0;
}`,
    options: ['5', '6', 'Compilation error', 'Runtime error'],
    correctAnswer: 0,
    explanation: 'x++ is post-increment, so it prints 5 first, then increments x to 6.',
    timeLimit: 300,
  },
  {
    _id: 'static-q2',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What does this Python code output?

x = [1, 2, 3]
y = x
y.append(4)
print(x)`,
    options: ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Error'],
    correctAnswer: 1,
    explanation: 'y and x reference the same list object, so modifying y also modifies x.',
    timeLimit: 300,
  },
  {
    _id: 'static-q3',
    difficulty: 'easy',
    questionType: 'mcq',
    question: 'In C++, what is the typical size of an int on a 64-bit system?',
    options: ['2 bytes', '4 bytes', '8 bytes', 'Depends on compiler'],
    correctAnswer: 1,
    explanation: 'On most systems, int is 4 bytes (32 bits) regardless of CPU architecture.',
    timeLimit: 300,
  },
  {
    _id: 'static-q4',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What is the output?

String str = "Hello";
System.out.println(str.length());`,
    options: ['4', '5', '6', 'Compilation error'],
    correctAnswer: 1,
    explanation: 'The length() method returns the number of characters. "Hello" has 5 characters.',
    timeLimit: 300,
  },
  {
    _id: 'static-q5',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What will this code print?

def func(x):
    x = x * 2
    return x

a = 5
func(a)
print(a)`,
    options: ['5', '10', 'Error', 'None'],
    correctAnswer: 0,
    explanation: 'Integers are immutable in Python; the original variable is unchanged.',
    timeLimit: 300,
  },
  {
    _id: 'static-q6',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What is the output of this code?

int arr[] = {1, 2, 3};
printf("%d", arr[3]);`,
    options: ['3', '0', 'Garbage value', 'Compilation error'],
    correctAnswer: 2,
    explanation: 'Index 3 is out of bounds (valid indices are 0-2), so it reads garbage memory.',
    timeLimit: 300,
  },
  {
    _id: 'static-q7',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What does this print?

for i in range(3):
    print(i, end=" ")
print(i)`,
    options: ['0 1 2 3', '0 1 2 2', '0 1 2', 'Error'],
    correctAnswer: 1,
    explanation: 'The loop variable i persists after the loop and has value 2.',
    timeLimit: 300,
  },
  {
    _id: 'static-q8',
    difficulty: 'easy',
    questionType: 'mcq',
    question: 'In Java, what is the default value of a boolean variable?',
    options: ['true', 'false', 'null', 'undefined'],
    correctAnswer: 1,
    explanation: 'Booleans default to false in Java when declared as fields.',
    timeLimit: 300,
  },
  {
    _id: 'static-q9',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What is the result?

int x = 10;
int y = x > 5 ? 20 : 30;
printf("%d", y);`,
    options: ['10', '20', '30', 'Syntax error'],
    correctAnswer: 1,
    explanation: 'Ternary operator chooses 20 because x > 5 is true.',
    timeLimit: 300,
  },
  {
    _id: 'static-q10',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What does this code output?

lst = [1, 2, 3]
result = lst * 2
print(result)`,
    options: ['[2, 4, 6]', '[1, 2, 3, 1, 2, 3]', '[1, 2, 3, 2]', 'Error'],
    correctAnswer: 1,
    explanation: 'Multiplying a Python list repeats its contents.',
    timeLimit: 300,
  },
  {
    _id: 'static-q11',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What is the output?

int a = 5, b = 3;
printf("%d", a / b);`,
    options: ['1', '1.67', '2', 'Compilation error'],
    correctAnswer: 0,
    explanation: 'Integer division truncates decimals, so 5 / 3 becomes 1.',
    timeLimit: 300,
  },
  {
    _id: 'static-q12',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What does this Python code print?

x = "hello"
print(x.upper())`,
    options: ['hello', 'HELLO', 'Hello', 'Error'],
    correctAnswer: 1,
    explanation: 'upper() converts all letters to uppercase.',
    timeLimit: 300,
  },
  {
    _id: 'static-q13',
    difficulty: 'easy',
    questionType: 'mcq',
    question: 'What is sizeof(char) in C?',
    options: ['1 byte', '2 bytes', '4 bytes', 'Depends on system'],
    correctAnswer: 0,
    explanation: 'char is always 1 byte by definition in C.',
    timeLimit: 300,
  },
  {
    _id: 'static-q14',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What does this Java code output?

int x = 5;
System.out.println(x++ + ++x);`,
    options: ['10', '11', '12', '13'],
    correctAnswer: 2,
    explanation: 'x++ yields 5 (then x=6); ++x makes x=7, sum is 12.',
    timeLimit: 300,
  },
  {
    _id: 'static-q15',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What is the output?

x = True
y = False
print(x and y)`,
    options: ['True', 'False', 'Error', 'None'],
    correctAnswer: 1,
    explanation: 'Logical AND is false when any operand is false.',
    timeLimit: 300,
  },
  {
    _id: 'static-q16',
    difficulty: 'easy',
    questionType: 'mcq',
    question: 'In C++, what does the keyword "virtual" enable?',
    options: ['Inlining', 'Polymorphism', 'Variable declaration', 'Static linkage'],
    correctAnswer: 1,
    explanation: 'virtual allows runtime polymorphism via overriding.',
    timeLimit: 300,
  },
  {
    _id: 'static-q17',
    difficulty: 'easy',
    questionType: 'mcq',
    question: 'What does len([1, 2, [3, 4]]) return in Python?',
    options: ['3', '4', '5', 'Error'],
    correctAnswer: 0,
    explanation: 'len counts top-level items; nested list counts as one element.',
    timeLimit: 300,
  },
  {
    _id: 'static-q18',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What is the output?

int x = 0;
while(x < 3) {
    printf("%d", x);
    x++;
}`,
    options: ['012', '123', '0123', 'Infinite loop'],
    correctAnswer: 0,
    explanation: 'Loop prints 0,1,2 before condition fails.',
    timeLimit: 300,
  },
  {
    _id: 'static-q19',
    difficulty: 'easy',
    questionType: 'mcq',
    question: `What does this print?

s = "Python"
print(s[1:4])`,
    options: ['Pyt', 'yth', 'ytho', 'thon'],
    correctAnswer: 1,
    explanation: 'Slice [1:4] returns characters at indices 1,2,3.',
    timeLimit: 300,
  },
  {
    _id: 'static-q20',
    difficulty: 'easy',
    questionType: 'mcq',
    question: 'In Java, what does String a = new String("hello") create?',
    options: ['Primitive', 'Object reference', 'Array', 'Integer'],
    correctAnswer: 1,
    explanation: 'new String creates an object; the variable holds a reference.',
    timeLimit: 300,
  },
];

export const QUIZ_BANK = {
  default: STATIC_QUIZ_QUESTIONS,
  '2048': STATIC_QUIZ_QUESTIONS,
  memory: STATIC_QUIZ_QUESTIONS,
  sudoku: STATIC_QUIZ_QUESTIONS,
  snake: STATIC_QUIZ_QUESTIONS,
  flappy: STATIC_QUIZ_QUESTIONS,
  puzzle: STATIC_QUIZ_QUESTIONS,
  typing: STATIC_QUIZ_QUESTIONS
};

export const STATIC_QUIZ_MAP = STATIC_QUIZ_QUESTIONS.reduce((map, question) => {
  map.set(question._id, question);
  return map;
}, new Map());

