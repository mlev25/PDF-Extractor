
const fs = require('fs'); 
const { PDFParse } = require('pdf-parse'); 
const FormData = require('form-data');
const axios = require('axios'); 
const { readFile } = require('fs').promises; 

const TEXT_THRESHOLD = 100;
const OCR_API_URL = process.env.DOCSTRANGE_API_URL;
const OCR_AUTH = process.env.DOCSTRANGE_API_KEY; 

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function performOCR(filePath) {
    if (!OCR_AUTH) {
        console.error("Hiányzik az DOCSTRANGE_API_KEY a .env-ből!");
        return ''; 
    }
    console.log("Natív olvasás sikertelen, Nanonets OCR hívása...");
    
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
                timeout: 30000
            }
        );
        
        console.log('OCR API teljes válasz:', response.data);
        
        const recordId = response.data.record_id;
    
        if (!recordId) {
            if (response.data && response.data.success && (response.data.content != '' && response.data.content != 'No content available')) {
                console.log("OCR kinyerés sikeres (szinkron válasz).");
                return response.data.content;
            }
            console.error("Nem kaptunk record_id-t a Nanonets-től.");
            return '';
        }

        console.log(`OCR kérés elküldve, Job ID: ${recordId}. Várakozás az eredményre...`);

        let extractedContent = '';
        const MAX_POLLING_ATTEMPTS = 60;

        for (let i = 0; i < MAX_POLLING_ATTEMPTS && !extractedContent; i++) {
            await sleep(5000);
            
            try {
                const fileResponse = await axios.get(
                    'https://extraction-api.nanonets.com/files/' + recordId,
                    { headers: headers }
                );

                console.log(`OCR Polling próbálkozás ${i + 1}:`, fileResponse.data);

                if (fileResponse.data && fileResponse.data.success && fileResponse.data.content != 'No content available') {
                    console.log("OCR kinyerés sikeres a lekérdezés után.");
                    extractedContent = fileResponse.data.content;
                    break;
                }
                
                console.log("Feldolgozás még folyamatban, folytatom a várakozást...");
                
            } catch (pollError) {
                if (pollError.response && pollError.response.status === 404) {
                    console.log("Feldolgozás még folyamatban (404-es válasz a fájlról), folytatom a várakozást...");
                } else {
                    console.error('Hiba a fájl lekérdezésekor:', pollError.message);
                }
            }
        }
        
        if (!extractedContent) {
            console.error('OCR Polling: Időtúllépés, az eredmény 5 percen belül nem érkezett meg.');
        }

        return extractedContent;
        
    } catch (error) {
        console.error("Hiba az OCR API hívásban:", error.message);
        if (error.response) {
            console.error("API Error Detail:", error.response.data); 
        }
        return ''; 
    }
}

exports.getRawText = async (filePath) => {
    let rawText = '';
    let parser = null;

    try{
        const dataBuffer = await readFile(filePath); 
        
        parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        
        rawText = data.text.trim();
        const ZAJ_REGEX = /-- \d+ of \d+ --|[\s\n\t]+/g;
        const tisztaSzoveg = rawText.replace(ZAJ_REGEX, '').trim();
        
        
        if(tisztaSzoveg.length < TEXT_THRESHOLD) {
            console.log(`Tiszta szöveg hossza: ${tisztaSzoveg.length}`);
            console.log(`Kinyert szöveg: ${tisztaSzoveg}`);
            rawText = await performOCR(filePath);
        } else {
            console.log(`Sikeresen kinyert szöveg a pdf-parser segítségével, hossza: ${rawText.length}`);
        }

    }catch (error) {
        console.error(`Hiba a fajl olvasasa soran: ${error.message}. Visszateres OCR-hez.`);
        rawText = await performOCR(filePath);
    } finally {
        if (parser) {
            await parser.destroy();
        }
    }

    return rawText;
}