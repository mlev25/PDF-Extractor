// frontend/src/components/HelpModal.jsx

import React from 'react';

const HelpModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
                <div className="modal-header">
                    <h2>Hogyan működik az alkalmazás?</h2>
                    <button className="modal-close-button" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <p>Ezen alkalmazás a háttérben Node.js backend, Gemini AI és egy külső OCR szolgáltatást (Docstrage/Nanonets) felhasználva PDF dokumentumokban lévő élelmiszeripari adatok kinyerését és strukturálását teszi lehetővé. A megfelelő működés végett csak élelmiszer termékleírásokat tartalmazó dokumentumot érdemes feltölteni!</p>

                    <div className="modal-section">
                        <h3>1. Mit kell feltöltened?</h3>
                        <ul>
                            <li><strong>Formátum:</strong> Csak PDF fájlt fogad el, szöveges vagy kép alapú/scannelt (Utóbbi esetén a feldolgozás <b>hosszabb</b> ideig tart!).</li>
                            <li><strong>Tartalom:</strong> Termék neve, allergének, tápértékek 100 grammra vetítve.</li>
                            <li><strong>Nyelv:</strong> Bármilyen nyelvű forrást feldolgoz, de az eredményt mindig magyarul adja vissza.</li>
                        </ul>
                    </div>

                    <div className="modal-section">
                        <h3>2. Mennyi ideig tart a feldolgozás?</h3>
                        <ul>
                            <li><strong>Natív PDF:</strong> Ha a PDF szöveges (kijelölhető), a feldolgozás szinte azonnali (néhány másodperc).</li>
                            <li><strong>Képes PDF (Scannelt):</strong> Ha a PDF kép alapú, a rendszer automatikusan átvált az OCR-re. Ez a külső API hívás miatt akár 1-2 percig is eltarthat nagyobb vagy több oldalas dokumentumok esetén. Kérjük légy türelmes!</li>
                        </ul>
                    </div>

                    <div className="modal-section">
                        <h3>3. Műveletek az adatokkal</h3>
                        <ul>
                              <p>Az eredmények megjelenése után választhatsz a <b>Formázott nézet</b> és a <b>JSON nézet</b> között. A <strong>Másolás</strong> és <strong>Letöltés (JSON)</strong> gombok mindig a tiszta JSON formátumot használják.</p>
                        </ul>
                        
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HelpModal;