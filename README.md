<p align="center">
  <img src="https://raw.githubusercontent.com/mmilanovic4/forge/main/src/app/icon.svg" width="48" height="48" />
</p>

# Forge

A minimal Next.js boilerplate with authentication, database and a component library ready to go.

![Forge Dashboard](/docs/dashboard.jpg)

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

| Variable                  | Required | Description                                        |
| ------------------------- | :------: | -------------------------------------------------- |
| `DATABASE_URL`            |    ✅    | PostgreSQL connection string                       |
| `BETTER_AUTH_SECRET`      |    ✅    | Random secret string (min 32 chars)                |
| `BETTER_AUTH_URL`         |    ✅    | Base URL of the app (e.g. `http://localhost:3000`) |
| `SMTP_HOST`               |          | SMTP server host                                   |
| `SMTP_PORT`               |          | SMTP server port                                   |
| `SMTP_USER`               |          | SMTP username                                      |
| `SMTP_PASS`               |          | SMTP password                                      |
| `SMTP_FROM`               |          | From email address                                 |
| `NEXT_PUBLIC_AUTH_METHOD` |          | Login method [`otp`, `magic-link`]                 |
| `DISCORD_CLIENT_ID`       |          | Discord OAuth app client ID                        |
| `DISCORD_CLIENT_SECRET`   |          | Discord OAuth app client secret                    |
| `GITHUB_CLIENT_ID`        |          | GitHub OAuth app client ID                         |
| `GITHUB_CLIENT_SECRET`    |          | GitHub OAuth app client secret                     |
| `GOOGLE_CLIENT_ID`        |          | Google OAuth app client ID                         |
| `GOOGLE_CLIENT_SECRET`    |          | Google OAuth app client secret                     |
| `S3_BUCKET`               |          | Bucket name for file uploads                       |
| `S3_REGION`               |          | Bucket region                                      |
| `S3_ACCESS_KEY_ID`        |          | S3 access key ID                                   |
| `S3_SECRET_ACCESS_KEY`    |          | S3 secret access key                               |
| `S3_ENDPOINT`             |          | Custom endpoint for S3-compatible services         |

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

### Login vs sign-up

`<SocialSignIn requestSignUp>` controls whether a social button is allowed to create a new account or must match an existing one:

- `requestSignUp={false}` (the default) — strict sign-in. If no account exists for that provider/email, the attempt fails instead of creating one. The login page uses this, so clicking "Sign in with Google" for a deleted account fails rather than silently creating a brand-new account with the same email, which would give the impression the deletion didn't really happen.
- `requestSignUp` (`true`) — sign-up. Creates an account if none exists yet. The register page uses this.

If you'd rather have the login button create an account on demand too (the more lenient, common OAuth pattern), pass `requestSignUp` (`true`) on the `<SocialSignIn>` in `login-client.jsx`.

## File Storage

File uploads (such as profile avatars) are stored in any S3-compatible object storage — [AWS S3](https://aws.amazon.com/s3/), [Cloudflare R2](https://developers.cloudflare.com/r2/), [MinIO](https://min.io/) and others, all work with the same variables.

For local development, the included `docker-compose.yml` runs MinIO and creates the bucket automatically. Add the following to `.env`:

```bash
S3_BUCKET=uploads
S3_REGION=eu-central-raccoon-city
S3_ACCESS_KEY_ID=forge
S3_SECRET_ACCESS_KEY=forgeforge
S3_ENDPOINT=http://localhost:9000
```

## CI

`.github/workflows/build.yml` runs `next build` on every push and pull request, so a broken build gets caught automatically instead of being found by hand. It needs no secrets or configuration — it fails the run on any build error and on any Turbopack warning.

Since this repo is meant to be cloned as a starting point, the workflow comes with it and will start running on your own fork the moment you push. If you don't want that, just delete the file.

## Roadmap

Forge is growing from a boilerplate into a self-hostable backend platform.
Planned work, roughly in order:

- **Multi-tenancy** — organization support, with users belonging to multiple organizations
- **Authorization** — row-level security in PostgreSQL (most likely), covering storage the same way
- **API layer** — REST access with API keys, for clients outside the app

> These are intentions, not commitments. The scope, the ordering and the
> approach may all change — treat this as a sketch of where the project is
> headed, not as a stable roadmap.
