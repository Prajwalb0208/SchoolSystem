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
    const allowedLanguages = ['C', 'C++', 'Java', 'Python'];
    
    if (!allowedLanguages.includes(language)) {
      return res.status(400).json({ message: 'Invalid programming language' });
    }

    const fileName = language === 'C++' ? 'Cpp.pdf' : `${language}.pdf`;
    const filePath = path.join(__dirname, '../notes', fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Notes file not found' });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).json({ message: 'Error downloading file' });
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
      { name: 'Python', fileName: 'Python.pdf' }
    ];

    const notesDir = path.join(__dirname, '../notes');
    
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir, { recursive: true });
    }

    const availableNotes = languages.map(lang => ({
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
