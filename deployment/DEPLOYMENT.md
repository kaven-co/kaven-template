# Production Deployment

## Setup

1. Database: Neon (PostgreSQL)
2. API: Railway
3. Frontend: Vercel

## Deploy API

```bash
railway up --service api
```

## Deploy Admin

```bash
cd apps/admin && vercel --prod
```
