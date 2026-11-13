# MindWell: Mental Wellness Journal

Privacy-first journaling app. React + Vite frontend, Node/Express + MongoDB backend.

```
mindwell/
  backend/    Express API (auth, encrypted journal, mood, export)
  frontend/   React app (journal, mood charts, breathing exercise, dark mode)
```

## Run locally (VS Code)

You need Node 18+ and a MongoDB Atlas connection string (or local MongoDB).

**Terminal 1: backend**
```
cd backend
npm install
copy .env.example .env      (Mac/Linux: cp .env.example .env)
```
Edit `.env`: set `MONGO_URI` and a long random `JWT_SECRET`. Then:
```
npm run dev
```
API runs at http://localhost:5000

**Terminal 2: frontend**
```
cd frontend
npm install
copy .env.example .env
npm run dev
```
App runs at http://localhost:5173

## Features (mapped to the brief)

| Phase | Feature |
|---|---|
| 1 | Daily guided prompt, AES-256-GCM encrypted entries, JWT auth |
| 2 | Mood + energy logger (1-10), Chart.js line chart, weekly averages (MongoDB aggregation), emotions pie chart |
| 3 | 4-7-8 breathing circle (Framer Motion), calm palette, dark mode toggle |
| 4 | Free vs premium (`isPremium` flag), JSON data export |

Free: journaling (latest 10 entries shown), mood logging, mood-over-time chart.
Premium: weekly averages, emotions chart, full history, and client-side search.
Payments are simulated: the "Unlock premium (demo)" button sets `isPremium` on the user.

## Security note (encryption strategy)

- Journal `content` is encrypted with **AES-256-GCM** (Node `crypto`) before being saved to MongoDB. Each entry gets a fresh random 12-byte IV. Stored format: `iv.authTag.ciphertext` (base64).
- The key is derived from the user's password with **scrypt** and a per-user random salt. **The key is never stored.**
- Passwords are hashed with **bcrypt** for login. bcrypt is hashing only and is not used for encryption.
- The browser keeps the password in `sessionStorage` (cleared when the tab closes) and sends it in an `x-journal-key` header over HTTPS. The server derives the key per request and discards it.
- A database admin only sees ciphertext (see the Privacy Demo below).
- **Limitations:** a forgotten password means entries cannot be recovered, and changing the password would require re-encrypting entries (not implemented). The server sees the passphrase transiently while handling a request, so this is encryption at rest, not full end-to-end encryption. Because content is encrypted, search runs in the browser after decryption.

## Privacy Demo

Add a screenshot here of a journal document in MongoDB Atlas (Browse Collections > journals). The `content` field should look like `9Ekow9uwelG9I4pJ.wbYh0aq8m0fwR9t4QLhT+A=.…`, not readable text.

## Deploy

**Backend (Render):** New Web Service, root directory `backend`, build `npm install`, start `npm start`. Add env vars `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL, no trailing slash). In Atlas, allow network access from anywhere (0.0.0.0/0).

**Frontend (Vercel):** Import the repo, root directory `frontend`, framework Vite. Add env var `VITE_API_URL` = your Render URL. `vercel.json` handles page refreshes.

## Data export

Account > Download my data returns all entries (decrypted) and mood logs as `mindwell-export.json`.
