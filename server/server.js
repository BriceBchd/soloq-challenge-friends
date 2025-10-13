import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { getSummonerByName, getSummonersByJSON } from './summoners.js';
import { getRankedStatsByPuuid, getAllRankedStats } from './ranked.js';
import { getDetailedMatchHistoryByPUUID } from './match.js';

const app = express();
const PORT = process.env.PORT || 4244;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

app.get('/summoners', async (req, res) => {
    try {
        const summonersData = await getSummonerByName();
        res.json(summonersData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load summoners', details: error.message });
    }
});

app.get('/summoners/json', async (req, res) => {
    try {
        const SummonersData = await getSummonersByJSON();
        res.json(SummonersData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load summoners from JSON', details: error.message });
    }
});

app.get('/ranked/:puuid', async (req, res) => {
    const { puuid } = req.params;
    try {
        const rankedStats = await getRankedStatsByPuuid(puuid);
        res.json(rankedStats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load ranked stats', details: error.message });
    }
});

app.get('/ranked', async (req, res) => {
    try {
        const summonersData = await getAllRankedStats();
        res.json(summonersData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load all ranked stats', details: error.message });
    }
});


app.get('/matches/:puuid', async (req, res) => {
    const { puuid } = req.params;
    try {
        const detailedMatchHistory = await getDetailedMatchHistoryByPUUID(puuid);
        res.json(detailedMatchHistory);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load detailed match history', details: error.message });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});