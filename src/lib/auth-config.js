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

export const providerProfileMap = {
  google: (profile) => {
    return {
      firstName: profile.given_name,
      lastName: profile.family_name,
      image: null,
    };
  },
  github: () => {
    return {
      image: null,
    };
  },
  discord: (profile) => {
    return {
      email: profile.email || `${profile.id}@discord.placeholder`,
      image: null,
    };
  },
};

export const configuredProviders = Object.keys(socialProviders);
