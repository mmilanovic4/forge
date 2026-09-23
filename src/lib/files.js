// Where stored files are served from, and the key layout that uploading,
// serving and removing them check ownership against. Dependency-free so
// auth.js — and proxy.js with it — can import it without the storage client.
export const FILES_URL_PREFIX = "/api/files/";

export const avatarPrefix = (userId) => `avatars/${userId}`;
