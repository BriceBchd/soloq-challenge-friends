import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from "node-fetch";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGION = 'europe';
const API_KEY = process.env.RIOT_API_KEY;
const BASE_URL = `https://${REGION}.api.riotgames.com`;

export async function getSummonerByName() {
    try {
        // Retrieve summoner details from summoners.json
        const summoners = JSON.parse(fs.readFileSync(path.join(__dirname, 'summoners.json'), 'utf8'));
        const summonersListUID = [];
        
        for (const summoner of summoners) {
            const summonerUID = await fetch(`${BASE_URL}/riot/account/v1/accounts/by-riot-id/${summoner.gameName}/${summoner.tagLine}`, {
                headers: {
                    'X-Riot-Token': API_KEY
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                return data;
            });
            
            summonersListUID.push({ 
                name: summonerUID.gameName, 
                tag: summonerUID.tagLine, 
                puuid: summonerUID.puuid,
                pseudo: summoner.pseudo,
                team: summoner.team
            });

            // Optionally, add puuid to summoners.json if not already present
            await addPuuidToSummoners(summoner.gameName, summoner.tagLine, summonerUID.puuid, summoner.pseudo, summoner.team);
        }
        
        return summonersListUID;
    } catch (error) {
        console.error('Error in getSummonerByName:', error);
        throw error;
    }
}

// Add puuid in summoners.json for each summoner
async function addPuuidToSummoners(gameName, tagLine, puuid) {
    try {
        const summonersPath = path.join(__dirname, 'summoners.json');
        const summoners = JSON.parse(fs.readFileSync(summonersPath, 'utf8'));

        // Check if summoner already exists
        const existingSummoner = summoners.find(s => s.gameName === gameName && s.tagLine === tagLine);
        if (!existingSummoner) {
            console.log(`Summoner ${gameName}#${tagLine} does not exist in summoners.json`);
            return;
        } else {
            // Update puuid
            existingSummoner.puuid = puuid;
            fs.writeFileSync(summonersPath, JSON.stringify(summoners, null, 4));
            console.log(`Updated puuid for ${gameName}#${tagLine} in summoners.json`);
        }
    } catch (error) {
        console.error('Error adding puuid to summoners.json:', error);
        throw error;
    }
}

export async function getSummonersByJSON() {
    try {
        const summonersPath = path.join(__dirname, 'summoners.json');
        const summoners = JSON.parse(fs.readFileSync(summonersPath, 'utf8'));
        return summoners;
    } catch (error) {
        console.error('Error in getSummonersByJSON:', error);
        throw error;
    }
}
