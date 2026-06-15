<p align="center">
  <img src="https://raw.githubusercontent.com/mmilanovic4/forge/main/src/app/icon.svg" width="48" height="48" />
</p>

# Forge

A minimal Next.js boilerplate with authentication, database and a component library ready to go.

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (recommended) or PostgreSQL running locally

### Setup

1. Clone the repo

```bash
git clone https://github.com/mmilanovic4/forge.git
cd forge
```

2. Install dependencies

```bash
npm install
```

3. Create the environment file and fill in your values:

```bash
touch .env
```

See the [Environment Variables](#environment-variables) section below for the required values.

4. Start the database

```bash
docker compose up -d
```

5. Push the database schema

```bash
npx prisma db push
```

6. Generate the Prisma client

```bash
npx prisma generate
```

7. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Docker

The included `docker-compose.yml` spins up [PostgreSQL](https://www.postgresql.org/) and [Mailpit](https://mailpit.axllent.org/).

```bash
docker compose up -d    # start in background
docker compose down     # stop
docker compose down -v  # stop and delete all data
```

Mailpit web UI is available at [http://localhost:8025](http://localhost:8025).

## Environment Variables

| Variable                | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string                       |
| `BETTER_AUTH_SECRET`    | Random secret string (min 32 chars)                |
| `BETTER_AUTH_URL`       | Base URL of the app (e.g. `http://localhost:3000`) |
| `SMTP_HOST`             | SMTP server host                                   |
| `SMTP_PORT`             | SMTP server port                                   |
| `SMTP_USER`             | SMTP username (optional)                           |
| `SMTP_PASS`             | SMTP password (optional)                           |
| `SMTP_FROM`             | From email address (e.g. `noreply@example.com`)    |
| `DISCORD_CLIENT_ID`     | Discord OAuth app client ID (optional)             |
| `DISCORD_CLIENT_SECRET` | Discord OAuth app client secret (optional)         |
| `GITHUB_CLIENT_ID`      | GitHub OAuth app client ID (optional)              |
| `GITHUB_CLIENT_SECRET`  | GitHub OAuth app client secret (optional)          |
| `GOOGLE_CLIENT_ID`      | Google OAuth app client ID (optional)              |
| `GOOGLE_CLIENT_SECRET`  | Google OAuth app client secret (optional)          |

## User Roles

Forge uses two roles managed via [Better Auth](https://www.better-auth.com/)'s admin plugin:

| Role    | Description                                                   |
| ------- | ------------------------------------------------------------- |
| `user`  | Default role assigned on registration                         |
| `admin` | Full access to the admin panel and user management (`/users`) |

Admins can manage other users (ban, unban, change roles, delete) from the `/users` page. An admin cannot ban or delete their own account.

## Social Auth

GitHub, Google, and Discord OAuth are supported but not configured by default. To enable them, create OAuth apps and add your credentials to `.env`.

Replace `{APP_URL}` with your `BETTER_AUTH_URL` value (e.g. `http://localhost:3000`).

- **GitHub** — [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App
  - Homepage URL: `{APP_URL}`
  - Callback URL: `{APP_URL}/api/auth/callback/github`

- **Google** — [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth 2.0 Client ID
  - Authorized JavaScript origins: `{APP_URL}`
  - Authorized redirect URI: `{APP_URL}/api/auth/callback/google`

- **Discord** — [discord.com/developers/applications](https://discord.com/developers/applications) → New Application → OAuth2
  - Redirects: `{APP_URL}/api/auth/callback/discord`
