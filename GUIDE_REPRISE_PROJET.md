# FanConnect 2030 — Guide de reprise du projet

Ce fichier explique comment **rouvrir**, **lancer** et **arrêter** le projet après une pause.
Gardez-le à la racine du dossier `FanConnect-2030`.

---

## 1. Où se trouve le projet ?

```
C:\Users\kassimi\FanConnect-2030
```

### Structure principale

| Dossier / fichier        | Rôle                                      |
|--------------------------|-------------------------------------------|
| `backend/`               | API Spring Boot (Java 21)                 |
| `frontend/`              | Interface React (Vite)                    |
| `ai-service/`            | Service IA (prédictions d'affluence)      |
| `database/`              | Scripts SQL d'initialisation              |
| `.env`                   | Variables d'environnement (backend + DB)    |
| `frontend/.env`          | Variables Vite (clé Stripe publique)      |
| `docker-compose.yml`     | PostgreSQL, pgAdmin, services Docker      |
| `scripts/`               | Scripts de démarrage et diagnostic        |

---

## 2. Prérequis (à installer une seule fois)

Avant de lancer le projet, vérifiez que ces outils sont installés :

| Outil            | Version recommandée | Vérification              |
|------------------|-----------------------|---------------------------|
| **Java**         | 21                    | `java -version`           |
| **Maven**        | 3.9+                  | `mvn -version`            |
| **Node.js**      | 18 ou 20+             | `node -version`           |
| **npm**          | inclus avec Node      | `npm -version`            |
| **Docker Desktop** | récent              | `docker --version`        |
| **Git Bash** (optionnel) | —               | pour `start-backend.sh`   |

### Diagnostic rapide (Windows)

Double-cliquez ou exécutez :

```
scripts\check-env.bat
```

Ce script vérifie Java, Maven, Docker, PostgreSQL et le port 9090.

---

## 3. Ouvrir le projet dans l'éditeur

### Avec Cursor / VS Code

1. Ouvrez **Cursor** (ou VS Code).
2. Menu **File → Open Folder**.
3. Sélectionnez : `C:\Users\kassimi\FanConnect-2030`.
4. Le projet s'ouvre avec le dossier racine visible dans l'explorateur.

### Avec le terminal intégré

- **PowerShell** ou **Git Bash** : ouvrez un terminal dans l'éditeur (`Ctrl + ù` ou Terminal → New Terminal).
- Placez-vous toujours à la racine :

```bash
cd C:/Users/kassimi/FanConnect-2030
```

---

## 4. Configuration des fichiers `.env`

### Fichier racine `.env`

Déjà présent. Il contient notamment :

- Connexion PostgreSQL (`DB_HOST`, `DB_PORT=5433`, etc.)
- Port backend (`SERVER_PORT=9090`)
- Clés Stripe (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `PAYMENT_MODE=stripe`)
- JWT, CORS, clé API football

> Si `.env` est absent, copiez `.env.example` vers `.env` et remplissez les valeurs.

### Fichier `frontend/.env`

Déjà présent. Contient :

```
VITE_API_BASE_URL=/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

> Après modification de `frontend/.env`, **redémarrez** le frontend (`npm run dev`).

---

## 5. Lancer le projet (mode développement — recommandé)

Le mode dev utilise **3 terminaux** (ou 2 si vous n'utilisez pas l'IA).

### Étape 0 — Démarrer Docker Desktop

Ouvrez **Docker Desktop** et attendez qu'il soit complètement démarré (icône verte).

---

### Terminal 1 — PostgreSQL + Backend (port 9090)

**Option A — Windows (CMD), la plus simple :**

```
scripts\start-backend.bat
```

**Option B — Git Bash :**

```bash
cd ~/FanConnect-2030
bash scripts/start-backend.sh
```

**Ce que vous devez voir :**

```
Stripe: clés standard chargées (mode stripe)
...
Started FanConnectApplication
```

> **Important :** ne fermez pas ce terminal. Si vous voyez `BUILD SUCCESS` puis le prompt `$` sans `Started FanConnectApplication`, le serveur n'est pas lancé.

**Ne lancez PAS** `mvn spring-boot:run` depuis la racine du projet — allez dans `backend/` ou utilisez les scripts ci-dessus qui chargent `.env` automatiquement.

---

### Terminal 2 — Frontend (port 5173)

```bash
cd C:/Users/kassimi/FanConnect-2030/frontend

# Première fois seulement (ou après suppression de node_modules) :
npm install

npm run dev
```

Ouvrez le navigateur : **http://localhost:5173**

---

### Terminal 3 — Service IA (optionnel, port 8000)

Recommandé pour les recommandations et prédictions d'affluence :

```
scripts\start-ai-service.bat
```

Ou manuellement :

```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 6. Ports et URLs utiles

| Service              | Port  | URL                                              |
|----------------------|-------|--------------------------------------------------|
| Frontend (Vite)      | 5173  | http://localhost:5173                            |
| Backend API          | 9090  | http://localhost:9090/api                        |
| Swagger (doc API)    | 9090  | http://localhost:9090/api/swagger-ui.html        |
| PostgreSQL (Docker)  | 5433  | localhost:5433 (évite conflit avec XAMPP/5432)   |
| pgAdmin (optionnel)  | 5050  | http://localhost:5050                            |
| Service IA           | 8000  | http://localhost:8000/health                     |

### Vérifier que le backend répond

Dans le navigateur ou avec curl :

```
http://localhost:9090/api/payments/config
```

Réponse attendue (paiement Stripe actif) :

```json
{
  "data": {
    "stripeEnabled": true,
    "publishableKey": "pk_test_...",
    "mode": "stripe"
  }
}
```

---

## 7. Comptes de test

### Administrateur (créé automatiquement au 1er démarrage)

| Champ     | Valeur                 |
|-----------|------------------------|
| Email     | `admin@fanconnect.com` |
| Mot de passe | `admin123`          |

### Fan / propriétaire

Créez un compte via l'interface **Inscription** sur http://localhost:5173

---

## 8. Paiement Stripe (mode test)

À l'étape **7. Paiement** du wizard de réservation, vous devez voir le **formulaire carte Stripe**.

Carte de test :

| Champ   | Valeur                |
|---------|-----------------------|
| Numéro  | `4242 4242 4242 4242` |
| Date    | n'importe quelle date future|
| CVC     | 3 chiffres quelconques |

Si vous voyez « Dev : paiement simulé » au lieu du formulaire carte :

1. Vérifiez que `.env` contient `PAYMENT_MODE=stripe` et les clés `pk_test` / `sk_test`.
2. Relancez le backend avec `scripts\start-backend.bat` ou `bash scripts/start-backend.sh`.
3. Redémarrez le frontend.

---

## 9. Arrêter le projet (pause)

### Arrêter les serveurs

Dans chaque terminal ouvert :

- Appuyez sur **`Ctrl + C`** pour arrêter backend, frontend ou service IA.

### Arrêter PostgreSQL (Docker)

À la racine du projet :

```bash
docker compose stop postgres
```

Pour tout arrêter (postgres + pgAdmin + autres services Docker) :

```bash
docker compose down
```

> `docker compose down` **ne supprime pas** vos données — elles restent dans le volume Docker `postgres_data`.

### Fermer l'éditeur

Fermez Cursor/VS Code normalement. Aucune action supplémentaire requise.

---

## 10. Reprendre après une pause (checklist rapide)

```
[ ] 1. Ouvrir Docker Desktop
[ ] 2. Ouvrir le dossier FanConnect-2030 dans Cursor
[ ] 3. Terminal 1 : scripts\start-backend.bat  (ou bash scripts/start-backend.sh)
[ ] 4. Attendre "Started FanConnectApplication"
[ ] 5. Terminal 2 : cd frontend && npm run dev
[ ] 6. (Optionnel) Terminal 3 : scripts\start-ai-service.bat
[ ] 7. Navigateur : http://localhost:5173
```

Temps de démarrage habituel : **1 à 3 minutes** (Maven compile au premier lancement).

---

## 11. Problèmes fréquents

### « No plugin found for prefix spring-boot »

Vous êtes dans le mauvais dossier. Utilisez `scripts\start-backend.bat` ou :

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Backend s'arrête juste après BUILD SUCCESS

Vous avez lancé `mvn package` ou `mvn compile` au lieu de `spring-boot:run`.
Utilisez les scripts dans `scripts/`.

### Erreur de connexion PostgreSQL / port 5432

Le projet utilise le port **5433** (voir `.env`). Vérifiez :

```bash
docker compose up postgres -d
docker exec fanconnect-postgres pg_isready -U fanconnect -d fanconnect
```

### Swagger / API : connexion refusée

Le backend n'est pas démarré ou pas sur le port 9090. Vérifiez le terminal backend.

### Écran noir au frontend

Videz le cache navigateur ou ouvrez en navigation privée. Vérifiez la console (F12).

### Paiement simulé au lieu de Stripe

Le backend n'a pas chargé `.env`. Relancez avec `scripts\start-backend.bat`.

### Port 9090 déjà utilisé

```bash
netstat -ano | findstr :9090
```

Fermez le processus qui occupe le port, ou changez `SERVER_PORT` dans `.env`.

### Erreur Flyway / migration

```bash
scripts\repair-flyway.bat
```

Puis relancez le backend.

---

## 12. Mode Docker complet (alternative)

Pour tout lancer via Docker (production-like) :

```bash
docker compose up --build
```

| Service   | URL par défaut        |
|-----------|-----------------------|
| Frontend  | http://localhost:80   |
| Backend   | http://localhost:8080/api |

> En mode dev local, préférez les scripts `start-backend.bat` + `npm run dev` (hot-reload plus rapide).

---

## 13. Commandes utiles

```bash
# Compiler le backend sans lancer
cd backend && mvn clean compile -DskipTests

# Tests backend
cd backend && mvn test

# Build frontend production
cd frontend && npm run build

# Logs backend (fichier)
# backend/logs/backend-dev.log

# Voir les conteneurs Docker actifs
docker ps
```

---

## 14. Fichiers de référence

| Fichier                              | Description                        |
|--------------------------------------|------------------------------------|
| `GUIDE_REPRISE_PROJET.md`            | Ce guide                           |
| `.env.example`                       | Modèle des variables d'environnement |
| `scripts/start-backend.bat`          | Démarrage backend Windows          |
| `scripts/start-backend.sh`           | Démarrage backend Git Bash         |
| `scripts/start-ai-service.bat`       | Démarrage service IA               |
| `scripts/check-env.bat`              | Diagnostic environnement           |
| `scripts/repair-flyway.bat`          | Réparation migrations DB           |

---

*Dernière mise à jour : juin 2026 — FanConnect 2030*