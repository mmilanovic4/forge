import "server-only";

export const emailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_FROM);

const allProviders = {
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
};

export const socialProviders = Object.fromEntries(
  Object.entries(allProviders).filter(
    ([, { clientId, clientSecret }]) => clientId && clientSecret,
  ),
);

export const configuredProviders = Object.keys(socialProviders);
