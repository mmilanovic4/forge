// Where an invitation is accepted. Its own file so both the email sent from
// the server and the "Copy link" button in the browser build the same URL.
export const invitationPath = (id) => `/accept-invitation/${id}`;
