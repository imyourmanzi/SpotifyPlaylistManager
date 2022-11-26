import { Static, Type } from '@sinclair/typebox';

export const BodySpotifyToken = Type.Object(
  {
    token: Type.String(),
  },
  { $id: 'body.spotifyToken' },
);

export type BodySpotifyToken = Static<typeof BodySpotifyToken>;

export const HeadersSpotifyToken = Type.Object(
  {
    'x-spotify-token': Type.String(),
  },
  { $id: 'headers.spotifyToken' },
);

export type HeadersSpotifyToken = Static<typeof HeadersSpotifyToken>;
