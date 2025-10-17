const pdfService = require('../services/pdfService');
const llmService = require('../services/llmService');
const fs = require('fs');

exports.processPdf = async (req, res) => {
      const filePath = req.file ? req.file.path : null;

      if (!filePath) {
            return res.status(400).json({ error: 'Nincs fájl feltöltve.' });
      }
      try {
            const rawText = await pdfService.getRawText(filePath);
        
            if (!rawText || rawText.trim().length < 10) {
                  return res.status(400).json({ error: 'A dokumentum szövegének kinyerése sikertelen volt.' });
            }
            
            const structuredData = await llmService.extractDataFromText(rawText);
            console.log("Structured Data Extracted:", structuredData);
            res.json({ success: true, data: structuredData });
      } catch (error) {
            console.error('Processing error:', error.message);
            res.status(500).json({ error: 'Belső szerverhiba a feldolgozás során.' });
      } finally {
            if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                  console.log(`Fájl törölve: ${filePath}`);
            }
      }

};