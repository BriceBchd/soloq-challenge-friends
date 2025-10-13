# 🏆 League of Legends SoloQ Challenge

Une application web full-stack pour suivre et comparer les statistiques de joueurs League of Legends en mode Solo/Duo. L'application affiche un classement en temps réel avec un style futuriste inspiré de l'univers League of Legends.

## ✨ Fonctionnalités

- 🎮 **Classement Solo/Duo** - Affichage des rangs et statistiques des joueurs
- 🔄 **Données en temps réel** - Intégration avec l'API Riot Games
- 🎨 **Interface futuriste** - Design inspiré de League of Legends avec la police Orbitron
- 📱 **Design responsive** - Compatible desktop et mobile
- 🐳 **Containerisé** - Déploiement facile avec Docker
- 📊 **Liens DPM** - Accès direct aux profils détaillés sur DPM.lol
- 💬 **Intégration Discord** - Affichage des pseudos Discord avec style authentique

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Port**: 4242
- **API REST** avec endpoints pour les données des invocateurs
- **Intégration Riot Games API** pour les statistiques de rang
- **Gestion CORS** pour les requêtes cross-origin
- **Support ES6 modules**

### Frontend (React)
- **Port**: 4243 (en production via Nginx)
- **Interface utilisateur moderne** avec composants React
- **Gestion d'état optimisée** avec cache intelligent
- **Styles CSS personnalisés** avec thème League of Legends

## 📋 Prérequis

- Docker et Docker Compose
- Clé API Riot Games (gratuite)
- Ports 4242 et 4243 disponibles

## 🚀 Installation et Démarrage

### 1. Cloner le repository
```bash
git clone <votre-repo>
cd soloqchallenge
```

### 2. Configuration de l'API Riot Games

Créez un fichier `.env` dans le dossier `server/` :
```env
RIOT_API_KEY=VOTRE_CLE_API_RIOT
NODE_ENV=production
PORT=4242
```

> 📝 **Note**: Obtenez votre clé API gratuite sur [Riot Developer Portal](https://developer.riotgames.com/)

### 3. Configuration des invocateurs

Modifiez le fichier `server/summoners.json` avec vos joueurs :
```json
[
  {
    "pseudo": "PseudoDiscord1",
    "name": "NomInvocateur",
    "tag": "EUW1",
    "puuid": "puuid-du-joueur"
  }
]
```

### 4. Démarrage avec Docker

```bash
# Construction et démarrage
docker-compose up --build

# En arrière-plan
docker-compose up -d --build
```

#### Démarrage en mode développement
- Backend
```bash
cd server
npm install
npm run dev
```

- Frontend
```bash
cd client/client
npm install
npm start
```


### 5. Accès à l'application

- **Frontend**: http://localhost:4243
- **API Backend**: http://localhost:4242

## 🔧 Développement Local

### Backend
```bash
cd server
npm install
npm start
```

### Frontend
```bash
cd client/client
npm install
npm start
```

## 📁 Structure du Projet

```
soloqchallenge/
├── docker-compose.yml          # Configuration Docker Compose
├── README.md                  # Documentation du projet
├── server/                    # Backend Node.js
│   ├── Dockerfile            # Image Docker backend
│   ├── package.json          # Dépendances backend
│   ├── server.js             # Serveur Express principal
│   ├── summoners.js          # Module gestion invocateurs
│   ├── summoners.json        # Base de données invocateurs
│   └── .env                  # Variables d'environnement
└── client/
    └── client/               # Frontend React
        ├── Dockerfile        # Image Docker frontend
        ├── package.json      # Dépendances frontend
        ├── public/           # Fichiers statiques
        └── src/              # Code source React
            ├── App.js        # Composant principal
            └── components/   # Composants React
                ├── RankingTable.js   # Tableau de classement
                └── RankingTable.css  # Styles futuristes
```

## 🌐 API Endpoints

### `GET /summoners`
Retourne la liste des invocateurs configurés et ajoute les propriétés `puuid`.

### `GET /summoners/json`
Retourne le contenu brut du fichier `summoners.json`.

### `GET /ranked/:puuid`
Retourne les statistiques de rang pour un joueur spécifique.

**Exemple de réponse:**
```json
[
  {
    "queueType": "RANKED_SOLO_5x5",
    "tier": "GOLD",
    "rank": "II",
    "leaguePoints": 45,
    "wins": 23,
    "losses": 17
  }
]
```

## 🎨 Thème et Design

L'interface utilise :
- **Police Orbitron** pour un style futuriste
- **Couleurs League of Legends** (or #c9aa71, bleu #7289da)
- **Gradients et effets** pour un rendu moderne
- **Badges Discord authentiques** pour les pseudos
- **Géométrie hexagonale** avec clip-path CSS

## 🐳 Docker

### Services
- **soloq-server**: Backend Node.js (port 4242)
- **soloq-client**: Frontend React avec Nginx (port 4243)

### Commandes utiles
```bash
# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart server

# Arrêter tout
docker-compose down

# Supprimer les volumes
docker-compose down -v
```

## 📊 Monitoring et Debug

### Logs de développement
En mode développement, l'application affiche :
- Détails des appels API dans la console
- Bouton de refresh pour recharger les données
- États de chargement pour chaque joueur

### Variables d'environnement importantes
- `NODE_ENV`: Mode de l'application (development/production)
- `RIOT_API_KEY`: Clé API Riot Games
- `PORT`: Port du serveur backend

## 🔒 Sécurité

- Les clés API sont stockées dans des variables d'environnement
- CORS configuré pour les domaines autorisés
- Pas d'exposition de données sensibles côté client

## 🚀 Déploiement en Production

Pour un déploiement en production (exemple avec Apache) :

1. **Configuration proxy Apache** :
```apache
<VirtualHost *:443>
    ServerName votre-domaine.com
    
    ProxyPass /soloq/api/ http://localhost:4242/
    ProxyPassReverse /soloq/api/ http://localhost:4242/
    
    ProxyPass /soloq/ http://localhost:4243/
    ProxyPassReverse /soloq/ http://localhost:4243/
</VirtualHost>
```

2. **Variables d'environnement production** :
```env
NODE_ENV=production
RIOT_API_KEY=votre_cle_production
```

## 📝 TODO / Améliorations Futures

- [ ] Historique des matchs
- [ ] Mode tournoi/challenge

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## ⚠️ Avertissement

Cette application utilise l'API Riot Games. Assurez-vous de respecter les [limites de taux](https://developer.riotgames.com/rate-limiting.html) et les [conditions d'utilisation](https://developer.riotgames.com/terms-of-service.html) de Riot Games.

---

**Développé avec ❤️ pour la communauté League of Legends**