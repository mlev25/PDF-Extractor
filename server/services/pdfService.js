
const fs = require('fs'); 
const { PDFParse } = require('pdf-parse'); 
const FormData = require('form-data');
const axios = require('axios'); 
const { readFile } = require('fs').promises; 

const TEXT_THRESHOLD = 100; 
const OCR_API_URL = process.env.DOCSTRANGE_API_URL;
const OCR_AUTH = process.env.DOCSTRANGE_API_KEY; 

async function performOCR(filePath) {
    if (!OCR_AUTH) {
        console.error("HIBA: Hiányzik az DOCSTRANGE_API_KEY a .env-ből!");
        return ''; 
    }
    console.log("-> Natív olvasás sikertelen, Nanonets OCR hívása...");
    
    try {
        const fileBuffer = fs.readFileSync(filePath); 

        const formData = new FormData();
        
        formData.append('file', fileBuffer, {
            filename: 'document.pdf',
            contentType: 'application/pdf',
        });
        
        formData.append('output_type', 'markdown');
        
        const headers = {
            'Authorization': `Bearer ${OCR_AUTH}`, 
            ...formData.getHeaders() 
        };

        const response = await axios.post(
            OCR_API_URL, 
            formData, 
            {
                headers: headers, 
                timeout: 300000 // 5 perces timeout az OCR-nek (tenyleg oriasi fajlok miatt szukseges)
            }
        );

        if (response.data && response.data.success) {
            console.log("OCR kinyerés sikeres.");
            return response.data.content || ''; 
        }
        
    } catch (error) {
        console.error("Hiba az OCR API hívásban:", error.message);
        if (error.response) {
            console.error("API Error Detail:", error.response.data); 
        }
        return ''; 
    }
    return '';
}

exports.getRawText = async (filePath) => {
    let rawText = '';
    let parser = null;

    try{
        const dataBuffer = await readFile(filePath); 
        
        parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        
        rawText = data.text.trim();
        
        if(rawText.length < TEXT_THRESHOLD) {
            console.log(`Extracted text length (${rawText.length}) below threshold, falling back to OCR.`);
            rawText = await performOCR(filePath);
        } else {
            console.log(`Successfully extracted text from PDF using pdfParser, length: ${rawText.length}`);
        }

    }catch (error) {
        console.error(`Error reading PDF file: ${error.message}. Falling back to OCR.`);
        rawText = await performOCR(filePath);
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }

    return rawText;
}