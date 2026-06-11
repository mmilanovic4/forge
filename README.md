# Forge

<p align="center">
  <img src="https://raw.githubusercontent.com/mmilanovic4/forge/main/public/logo.svg" width="48" height="48" />
</p>

A minimal Next.js boilerplate with authentication, database and a component library ready to go.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally

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

3. Copy the environment file and fill in your values

```bash
   cp .env.example .env
```

4. Push the database schema

```bash
   npx prisma db push
```

5. Generate the Prisma client

```bash
   npx prisma generate
```

6. Start the dev server

```bash
   npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable               | Description                               |
| ---------------------- | ----------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string              |
| `BETTER_AUTH_SECRET`   | Random secret string (min 32 chars)       |
| `BETTER_AUTH_URL`      | Base URL of the app                       |
| `GITHUB_CLIENT_ID`     | GitHub OAuth app client ID (optional)     |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret (optional) |
| `GOOGLE_CLIENT_ID`     | Google OAuth app client ID (optional)     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth app client secret (optional) |
