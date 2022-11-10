const { SPOTIFY_SECRET, SPOTIFY_CLIENT_ID } = process.env;

if (!SPOTIFY_SECRET) {
  console.error('Missing Spotify client secret!');
  process.exit(1);
}

export const environmentBase = {
  spotifySecret: SPOTIFY_SECRET,
  clientId: SPOTIFY_CLIENT_ID ?? 'b80440eadf0a4f989bba93e5b4ff2fc5',
  logConfig: true,
};
