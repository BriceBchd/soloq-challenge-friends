import React, { useState, useEffect } from 'react';
import './MatchHistory.css';

const MatchHistory = ({ summoner, apiBaseUrl }) => {
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (summoner?.puuid) {
      // Réinitialiser les données quand on change d'invocateur
      setMatchData(null);
      setError(null);
      fetchMatchHistory();
    }
  }, [summoner?.puuid]); // Dépendance sur le puuid spécifiquement

  const fetchMatchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiBaseUrl}/matches/${summoner.puuid}`);
      if (!response.ok) throw new Error('Failed to fetch match history');
      const data = await response.json();
      setMatchData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatGameDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getGameResult = (win) => {
    return win ? { text: 'VICTOIRE', emoji: '🏆', class: 'victory' } : { text: 'DÉFAITE', emoji: '💀', class: 'defeat' };
  };

  const formatKDA = (kills, deaths, assists) => {
    const kda = deaths === 0 ? kills + assists : ((kills + assists) / deaths).toFixed(2);
    return { kda, kills, deaths, assists };
  };

  const getQueueName = (queueId) => {
    const queueNames = {
      420: 'Classé Solo/Duo',
      440: 'Classé Flex',
      400: 'Draft Normal',
      430: 'Normale Aveugle',
      450: 'ARAM',
      900: 'URF',
      1020: 'One for All'
    };
    return queueNames[queueId] || `Queue ${queueId}`;
  };

  if (loading) return <div className="loading">Chargement de l'historique...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="match-history">
      <h2>⚔️ Historique des Matchs - {summoner.name}#{summoner.tag}</h2>
      
      {matchData && matchData.length > 0 ? (
        <div className="matches-container">
          {matchData.slice(0, 20).map((match, index) => {
            // Vérification de sécurité pour s'assurer que match.info et participants existent
            if (!match.info || !match.info.participants) {
              console.warn(`Match ${index} has invalid structure:`, match);
              return null;
            }

            const player = match.info.participants.find(p => p.puuid === summoner.puuid);
            
            // Vérification de sécurité pour s'assurer que le joueur est trouvé
            if (!player) {
              console.warn(`Player not found in match ${index} for puuid:`, summoner.puuid);
              return null;
            }

            const result = getGameResult(player.win);
            const kda = formatKDA(player.kills, player.deaths, player.assists);

            return (
              <div key={index} className={`match-card ${result.class}`}>
                <div className="match-header">
                  <div className="game-result">
                    <span className="result-emoji">{result.emoji}</span>
                    <span className="result-text">{result.text}</span>
                  </div>
                  <div className="game-info">
                    <span className="queue-type">{getQueueName(match.info.queueId) || match.info.gameMode}</span>
                    <span className="game-duration">{formatGameDuration(match.info.gameDuration)}</span>
                  </div>
                </div>

                <div className="match-content">
                  <div className="champion-info">
                    <div className="champion-name">{player.championName}</div>
                    <div className="champion-level">Niveau {player.champLevel}</div>
                  </div>

                  <div className="kda-section">
                    <div className="kda-display">
                      <span className="kills">{kda.kills}</span>
                      <span className="separator">/</span>
                      <span className="deaths">{kda.deaths}</span>
                      <span className="separator">/</span>
                      <span className="assists">{kda.assists}</span>
                    </div>
                    <div className="kda-ratio">KDA: {kda.kda}</div>
                  </div>

                  <div className="match-stats">
                    <div className="stat">
                      <span className="stat-label">CS</span>
                      <span className="stat-value">{(player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Dégâts</span>
                      <span className="stat-value">{((player.totalDamageDealtToChampions || 0) / 1000).toFixed(1)}k</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Vision</span>
                      <span className="stat-value">{player.visionScore || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Or</span>
                      <span className="stat-value">{((player.goldEarned || 0) / 1000).toFixed(1)}k</span>
                    </div>
                  </div>

                  <div className="items-section">
                    <div className="items-title">Items:</div>
                    <div className="items-list">
                      {[player.item0, player.item1, player.item2, player.item3, player.item4, player.item5, player.item6]
                        .filter(item => item && item !== 0)
                        .map((item, idx) => (
                          <span key={idx} className="item-id">{item}</span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          }).filter(Boolean)} {/* Filtre les éléments null */}
        </div>
      ) : (
        <div className="no-matches">
          <p>Aucun match trouvé pour cet invocateur</p>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;