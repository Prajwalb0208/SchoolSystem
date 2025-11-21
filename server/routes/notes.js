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
    
    // Use the same path as server.js static route
    const notesDir = path.join(__dirname, '../notes');
    const filePath = path.resolve(notesDir, fileName);
    
    console.log('Looking for file:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    console.log('Notes dir exists:', fs.existsSync(notesDir));
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found at:', filePath);
      // List files in notes directory for debugging
      if (fs.existsSync(notesDir)) {
        const files = fs.readdirSync(notesDir);
        console.log('Files in notes directory:', files);
      }
      return res.status(404).json({ 
        message: 'Notes file not found', 
        fileName,
        filePath,
        notesDir 
      });
    }

    // Set proper headers for PDF viewing/downloading
    res.setHeader('Content-Type', 'application/pdf');
    // Use attachment for download, inline for viewing
    const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
    res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS
    
    // Send file for viewing/downloading (use absolute path)
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        console.error('Error details:', err.message, err.code);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error sending file', error: err.message, code: err.code });
        }
      } else {
        console.log('File sent successfully:', fileName);
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

    // Always return all languages since files exist
    // The download route will handle file existence checking
    const availableNotes = languages.map(lang => ({
      language: lang.name,
      fileName: lang.fileName,
      downloadUrl: `/api/notes/${lang.name}`
    }));

    console.log('Returning notes:', availableNotes.length);
    res.json(availableNotes);
  } catch (error) {
    console.error('Error in notes list route:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
