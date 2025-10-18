import React, { useState, useEffect, useCallback } from 'react';
import './RankingTable.css';

const RankingTable = ({ summoners, apiBaseUrl }) => {
  const [rankedData, setRankedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchedSummoners, setFetchedSummoners] = useState(new Set());

  // Fonction pour créer une clé unique pour un summoner
  const getSummonerKey = useCallback((summoner) => {
    return `${summoner.name}-${summoner.tag}-${summoner.puuid}`;
  }, []);

  // Vérifier si nous avons déjà les données pour ces summoners
  const needsUpdate = useCallback(() => {
    if (summoners.length === 0) return false;
    
    const currentKeys = new Set(summoners.map(getSummonerKey));
    const fetchedKeys = fetchedSummoners;
    
    // Vérifier si nous avons de nouveaux summoners ou si les données sont manquantes
    for (const key of currentKeys) {
      if (!fetchedKeys.has(key)) {
        return true;
      }
    }
    return false;
  }, [summoners, fetchedSummoners, getSummonerKey]);

  useEffect(() => {
    if (summoners.length > 0 && needsUpdate()) {
      fetchAllData();
    }
  }, [summoners, needsUpdate]);

  const fetchAllData = async () => {
    if (loading) return; // Éviter les requêtes concurrentes
    
    setLoading(true);
    const rankedResults = { ...rankedData }; // Conserver les données existantes
    const newFetchedSummoners = new Set(fetchedSummoners);
    
    for (const summoner of summoners) {
      const summonerKey = getSummonerKey(summoner);
      
      // Skip si nous avons déjà les données pour ce summoner
      if (fetchedSummoners.has(summonerKey) && rankedResults[summoner.puuid]) {
        continue;
      }
      
      if (summoner.puuid) {
        try {
          console.log(`Fetching ranked data for ${summoner.name}#${summoner.tag}`);
          
          // Fetch ranked data only
          const rankedResponse = await fetch(`${apiBaseUrl}/ranked/${summoner.puuid}`);
          if (rankedResponse.ok) {
            const rankedData = await rankedResponse.json();
            const soloQueue = rankedData.find(queue => queue.queueType === 'RANKED_SOLO_5x5');
            rankedResults[summoner.puuid] = soloQueue;
            newFetchedSummoners.add(summonerKey);
          }
        } catch (error) {
          console.error(`Error fetching data for ${summoner.name}:`, error);
        }
      }
    }
    
    setRankedData(rankedResults);
    setFetchedSummoners(newFetchedSummoners);
    setLoading(false);
  };

  // Fonction pour forcer le refresh des données
  const refreshData = useCallback(() => {
    setRankedData({});
    setFetchedSummoners(new Set());
    // fetchAllData sera appelé automatiquement via useEffect
  }, []);

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

  const getRankValue = (rankedInfo) => {
    if (!rankedInfo) return 0;
    
    const tierValues = {
      'IRON': 1,
      'BRONZE': 2,
      'SILVER': 3,
      'GOLD': 4,
      'PLATINUM': 5,
      'EMERALD': 6,
      'DIAMOND': 7,
      'MASTER': 8,
      'GRANDMASTER': 9,
      'CHALLENGER': 10
    };

    const rankValues = {
      'IV': 1,
      'III': 2,
      'II': 3,
      'I': 4
    };

    const tierValue = tierValues[rankedInfo.tier] || 0;
    const rankValue = rankValues[rankedInfo.rank] || 0;
    const lpValue = rankedInfo.leaguePoints || 0;

    return tierValue * 1000 + rankValue * 100 + lpValue;
  };

  const formatRank = (rankedInfo) => {
    if (!rankedInfo) return { display: 'Non classé', tier: 'UNRANKED' };
    return {
      display: `${rankedInfo.tier} ${rankedInfo.rank}`,
      tier: rankedInfo.tier,
      lp: rankedInfo.leaguePoints
    };
  };

  const formatWinRate = (rankedInfo) => {
    if (!rankedInfo || (!rankedInfo.wins && !rankedInfo.losses)) return 'N/A';
    const total = rankedInfo.wins + rankedInfo.losses;
    const winRate = (rankedInfo.wins / total * 100).toFixed(1);
    
    return (
      <>
        <span className="wins">{rankedInfo.wins}W</span>{' '}
        <span className="losses">{rankedInfo.losses}L</span>
        <span className="winrate-percentage">{winRate}%</span>
      </>
    );
  };

  const getDpmLink = (summonerName, summonerTag) => {
    // Encoder les caractères spéciaux pour l'URL
    const encodedName = encodeURIComponent(summonerName);
    const encodedTag = encodeURIComponent(summonerTag);
    return `https://dpm.lol/${encodedName}%20-${encodedTag}`;
  };

  // Trier les invocateurs par rang
  const sortedSummoners = [...summoners].sort((a, b) => {
    const rankA = getRankValue(rankedData[a.puuid]);
    const rankB = getRankValue(rankedData[b.puuid]);
    return rankB - rankA; // Tri décroissant (meilleur rang en premier)
  });

  if (loading && Object.keys(rankedData).length === 0) {
    return <div className="loading">Chargement du classement...</div>;
  }

  return (
    <div className="ranking-table">
      <div className="table-header">
        <h2>🏆 Classement Solo/Duo</h2>
        {process.env.NODE_ENV === 'development' && (
          <button 
            onClick={refreshData}
            className="refresh-button"
            style={{
              background: 'rgba(200, 170, 113, 0.2)',
              border: '1px solid rgba(200, 170, 113, 0.5)',
              color: '#c9aa71',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              marginLeft: '1rem'
            }}
          >
            🔄 Refresh
          </button>
        )}
      </div>
      
      <div className="table-container">
        <table className="ranking-table-content">
          <thead>
            <tr>
              <th className="rank-col">#</th>
              <th className="pseudo-col">Discord</th>
              <th className="team-col">Team</th>
              <th className="summoner-col">Invocateur</th>
              <th className="tier-col">Rang</th>
              <th className="lp-col">LP</th>
              <th className="winrate-col">W/L Ratio</th>
              <th className="profile-col">Profil</th>
            </tr>
          </thead>
          <tbody>
            {sortedSummoners.map((summoner, index) => {
              const rankedInfo = rankedData[summoner.puuid];
              const rank = formatRank(rankedInfo);
              const dpmLink = getDpmLink(summoner.name, summoner.tag);
              const isLoading = loading && !rankedInfo;
              
              return (
                <tr key={summoner.puuid} className="summoner-row">
                  <td className="rank-cell">
                    <span className="position">{index + 1}</span>
                  </td>
                  
                  <td className="pseudo-cell">
                    <div className="pseudo-info">
                      <span className="pseudo-name">
                        {summoner.pseudo || 'N/A'}
                      </span>
                    </div>
                  </td>

                  <td className="team-cell">
                    {summoner.team ? (
                      <span className={`team-badge ${summoner.team}`}>
                        {summoner.team === 'blue' ? '🔵 BLUE' : '🔴 RED'}
                      </span>
                    ) : (
                      <span className="no-team">-</span>
                    )}
                  </td>
                  
                  <td className="summoner-cell">
                    <div className="summoner-info">
                      <span className="summoner-name">{summoner.name}</span>
                      <span className="summoner-tag">#{summoner.tag}</span>
                    </div>
                  </td>
                  
                  <td className="tier-cell">
                    {isLoading ? (
                      <span className="loading-cell">⏳</span>
                    ) : (
                      <div className="rank-display">
                        <span className="rank-emoji">
                          {getRankEmoji(rank.tier)}
                        </span>
                        <span className="rank-text">{rank.display}</span>
                      </div>
                    )}
                  </td>
                  
                  <td className="lp-cell">
                    {isLoading ? (
                      <span className="loading-cell">⏳</span>
                    ) : (
                      <span className="lp-value">
                        {rankedInfo ? `${rankedInfo.leaguePoints} LP` : 'N/A'}
                      </span>
                    )}
                  </td>
                  
                  <td className="winrate-cell">
                    {isLoading ? (
                      <span className="loading-cell">⏳</span>
                    ) : (
                      <span className="winrate-value">
                        {formatWinRate(rankedInfo)}
                      </span>
                    )}
                  </td>
                  
                  <td className="profile-cell">
                    <a 
                      href={dpmLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="dpm-link"
                      title={`Voir le profil de ${summoner.name}#${summoner.tag} sur DPM`}
                    >
                      📊 DPM
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {loading && Object.keys(rankedData).length > 0 && (
        <div className="partial-loading">
          Mise à jour des données en cours...
        </div>
      )}
    </div>
  );
};

export default RankingTable;