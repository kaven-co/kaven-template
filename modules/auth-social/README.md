# auth-social

Adds Google OAuth social login to your Kaven project. Provides `/auth/google` and `/auth/google/callback` routes, a `SocialAccount` Prisma model, and React components for login buttons.

## Required env vars

- `APP_URL` — base URL of your app (e.g. `https://myapp.com`)
- `GOOGLE_CLIENT_ID` — from Google Cloud Console OAuth credentials
- `GOOGLE_CLIENT_SECRET` — from Google Cloud Console OAuth credentials

## Install

```bash
kaven module install auth-social
```
