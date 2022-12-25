import { Static, Type } from '@sinclair/typebox';
import { HeadersContentTypeForm, HeadersSpotifyToken } from '../../shared';
import { HydratedPlaylists } from './playlists';

export const PostImportHeaders = Type.Intersect([
  HeadersContentTypeForm,
  HeadersSpotifyToken,
]);
export type PostImportHeaders = Static<typeof PostImportHeaders>;

export type ImportData = Static<typeof HydratedPlaylists>;

export const PostImportErrorNotCreated = Type.Object({
  errorType: Type.Literal('not_created'),
  playlistHref: Type.String(),
  playlistName: Type.String(),
  reason: Type.String(),
});
export type PostImportErrorNotCreated = Static<typeof PostImportErrorNotCreated>;

export const PostImportErrorTrackNotAdded = Type.Object({
  errorType: Type.Literal('track_not_added'),
  playlistHref: Type.String(),
  playlistName: Type.String(),
  trackHref: Type.String(),
  trackName: Type.String(),
  trackArtists: Type.Array(Type.String()),
  reason: Type.String(),
});
export type PostImportErrorTrackNotAdded = Static<typeof PostImportErrorTrackNotAdded>;

export const PostImportErrorNotFollowed = Type.Object({
  errorType: Type.Literal('not_followed'),
  playlistHref: Type.String(),
  playlistName: Type.String(),
  reason: Type.String(),
});
export type PostImportErrorNotFollowed = Static<typeof PostImportErrorNotFollowed>;

export const PostImportErrorUnknown = Type.Object({
  errorType: Type.Literal('unknown'),
  reason: Type.String(),
});
export type PostImportErrorUnknown = Static<typeof PostImportErrorUnknown>;

export const PostImportError = Type.Union([
  PostImportErrorNotCreated,
  PostImportErrorTrackNotAdded,
  PostImportErrorNotFollowed,
  PostImportErrorUnknown,
]);
export type PostImportError = Static<typeof PostImportError>;

export const PostImportResponse = {
  200: Type.Object({
    playlistsCount: Type.Number(),
    tracksCount: Type.Number(),
    errors: Type.Union([Type.Array(PostImportError), Type.Null()]),
  }),
  400: Type.Object({
    errorType: Type.Union([
      Type.Literal('no_file'),
      Type.Literal('file_too_large'),
      Type.Literal('invalid_format'),
    ]),
    reason: Type.String(),
  }),
};
export type PostImportResponse =
  | Static<typeof PostImportResponse[200]>
  | Static<typeof PostImportResponse[400]>;
