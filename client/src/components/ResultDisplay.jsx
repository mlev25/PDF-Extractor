import React from 'react';

const NutrientTable = ({ tapertékek }) => {
    if (!tapertékek || tapertékek.length === 0) return <p>Nincs tápérték adat kinyerve.</p>;

    return (
      <table>
        <thead>
          <tr>
            <th>Jellemző</th>
            <th>Mennyiség / 100g</th>
          </tr>
        </thead>
        <tbody>
          {tapertékek.map((item, index) => (
            <tr key={index}>
              <td>{item.jellemző || 'Nincs adat'}</td>
              <td>{item.mennyiség_100g || 'Nincs adat'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };


const ResultDisplay = ({ data, viewMode }) => {
    if (!data) return null;

    if (viewMode === 'json') {
        return (
            <div className="json-container">
                {/* JSON.stringify: Formázza a JSON objektumot, 2-es indentálással */}
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        );
    }

    return (
        <div className="formatted-container">
            <div className="data-card">
                <h3>Termék adatok</h3>
                <p><strong>Termék neve:</strong> {data.termék_neve || 'Nincs adat'}</p>
                <p><strong>Forrás nyelv:</strong> {data.nyelv || 'Nincs adat'}</p>
            </div>

            <div className="data-card">
                <h3>Allergének</h3>
                <p>
                    {data.allergének && data.allergének.length > 0 
                        ? data.allergének.join(', ') 
                        : 'Nincs allergén feltüntetve.'}
                </p>
            </div>

            <div className="data-card">
                <h3>Tápértékek (100g-ra vonatkozóan)</h3>
                <NutrientTable tapertékek={data.tápértékek} />
            </div>
        </div>
    );
};

export default ResultDisplay;