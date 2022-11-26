import { Static, Type } from '@sinclair/typebox';
import { GetPlaylistResponse } from '@spotify-playlist-manager/spotify-sdk';
import { BodySpotifyToken } from '../../shared';

export const PostPlaylistsExportBody = Type.Intersect([
  BodySpotifyToken,
  Type.Object({
    playlists: Type.Array(
      Type.Object({
        id: Type.String(),
        ownerId: Type.String(),
      }),
    ),
  }),
]);
export type PostPlaylistsExportBody = Static<typeof PostPlaylistsExportBody>;

export const PostPlaylistsExportResponse = {
  200: Type.Array(
    Type.Intersect([
      Type.Omit(GetPlaylistResponse, ['tracks']),
      Type.Partial(Type.Pick(GetPlaylistResponse, ['tracks'])),
    ]),
  ),
};
export type PostPlaylistsExportResponse = Static<typeof PostPlaylistsExportResponse[200]>;
