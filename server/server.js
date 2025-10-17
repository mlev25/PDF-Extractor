
require('dotenv').config(); 

const express = require('express');
const cors = require('cors'); 
const processingRoutes = require('./routes/processingRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. cors middleware engedelyezese
app.use(cors()); 

app.use(express.json()); 

// 2. utvonalak regisztrálasa, minden API endpoint az /api prefixet kapja
app.use('/api', processingRoutes); 

// 3. SZERVER INDÍTÁSA
app.listen(PORT, () => {
    console.log(`\n---------------------------------`);
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`Endpoint: http://localhost:${PORT}/api/process-pdf`);
    console.log(`---------------------------------\n`);
    console.log(`✅ Gemini Key Status: ${!!process.env.LLM_API_KEY ? 'OK' : 'MISSING'}`);
    console.log(`✅ OCR Key Status: ${!!process.env.DOCSTRANGE_API_KEY ? 'OK' : 'MISSING'}`);
});