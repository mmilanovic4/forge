<p align="center">
  <img src="https://raw.githubusercontent.com/mmilanovic4/forge/main/src/app/icon.svg" width="48" height="48" />
</p>

# Forge

A minimal Next.js boilerplate with authentication, database and a component library ready to go.

## Prerequisites

- Node.js 18+
- Docker (recommended) or PostgreSQL running locally

## Setup

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
npm run db:push
```

6. Generate the Prisma client

```bash
npm run prisma:generate
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

| Variable                  | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `DATABASE_URL`            | PostgreSQL connection string                          |
| `BETTER_AUTH_SECRET`      | Random secret string (min 32 chars)                   |
| `BETTER_AUTH_URL`         | Base URL of the app (e.g. `http://localhost:3000`)    |
| `SMTP_HOST`               | SMTP server host (optional)                           |
| `SMTP_PORT`               | SMTP server port (optional)                           |
| `SMTP_USER`               | SMTP username (optional)                              |
| `SMTP_PASS`               | SMTP password (optional)                              |
| `SMTP_FROM`               | From email address (optional)                         |
| `NEXT_PUBLIC_AUTH_METHOD` | Login method (optional) [`otp`, `magic-link`]         |
| `DISCORD_CLIENT_ID`       | Discord OAuth app client ID (optional)                |
| `DISCORD_CLIENT_SECRET`   | Discord OAuth app client secret (optional)            |
| `GITHUB_CLIENT_ID`        | GitHub OAuth app client ID (optional)                 |
| `GITHUB_CLIENT_SECRET`    | GitHub OAuth app client secret (optional)             |
| `GOOGLE_CLIENT_ID`        | Google OAuth app client ID (optional)                 |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth app client secret (optional)             |
| `S3_BUCKET`               | Bucket name for file uploads (optional)               |
| `S3_REGION`               | Bucket region (optional)                              |
| `S3_ACCESS_KEY_ID`        | S3 access key ID (optional)                           |
| `S3_SECRET_ACCESS_KEY`    | S3 secret access key (optional)                       |
| `S3_ENDPOINT`             | Custom endpoint for S3-compatible services (optional) |

## Auth Method

Forge supports three login methods, controlled via the `NEXT_PUBLIC_AUTH_METHOD` environment variable:

| Value        | Description                                                     |
| ------------ | --------------------------------------------------------------- |
| `otp`        | Passwordless login via a one-time code sent to the user's email |
| `magic-link` | Passwordless login via a sign-in link sent to the user's email  |

If `NEXT_PUBLIC_AUTH_METHOD` is not set, Forge defaults to password-based authentication.

> **Note:** Both `otp` and `magic-link` require SMTP to be configured, as they rely on email delivery.

## Passkeys

Passkeys (WebAuthn / FIDO2) are supported out of the box and are **additive** — they sit alongside whatever primary login method is configured (`otp`, `magic-link` or password), rather than replacing it. A single account can have a password (or email login) and one or more passkeys at the same time.

There are two ways to sign in with a passkey on the login screen, both of which work **without typing an email**:

- **Autofill (conditional UI)** — when the browser has a saved passkey, it offers it directly from the email field, so the user signs in with a single tap.
- **"Sign in with a passkey" button** — an explicit fallback for browsers or situations where autofill doesn't trigger.
  Users add and remove passkeys from their account settings while signed in. Passkeys work with both platform authenticators (Touch ID, Face ID, Windows Hello, Android biometrics) and roaming security keys (e.g. YubiKey); the browser lets the user choose.

A few things to know:

- WebAuthn requires a **secure context**. In production the app must be served over HTTPS; `localhost` is exempt for local development.
- Passkey sign-in is a passwordless (non-credential) path, so it is **not** gated by the two-factor challenge by default — a passkey login completes in one step.

## User Roles

Forge uses two roles managed via [Better Auth](https://www.better-auth.com/)'s admin plugin:

| Role    | Description                                                   |
| ------- | ------------------------------------------------------------- |
| `user`  | Default role assigned on registration                         |
| `admin` | Full access to the admin panel and user management (`/users`) |

Admins can manage other users (ban, unban, change roles, delete) from the `/users` page. An admin cannot ban or delete their own account.

## Social Auth

GitHub, Google and Discord OAuth are supported but not configured by default. To enable them, create OAuth apps and add your credentials to `.env`.

Replace `{APP_URL}` with your `BETTER_AUTH_URL` value (e.g. `http://localhost:3000`).

- **Discord** — [discord.com/developers/applications](https://discord.com/developers/applications) → New Application → OAuth2
  - Redirects: `{APP_URL}/api/auth/callback/discord`

- **GitHub** — [github.com/settings/developers](https://github.com/settings/developers) → New OAuth App
  - Homepage URL: `{APP_URL}`
  - Callback URL: `{APP_URL}/api/auth/callback/github`

- **Google** — [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth 2.0 Client ID
  - Authorized JavaScript origins: `{APP_URL}`
  - Authorized redirect URI: `{APP_URL}/api/auth/callback/google`

## File Storage

File uploads (such as profile avatars) are stored in any S3-compatible object storage — [AWS S3](https://aws.amazon.com/s3/), [Cloudflare R2](https://developers.cloudflare.com/r2/), [MinIO](https://min.io/) and others, all work with the same variables.

For local development, the included `docker-compose.yml` runs MinIO and creates the bucket automatically. Add the following to `.env`:

```bash
S3_BUCKET=forge-uploads
S3_REGION=eu-central-raccoon-city
S3_ACCESS_KEY_ID=forge
S3_SECRET_ACCESS_KEY=forgeforge
S3_ENDPOINT=http://localhost:9000
```
