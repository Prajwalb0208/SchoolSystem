const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

const questions = [];

// Easy Level Questions (50 MCQ questions)
for (let i = 1; i <= 50; i++) {
  questions.push({
    difficulty: 'easy',
    level: i,
    questionType: 'mcq',
    question: `Basic Coding Question ${i}: What is the output of this code?`,
    options: [
      `Option A for question ${i}`,
      `Option B for question ${i}`,
      `Option C for question ${i}`,
      `Option D for question ${i}`
    ],
    correctAnswer: i % 4, // Cycle through 0-3
    explanation: `This is the explanation for question ${i}`
  });
}

// Intermediate Level Questions (100 code block questions)
for (let i = 1; i <= 100; i++) {
  const numBlocks = 5 + (i % 3); // 5-7 blocks
  const codeBlocks = [];
  
  for (let j = 1; j <= numBlocks; j++) {
    codeBlocks.push({
      lines: [
        `Line ${j * 2 - 1} of block ${j}`,
        `Line ${j * 2} of block ${j}`
      ],
      order: j
    });
  }
  
  questions.push({
    difficulty: 'intermediate',
    level: i,
    questionType: 'codeBlocks',
    codeDescription: `Arrange the following code blocks in correct order for question ${i}`,
    codeBlocks: codeBlocks
  });
}

// Hard Level Questions
// 10 C questions
for (let i = 1; i <= 10; i++) {
  questions.push({
    difficulty: 'hard',
    level: i,
    questionType: 'codeWrite',
    language: 'C',
    problemStatement: `Hard C Question ${i}: Write a C program to solve this problem. Problem description ${i}.`,
    testCases: [
      { input: 'test1', output: 'expected1', description: 'Test case 1' },
      { input: 'test2', output: 'expected2', description: 'Test case 2' }
    ],
    solutionCode: `#include <stdio.h>\n\nint main() {\n    // Solution for question ${i}\n    return 0;\n}`,
    hints: [`Hint 1 for question ${i}`, `Hint 2 for question ${i}`],
    timeLimit: 300
  });
}

// 10 C++ questions
for (let i = 1; i <= 10; i++) {
  questions.push({
    difficulty: 'hard',
    level: i,
    questionType: 'codeWrite',
    language: 'C++',
    problemStatement: `Hard C++ Question ${i}: Write a C++ program to solve this problem. Problem description ${i}.`,
    testCases: [
      { input: 'test1', output: 'expected1', description: 'Test case 1' },
      { input: 'test2', output: 'expected2', description: 'Test case 2' }
    ],
    solutionCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Solution for question ${i}\n    return 0;\n}`,
    hints: [`Hint 1 for question ${i}`, `Hint 2 for question ${i}`],
    timeLimit: 300
  });
}

// 15 Java questions
for (let i = 1; i <= 15; i++) {
  questions.push({
    difficulty: 'hard',
    level: i,
    questionType: 'codeWrite',
    language: 'Java',
    problemStatement: `Hard Java Question ${i}: Write a Java program to solve this problem. Problem description ${i}.`,
    testCases: [
      { input: 'test1', output: 'expected1', description: 'Test case 1' },
      { input: 'test2', output: 'expected2', description: 'Test case 2' }
    ],
    solutionCode: `public class Solution {\n    public static void main(String[] args) {\n        // Solution for question ${i}\n    }\n}`,
    hints: [`Hint 1 for question ${i}`, `Hint 2 for question ${i}`],
    timeLimit: 300
  });
}

// 15 Python questions
for (let i = 1; i <= 15; i++) {
  questions.push({
    difficulty: 'hard',
    level: i,
    questionType: 'codeWrite',
    language: 'Python',
    problemStatement: `Hard Python Question ${i}: Write a Python program to solve this problem. Problem description ${i}.`,
    testCases: [
      { input: 'test1', output: 'expected1', description: 'Test case 1' },
      { input: 'test2', output: 'expected2', description: 'Test case 2' }
    ],
    solutionCode: `# Solution for question ${i}\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()`,
    hints: [`Hint 1 for question ${i}`, `Hint 2 for question ${i}`],
    timeLimit: 300
  });
}

// Connect to MongoDB and insert questions
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolsystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Clear existing questions
  await Question.deleteMany({});
  console.log('Cleared existing questions');
  
  // Insert new questions
  await Question.insertMany(questions);
  console.log(`Inserted ${questions.length} questions`);
  
  // Print summary
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

