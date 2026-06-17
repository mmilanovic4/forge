import "server-only";

export const emailEnabled = !!(process.env.SMTP_HOST && process.env.SMTP_FROM);

const providers = [
  {
    id: "discord",
    label: "Discord",
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    mapProfileToUser: (profile) => ({
      email: profile.email || `${profile.id}@discord.placeholder`,
      image: null,
    }),
  },
  {
    id: "github",
    label: "GitHub",
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    mapProfileToUser: () => ({
      image: null,
    }),
  },
  {
    id: "google",
    label: "Google",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mapProfileToUser: (profile) => ({
      firstName: profile.given_name,
      lastName: profile.family_name,
      image: null,
    }),
  },
];

export const activeProviders = providers.filter(
  ({ clientId, clientSecret }) => clientId && clientSecret,
);
