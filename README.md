# 🎓 Projet de Fin d’Année — M1  
## 💻 PlaceXam

### 🧭 Thème  
**Gestion de place aux salles d'examen**

### 🧠 Description  
**PlaceXam** est une application web permettant de gérer la répartition automatique des étudiants dans les salles d’examen.  
L’objectif principal est de faciliter l’organisation logistique des examens en attribuant les places de manière optimisée, tout en prenant en compte les contraintes telles que :  
- La capacité de chaque salle  
- Les filières ou matières différentes  
- L’évitement des doublons ou tricheries potentielles  
- La génération automatique de plans de salle et listes d’affectation  

---

## 🗂️ Structure du projet  

### 📁 Dossier global
PlaceXam/<br>
├── backend/<br>
├── frontend/<br>
└── README.md<br>

---

### 🧩 Structure du dossier FRONTEND
frontend/<br>
│<br>
├── public/<br>
├── src/<br>
│ ├── assets/<br>
│ ├── components/<br>
│ ├── contexts/<br>
│ ├── pages/<br>
│ ├── utils/<br>
│ ├── App.jsx<br>
│ ├── index.css<br>
│ └── main.jsx<br>
│<br>
├── .env.local *(A créer et remplir soi-même par rapport à l'exemple)*<br>
├── .env.example<br>
├── package.json<br>
└── vite.config.js

---

### ⚙️ Structure du dossier BACKEND
backend/<br>
│<br>
├── src/<br>
│ ├── config/<br>
│ ├── controllers/<br>
│ ├── models/<br>
│ ├── routes/<br>
│ └── services/<br>
│<br>
├── .env.local *(A créer et remplir soi-même par rapport à l'exemple)*<br>
├── .env.example<br>
├── package.json<br>
└── server.js


---

## 📦 Modules installés

### 🔹 FRONTEND

| Nom du module | Type | Description |
|----------------|-------|-------------|
| `@tailwindcss/vite` | Dépendance | Intégration de Tailwind CSS avec Vite |
| `clsx` | Dépendance | Gestion conditionnelle des classes CSS |
| `react` | Dépendance | Bibliothèque principale pour construire l’interface utilisateur |
| `react-dom` | Dépendance | Intégration de React avec le DOM |
| `react-router-dom` | Dépendance | Gestion du routage côté client |
| `tailwind-merge` | Dépendance | Fusion intelligente de classes Tailwind |
| `tailwindcss` | Dépendance | Framework CSS utilitaire pour le design |
| `axios` | Pour les appels API HTTP |
| `lucide-react` | Icônes vectorielles |
| `@eslint/js` | DevDependency | Règles ESLint pour JavaScript |
| `@types/react` | DevDependency | Définitions de types TypeScript pour React |
| `@types/react-dom` | DevDependency | Définitions de types TypeScript pour React DOM |
| `@vitejs/plugin-react-swc` | DevDependency | Plugin Vite optimisé pour React avec SWC |
| `eslint` | DevDependency | Analyseur de code pour maintenir une qualité de code |
| `eslint-plugin-react-hooks` | DevDependency | Règles ESLint pour les hooks React |
| `eslint-plugin-react-refresh` | DevDependency | Intégration du rechargement à chaud avec React |
| `globals` | DevDependency | Ensemble de variables globales pour ESLint |
| `vite` | DevDependency | Outil de build et serveur de développement rapide |

---

### 🔹 BACKEND

| Nom du module | Type | Description |
|----------------|-------|-------------|
| `bcrypt` | Dépendance | Hachage sécurisé des mots de passe |
| `cors` | Dépendance | Gestion des requêtes cross-origin |
| `dotenv` | Dépendance | Chargement des variables d’environnement |
| `express` | Dépendance | Framework web minimaliste pour Node.js |
| `jsonwebtoken` | Dépendance | Gestion et vérification des tokens JWT |
| `nodemon` | DevDependency | Redémarrage automatique du serveur en développement |
| `prettier` | DevDependency | Outil de formatage de code |
| `sequelize` | Dépendance | ORM pour interagir avec des bases SQL |
| `sequelize-cli` | DevDependency | Outil pour générer des modèles, migrations et seeds |
| `mysql2` | Dépendance | Pilote utilisé pour établir la connexion avec MySQL |


---

## 🚀 Lancement du projet  

### ▶️ Démarrage
```bash
# Installation des dépendances
cd frontend && npm install
cd ../backend && npm install

# Lancer le backend
npm run dev

# Lancer le frontend
npm run dev

---

Le contenu sera modifée tout au long du processus de développement pour être adapter comme il se doit.




