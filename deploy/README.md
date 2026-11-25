# Deploying FleetGuard AI (free demo stack)

| Part | Host | Free-tier limit |
|---|---|---|
| Frontend (`frontend/`) | Vercel | none that matters for a demo |
| API (`backend/`) | Render web service | sleeps after 15 minutes idle; first request takes about a minute |
| Database | Supabase Postgres (`fleetguard-ai`, Singapore) | 500 MB; project pauses after a week with no activity |
| AI service (`fleetguard-ai-service/`) | Hugging Face Docker Space | sleeps after 48 hours idle; 2 vCPU, 16 GB RAM |

Render's free plan has no persistent disk. Demo photos are downloaded at every
build, but photos uploaded through the app disappear when the API restarts.
Moving uploads to Supabase Storage fixes that.

## 1. Database (done)

The schema, migrations 001–004 and the demo data are loaded. Row Level Security
is on for every table with no policies, so Supabase's public REST API returns
nothing. The API connects as `postgres`, which bypasses RLS.

Demo logins (password `Demo123!`): `driver1@demo.fleetguard.com`,
`manager1@demo.fleetguard.com`, `admin@demo.fleetguard.com`.

Connection string for Render: Supabase dashboard → project `fleetguard-ai` →
Connect → **Session pooler** (Render has no IPv6, so the direct connection does
not work). Reset the database password under Project Settings → Database if you
do not have it.

## 2. AI service → Hugging Face

1. Create a Hugging Face access token with **write** scope.
2. In this GitHub repo: Settings → Secrets and variables → Actions.
   - Secret `HF_TOKEN` = the token.
   - Variable `HF_SPACE` = `<your-hf-username>/fleetguard-ai`.
3. Actions → "Deploy AI service to Hugging Face" → Run workflow.
4. The Space URL is `https://<your-hf-username>-fleetguard-ai.hf.space`.
   Check `/api/health`.

## 3. API → Render

1. Render → New → Blueprint → this repo. Render reads `render.yaml`.
2. Fill in `DATABASE_URL`, `FRONTEND_URL` (the Vercel URL from step 4, comma
   separated if more than one), `AI_SERVICE_URL` (step 2). Leave Google and email
   empty if you do not use them.
3. Check `https://fleetguard-api.onrender.com/api/health`.

## 4. Frontend → Vercel

1. Vercel → Add New → Project → this repo, Root Directory `frontend`.
2. Environment variable `VITE_API_URL` = `https://fleetguard-api.onrender.com/api`.
   Optional: `VITE_GOOGLE_MAPS_API_KEY`, `VITE_GOOGLE_CLIENT_ID`.
3. Put the Vercel URL into Render's `FRONTEND_URL`, then redeploy the API.
