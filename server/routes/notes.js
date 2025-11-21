import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Get notes PDF for a programming language
router.get('/:language', async (req, res) => {
  try {
    const { language } = req.params;
    const allowedLanguages = ['C', 'C++', 'Java', 'Python', 'JavaScript'];
    
    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({ message: 'Invalid programming language' });
    }

    // Map language names to file names
    const fileNameMap = {
      'C': 'C.pdf',
      'C++': 'Cpp.pdf',
      'Java': 'Java.pdf',
      'Python': 'Python.pdf',
      'JavaScript': 'JavaScript.pdf'
    };

    const fileName = fileNameMap[language];
    const filePath = path.join(__dirname, '../notes', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Notes file not found' });
    }

    // Set proper headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    // Send file for viewing/downloading
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error sending file' });
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// List available notes
router.get('/', async (req, res) => {
  try {
    const languages = [
      { name: 'C', fileName: 'C.pdf' },
      { name: 'C++', fileName: 'Cpp.pdf' },
      { name: 'Java', fileName: 'Java.pdf' },
      { name: 'Python', fileName: 'Python.pdf' },
      { name: 'JavaScript', fileName: 'JavaScript.pdf' }
    ];

    const notesDir = path.join(__dirname, '../notes');
    
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir, { recursive: true });
    }

    // Check which files actually exist
    const availableNotes = languages
      .filter(lang => {
        const filePath = path.join(notesDir, lang.fileName);
        return fs.existsSync(filePath);
      })
      .map(lang => ({
        language: lang.name,
        fileName: lang.fileName,
        downloadUrl: `/api/notes/${lang.name}`
      }));

    res.json(availableNotes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
