import React, { useState } from 'react'
import './App.css'
import ResultDisplay from './components/ResultDisplay.jsx'
import HelpModal from './components/HelpModal.jsx';


function App() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('formatted');

  const API_URL = 'https://pdf-extractor-production-4253.up.railway.app/api/process-pdf';

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setData(null);
    setError(null);
    setViewMode('formatted');
  };

  const getJsonString = () => {
      return JSON.stringify(data, null, 2); 
  };

  const handleCopyJson = () => {
      if (!data) return;
      try {
          navigator.clipboard.writeText(getJsonString()); 
          alert('JSON adatok másolva a vágólapra!');
      } catch (err) {
          console.error('Masolas hibaba utokozott:', err);
          alert('Hiba történt a másolás során.');
      }
  };

  const handleDownloadJson = () => {
      if (!data) return;
      const jsonString = getJsonString();
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(data.termék_neve || 'kinyert-adatok').replace(/\s/g, '-')}.json`; // Terméknév a fájlnévben
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Valassz ki egy PDF fajlt a folytatashoz.");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append('pdfFile', file);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData, 
      });

      setLoading(false);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ismeretlen hiba történt.' }));
        throw new Error(`Feldolgozási hiba: (${response.status}) ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(`API hiba: ${result.message}`);
      }

    } catch (err) {
      setLoading(false);
      setError(`Hiba történt a kérés során: ${err.message}. Ellenőrizd a kapcsolatot/backendet`);
      console.error('Frontend hiba:', err);
    }
  };

  return (
    <>

      {/* 1. Modal Komponens */}
      <HelpModal 
          isOpen={isHelpOpen} 
          onClose={() => setIsHelpOpen(false)} 
      />

      {/* 2. Súgó gomb */}
      <button 
          className="help-button" 
          onClick={() => setIsHelpOpen(true)}
      >
          ?
      </button>

    <div className="container">
      <h1><b>PDF</b> tápérték kinyerő alkalmazás</h1>

      <form onSubmit={handleSubmit} className="upload-section">
        <label htmlFor="pdfFile" className="custom-file-upload">
          {file ? `Fájl kiválasztva: ${file.name}` : 'Válassz PDF Fájlt (.pdf)'}
        </label>
        <input type="file" id="pdfFile" accept=".pdf" onChange={handleFileChange} />
        
        <button type="submit" disabled={!file || loading} className="submit-button">
          {loading ? 'Feldolgozás...' : 'Adatok Elemzése'}
        </button>
      </form>

      {/* Állapotjelzések*/}
      {loading && <div className="status-message loading">Feldolgozás folyamatban... Eltarthat akár percekig is a nagy fájloknál!</div>}
      {error && <div className="status-message error">Hiba: {error}</div>}

      {/* Eredmény */}
      {data && (
        <div className="results-wrapper">
          <h2>Eredmény</h2>
          
          <div className="view-controls">
            {/* Nézetváltó gombok */}
            <button 
              onClick={() => setViewMode('formatted')}
              className={viewMode === 'formatted' ? 'active' : ''}
            >
              Formázott nézet
            </button>
            <button 
              onClick={() => setViewMode('json')}
              className={viewMode === 'json' ? 'active' : ''}
            >
              JSON nézet
            </button>
            
            {/* Műveleti gombok */}
            <button onClick={handleCopyJson} className="action-button copy">Másolás</button>
            <button onClick={handleDownloadJson} className="action-button download">Letöltés (JSON)</button>
          </div>
          
          {/* A megjelenítő komponens */}
          <ResultDisplay data={data} viewMode={viewMode} /> 
        </div>
      )}
    </div>
    </>
  );

}

export default App
