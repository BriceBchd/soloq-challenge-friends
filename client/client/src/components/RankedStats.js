import React, { useState, useEffect } from 'react';
import './RankedStats.css';

const RankedStats = ({ summoner, apiBaseUrl }) => {
  const [rankedData, setRankedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (summoner?.puuid) {
      fetchRankedStats();
    }
  }, [summoner]);

  const fetchRankedStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${apiBaseUrl}/ranked/${summoner.puuid}`);
      if (!response.ok) throw new Error('Failed to fetch ranked stats');
      const data = await response.json();
      setRankedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankEmoji = (tier) => {
    const rankEmojis = {
      'IRON': '🥉',
      'BRONZE': '🥉',
      'SILVER': '🥈',
      'GOLD': '🥇',
      'PLATINUM': '💎',
      'EMERALD': '💚',
      'DIAMOND': '💎',
      'MASTER': '👑',
      'GRANDMASTER': '🌟',
      'CHALLENGER': '🚀'
    };
    return rankEmojis[tier] || '❓';
  };

  if (loading) return <div className="loading">Chargement des stats...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="ranked-stats">
      <h2>⚔️ Statistiques Ranked - {summoner.name}#{summoner.tag}</h2>
      
      {rankedData && rankedData.length > 0 ? (
        <div className="ranked-queues">
          {rankedData.map((queue, index) => (
            <div key={index} className="queue-card">
              <div className="queue-type">
                <h3>{queue.queueType === 'RANKED_SOLO_5x5' ? '🎯 Solo/Duo' : '👥 Flex'}</h3>
              </div>
              
              <div className="rank-info">
                <div className="rank-display">
                  <span className="rank-emoji">{getRankEmoji(queue.tier)}</span>
                  <span className="rank-text">
                    {queue.tier} {queue.rank}
                  </span>
                  <span className="lp">{queue.leaguePoints} LP</span>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-label">Victoires</span>
                  <span className="stat-value wins">{queue.wins}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Défaites</span>
                  <span className="stat-value losses">{queue.losses}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Winrate</span>
                  <span className="stat-value winrate">
                    {((queue.wins / (queue.wins + queue.losses)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Série</span>
                  <span className="stat-value">{queue.hotStreak ? '🔥' : '❄️'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-ranked">
          <p>Aucune donnée ranked trouvée pour cet invocateur</p>
        </div>
      )}
    </div>
  );
};

export default RankedStats;