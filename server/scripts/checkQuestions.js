const mongoose = require('mongoose');
const Question = require('../models/Question');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schoolsystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  const easyCount = await Question.countDocuments({ difficulty: 'easy' });
  const intermediateCount = await Question.countDocuments({ difficulty: 'intermediate' });
  const hardCount = await Question.countDocuments({ difficulty: 'hard' });
  const total = await Question.countDocuments();
  
  console.log('\nQuestion Counts:');
  console.log(`Easy: ${easyCount}/50`);
  console.log(`Intermediate: ${intermediateCount}/100`);
  console.log(`Hard: ${hardCount}/50`);
  console.log(`Total: ${total}`);
  
  // Check specific question
  const q1 = await Question.findOne({ difficulty: 'easy', level: 1 });
  if (q1) {
    console.log('\n✓ Easy Level 1 question exists');
  } else {
    console.log('\n✗ Easy Level 1 question NOT found - Database needs to be seeded!');
    console.log('Run: npm run seed');
  }
  
  process.exit(0);
})
.catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

