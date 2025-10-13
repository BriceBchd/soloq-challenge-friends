import React, { useState, useEffect } from 'react';
import './App.css';
import RankingTable from './components/RankingTable';

const API_BASE_URL = 'https://elastic.bricebchd.fr/soloq-api';
// const API_BASE_URL = 'http://localhost:4244';

function App() {
  const [summoners, setSummoners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummoners();
  }, []);

  const fetchSummoners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/summoners`);
      if (!response.ok) throw new Error('Failed to fetch summoners');
      const data = await response.json();
      setSummoners(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSummoners = async () => {
    try {
      setUpdating(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/summoners`);
      if (!response.ok) throw new Error('Failed to update summoners');
      const data = await response.json();
      setSummoners(data);
      
      // Optionnel : afficher un message de succès temporaire
      setTimeout(() => {
        // Vous pouvez ajouter une notification de succès ici si souhaité
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <div className="header-text">
            <h1>🏆 SoloQ Challenge with friends</h1>
            <p>Classement et statistiques de vos invocateurs favoris</p>
          </div>
        </div>
      </header>

      <main className="App-main">
        {loading && <div className="loading">Chargement des invocateurs...</div>}
        
        {error && (
          <div className="error">
            <p>Erreur: {error}</p>
            <div className="error-actions">
              <button onClick={fetchSummoners}>Réessayer</button>
              <button onClick={updateSummoners} disabled={updating}>
                {updating ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <RankingTable 
            summoners={summoners}
            apiBaseUrl={API_BASE_URL}
          />
        )}
      </main>
    </div>
  );
}

export default App;