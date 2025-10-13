// Retrieve riot ranked lol stats for each summoner in summoners.json

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGION = 'euw1';
const API_KEY = process.env.RIOT_API_KEY;
const BASE_URL = `https://${REGION}.api.riotgames.com`;

// Function to get ranked stats for a summoner by puuid
export async function getRankedStatsByPuuid(puuid) {
    try {
        const response = await fetch(`${BASE_URL}/lol/league/v4/entries/by-puuid/${puuid}`, {
            headers: {
                'X-Riot-Token': API_KEY
            }
        });
        if (!response.ok) {
            throw new Error(`Error fetching ranked stats: ${response.statusText}`);
        }
        const rankedStats = await response.json();
        return rankedStats;
    } catch (error) {
        console.error('Error in getRankedStatsByPuuid:', error);
        throw error;
    }
}

export async function getAllRankedStats() {
    try {
        const summonersPath = path.join(__dirname, 'summoners.json');
        const summoners = JSON.parse(fs.readFileSync(summonersPath, 'utf8'));
        const allRankedStats = [];

        for (const summoner of summoners) {
            if (!summoner.puuid) {
                console.warn(`Skipping summoner ${summoner.gameName}#${summoner.tagLine} due to missing puuid`);
                continue;
            }
            const rankedStats = await getRankedStatsByPuuid(summoner.puuid);
            allRankedStats.push({
                name: summoner.gameName,
                tag: summoner.tagLine,
                puuid: summoner.puuid,
                rankedStats
            });
        }

        return allRankedStats;
    } catch (error) {
        console.error('Error in getAllRankedStats:', error);
        throw error;
    }
}
