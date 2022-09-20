const { SPOTIFY_SECRET } = process.env;

if (!SPOTIFY_SECRET) {
  console.error('Missing Spotify client secret!');
  process.exit(1);
}

export const environmentBase = {
  spotifySecret: SPOTIFY_SECRET,
};
