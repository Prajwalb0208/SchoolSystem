const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, '../uploads/profiles'),
  path.join(__dirname, '../notes')
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log('All directories created successfully!');

