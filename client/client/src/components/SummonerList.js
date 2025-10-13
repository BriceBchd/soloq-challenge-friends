import React, { useState, useEffect } from 'react';
import './SummonerList.css';

const SummonerList = ({ summoners, onSelectSummoner, selectedSummoner, apiBaseUrl }) => {
  const [rankedData, setRankedData] = useState({});
  const [loadingRanks, setLoadingRanks] = useState(false);

  useEffect(() => {
    if (summoners.length > 0) {
      fetchAllRankedData();
    }
  }, [summoners]);

  const fetchAllRankedData = async () => {
    setLoadingRanks(true);
    const rankedResults = {};
    
    for (const summoner of summoners) {
      if (summoner.puuid) {
        try {
          const response = await fetch(`${apiBaseUrl}/ranked/${summoner.puuid}`);
          if (response.ok) {
            const data = await response.json();
            // Trouve le rang Solo/Duo
            const soloQueue = data.find(queue => queue.queueType === 'RANKED_SOLO_5x5');
            rankedResults[summoner.puuid] = soloQueue;
          }
        } catch (error) {
          console.error(`Error fetching rank for ${summoner.name}:`, error);
        }
      }
    }
    
    setRankedData(rankedResults);
    setLoadingRanks(false);
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

  const formatRank = (rankedInfo) => {
    if (!rankedInfo) return 'Non classé';
    return `${getRankEmoji(rankedInfo.tier)} ${rankedInfo.tier} ${rankedInfo.rank} (${rankedInfo.leaguePoints} LP)`;
  };

  return (
    <div className="summoner-list">
      <h2>📋 Liste des Invocateurs</h2>
      <div className="summoner-grid">
        {summoners.map((summoner) => (
          <div 
            key={summoner.puuid}
            className={`summoner-card ${selectedSummoner?.puuid === summoner.puuid ? 'selected' : ''}`}
            onClick={() => onSelectSummoner(summoner)}
          >
            <div className="summoner-name">
              {summoner.name}
              <span className="summoner-tag">#{summoner.tag}</span>
            </div>
            <div className="summoner-status">
              {summoner.puuid ? '✅ Connecté' : '❌ Non trouvé'}
            </div>
            {summoner.puuid && (
              <div className="summoner-rank">
                {loadingRanks ? (
                  <span className="loading-rank">🔄 Chargement...</span>
                ) : (
                  <span className="rank-display-mini">
                    {formatRank(rankedData[summoner.puuid])}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummonerList;