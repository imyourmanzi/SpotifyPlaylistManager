import { Static, Type } from '@sinclair/typebox';

export const BodySpotifyToken = Type.Object(
  {
    token: Type.String(),
  },
  { $id: 'body.spotifyToken' },
);

export type BodySpotifyTokenType = Static<typeof BodySpotifyToken>;
