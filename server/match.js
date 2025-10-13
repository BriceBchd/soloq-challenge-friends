// Retrieve riot ranked lol stats for each summoner in summoners.json

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGION = 'europe';
const API_KEY = process.env.RIOT_API_KEY;
const BASE_URL = `https://${REGION}.api.riotgames.com`;

// Function to get match history for a summoner by puuid
export async function getMatchHistoryByPUUID(puuid) {
    try {
        const response = await fetch(`${BASE_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids`, {
            headers: {
                'X-Riot-Token': API_KEY
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching match history: ${response.statusText}`);
        }
        const matchIds = await response.json();
        return matchIds;
    } catch (error) {
        console.error('Error in getMatchHistory:', error);
        throw error;
    }
}

export async function getMatchHistoryForAllSummoners () {
    try {
        const summonersPath = path.join(__dirname, 'summoners.json');
        const summoners = JSON.parse(fs.readFileSync(summonersPath, 'utf8'));
        const allMatchHistories = {};

        for (const summoner of summoners) {
            if (!summoner.puuid) {
                console.warn(`Skipping summoner ${summoner.gameName}#${summoner.tagLine} due to missing puuid`);
                continue;
            }
            const matchIds = await getMatchHistoryByPUUID(summoner.puuid);
            allMatchHistories[summoner.puuid] = {
                name: summoner.gameName,
                tag: summoner.tagLine,
                matches: matchIds
            };
        }

        return allMatchHistories;
    } catch (error) {
        console.error('Error in getMatchHistoryForAllSummoners:', error);
        throw error;
    }
}


export async function getMatchDetails(matchId) {
    try {
        const response = await fetch(`${BASE_URL}/lol/match/v5/matches/${matchId}`, {
            headers: {
                'X-Riot-Token': API_KEY
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching match details: ${response.statusText}`);
        }
        const matchDetails = await response.json();
        return matchDetails;
    } catch (error) {
        console.error('Error in getMatchDetails:', error);
        throw error;
    }
}

// Function to get detailed match history for all summoners
export async function getDetailedMatchHistoryByPUUID(puuid) {
    try {
        const matchIds = await getMatchHistoryByPUUID(puuid);
        const detailedMatches = [];
        
        for (const matchId of matchIds) {
            const matchDetails = await getMatchDetails(matchId);
            detailedMatches.push(matchDetails);
        }
        return detailedMatches;
    } catch (error) {
        console.error('Error in getDetailedMatchHistoryByPUUID:', error);
        throw error;
    }
}
