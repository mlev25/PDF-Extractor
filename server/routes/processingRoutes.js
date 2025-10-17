const express = require('express');
const router = express.Router();
const multer = require('multer');
const processingController = require('../controllers/processController');

const upload = multer({ dest: 'uploads/' });

// POST /api/process-pdf
router.post('/process-pdf', upload.single('pdfFile'), processingController.processPdf);

module.exports = router;