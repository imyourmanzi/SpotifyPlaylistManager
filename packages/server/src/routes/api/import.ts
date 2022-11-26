import multipart from '@fastify/multipart';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import type {
  PostPlaylistTracksBody,
  PostPlaylistTracksResponse,
  PostUserPlaylistsBody,
  PostUserPlaylistsResponse,
  PutPlaylistFollowersBody,
  PutPlaylistFollowersResponse,
} from '@spotify-playlist-manager/spotify-sdk';
import axios, { AxiosResponse } from 'axios';
import fp from 'fastify-plugin';
import { HeadersContentTypeForm } from '../../shared/schemas/content-type-schemas';
import { HeadersSpotifyToken } from '../../shared/schemas/spotify-token-schema';
import { PostPlaylistsExportResponse } from './playlists';

export const PostImportHeaders = Type.Intersect([
  HeadersContentTypeForm,
  HeadersSpotifyToken,
]);
export type PostImportHeaders = Static<typeof PostImportHeaders>;

export type ImportData = Static<typeof PostPlaylistsExportResponse[200]>;

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
    message: Type.String(),
  }),
};
export type PostImportResponse =
  | Static<typeof PostImportResponse[200]>
  | Static<typeof PostImportResponse[400]>;

/**
 * 1 megabyte (MB) in bytes.
 */
const MEGABYTE = 1000 * 1000;

const routes: FastifyPluginAsyncTypebox = async (fastify) => {
  // use multipart processing for file upload
  await fastify.register(multipart, {
    limits: {
      files: 1,
      fileSize: MEGABYTE,
      // borrowing these other limits from the fastify/fastify-multipart README
      fieldNameSize: 100,
      fieldSize: 100,
      fields: 10,
      headerPairs: 2000,
    },
  });

  await fastify.register(
    async (prefixedInstance) => {
      prefixedInstance.post<{
        Headers: PostImportHeaders;
        Reply: PostImportResponse;
      }>(
        '/',
        {
          schema: {
            headers: PostImportHeaders,
            response: PostImportResponse,
          },
        },
        async (request, reply) => {
          // get the raw import file data
          const fileData = await request.file();

          let importDataRaw: Buffer | undefined;
          try {
            importDataRaw = await fileData?.toBuffer?.();
          } catch (error) {
            // inform if the file is over the size limit
            if (error instanceof fastify.multipartErrors.RequestFileTooLargeError) {
              return reply.status(400).send({
                errorType: 'file_too_large',
                message:
                  'The file provided was too large. Import files may be 1 MB or smaller.',
              });
            }

            // other errors still need to be bubbled
            throw error;
          }

          // ensure we have content to read
          if (!importDataRaw || !importDataRaw.length) {
            return reply.status(400).send({
              errorType: 'no_file',
              message: 'A file was either not provided or could not be received.',
            });
          }

          // parse the JSON file data
          let importData: ImportData;
          try {
            importData = JSON.parse(importDataRaw.toString());
          } catch {
            return reply.status(400).send({
              errorType: 'invalid_format',
              message:
                'The import file must be a JSON file that was exported from the Playlists page.',
            });
          }

          // get currently authorized user ID
          const userId = request.user.id;

          // starting import process
          const playlistsFound = importData.length;
          let playlistsImported = 0;
          let tracksFound = 0;
          let tracksImported = 0;

          const importPromises = importData.map(
            async (playlist): Promise<PostImportError[]> => {
              // type 1: import owned playlist and add all its tracks
              if (playlist.tracks) {
                let newPlaylistResponse: AxiosResponse<
                  PostUserPlaylistsResponse,
                  PostUserPlaylistsBody
                >;

                try {
                  // try creation of playlist
                  newPlaylistResponse = await request.spotify.post<
                    PostUserPlaylistsResponse,
                    AxiosResponse<PostUserPlaylistsResponse>,
                    PostUserPlaylistsBody
                  >(`/users/${userId}/playlists`, {
                    name: playlist.name,
                    ...(playlist.description
                      ? { description: playlist.description }
                      : {}),
                    public: false,
                    collaborative: false,
                  });

                  request.log.info(newPlaylistResponse);

                  // record playlist import
                  playlistsImported += 1;
                } catch (error) {
                  let reason = 'Playlist creation failed for an unknown reason.';

                  // if we have an Axios error and there's a valid message, pull it out;
                  // otherwise we either 1) don't have an Axios error (false) or 2) don't
                  // have a valid message (undefined)
                  const errorMessage =
                    axios.isAxiosError<PostUserPlaylistsResponse, PostUserPlaylistsBody>(
                      error,
                    ) && error.response?.data?.error?.message;

                  if (errorMessage) {
                    reason = errorMessage;
                  } else {
                    request.log.warn(
                      {
                        error,
                        playlist: {
                          name: playlist.name,
                          description: playlist.description,
                          id: playlist.id,
                          href: playlist.href,
                          owner: playlist.owner.href,
                          trackCount: playlist.tracks.items.length,
                        },
                        userId,
                      },
                      'Failed to create playlist for unknown reason',
                    );
                  }

                  return [
                    {
                      errorType: 'not_created',
                      playlistHref: playlist.href,
                      playlistName: playlist.name,
                      reason,
                    },
                  ];
                }

                const newPlaylistId = newPlaylistResponse.data.id;
                const trackImportErrors: PostImportErrorTrackNotAdded[] = [];
                const playlistTracks = [...playlist.tracks.items];
                tracksFound += playlistTracks.length;

                // add all playlist.tracks (or up to 100 at a time)
                for (let i = 0; i < playlistTracks.length; i += 100) {
                  // get the next 100 tracks, or if there are less than 100 left, get all
                  // of them
                  const tracksToAdd = playlistTracks.splice(
                    i * 100,
                    Math.min(100, playlistTracks.length),
                  );

                  // create an array of just the track URIs
                  const uris = tracksToAdd.map((track) => track.track.uri);

                  try {
                    await request.spotify.post<
                      PostPlaylistTracksResponse,
                      AxiosResponse<PostPlaylistTracksResponse>,
                      PostPlaylistTracksBody
                    >(`/playlists/${newPlaylistId}/tracks`, { uris });

                    // record track imports
                    tracksImported += uris.length;
                  } catch (error) {
                    let reason =
                      'Adding tracks to playlist failed for an unknown reason.';

                    // if we have an Axios error and there's a valid message, pull it out;
                    // otherwise we either 1) don't have an Axios error (false) or
                    // 2) don't have a valid message (undefined)
                    const errorMessage =
                      axios.isAxiosError<
                        PostPlaylistTracksResponse,
                        PostPlaylistTracksBody
                      >(error) && error.response?.data?.error?.message;

                    if (errorMessage) {
                      reason = errorMessage;
                    } else {
                      request.log.warn(
                        {
                          error,
                          playlist: {
                            name: playlist.name,
                            description: playlist.description,
                            id: playlist.id,
                            href: playlist.href,
                            owner: playlist.owner.href,
                            trackCount: playlistTracks.length,
                          },
                          tracks: tracksToAdd,
                          userId,
                        },
                        'Failed to add tracks for unknown reason',
                      );
                    }

                    trackImportErrors.push(
                      ...tracksToAdd.map((track) => ({
                        errorType: 'track_not_added' as const,
                        playlistHref: playlist.href,
                        playlistName: playlist.name,
                        trackArtists: track.track.artists.map((artist) => artist.name),
                        trackHref: track.track.href,
                        trackName: track.track.name,
                        reason,
                      })),
                    );
                  }
                }

                return trackImportErrors;
              }

              // type 2: import followed playlist
              try {
                // try following playlist
                await request.spotify.put<
                  PutPlaylistFollowersResponse,
                  AxiosResponse<PutPlaylistFollowersResponse>,
                  PutPlaylistFollowersBody
                >(`/playlists/${playlist.id}/followers`, { public: false });
              } catch (error) {
                let reason = 'Following the playlist failed for an unknown reason.';

                // if we have an Axios error and there's a valid message, pull it out;
                // otherwise we either 1) don't have an Axios error (false) or 2) don't
                // have a valid message (undefined)
                const errorMessage =
                  axios.isAxiosError<
                    PutPlaylistFollowersResponse,
                    PutPlaylistFollowersBody
                  >(error) && error.response?.data?.error?.message;

                if (errorMessage) {
                  reason = errorMessage;
                } else {
                  request.log.warn(
                    {
                      error,
                      playlist: {
                        name: playlist.name,
                        description: playlist.description,
                        id: playlist.id,
                        href: playlist.href,
                        owner: playlist.owner.href,
                      },
                      userId,
                    },
                    'Failed to follow playlist for unknown reason',
                  );
                }

                return [
                  {
                    errorType: 'not_followed',
                    playlistHref: playlist.href,
                    playlistName: playlist.name,
                    reason,
                  },
                ];
              }

              return [];
            },
          );

          // get the results of all imports
          const importResults = await Promise.allSettled(importPromises);

          // aggregate the import errors
          const importErrors: PostImportError[] = [];
          importResults.forEach((error) => {
            switch (error.status) {
              case 'fulfilled':
                importErrors.push(...error.value);
                break;
              case 'rejected':
                request.log.warn(
                  { error, userId },
                  'Import process failed for an unknown reason',
                );
                importErrors.push({
                  errorType: 'unknown',
                  reason: 'The import process failed for an unknown reason.',
                });
                break;
            }
          });

          // make sure we imported all playlists
          if (playlistsFound !== playlistsImported) {
            importErrors.push({
              errorType: 'not_created',
              playlistHref: 'unknown',
              playlistName: 'unknown',
              reason: `Only ${playlistsImported} of ${playlistsFound} playlists were imported.`,
            });
          }

          // make sure we imported all tracks
          if (tracksFound !== tracksImported) {
            importErrors.push({
              errorType: 'track_not_added',
              playlistHref: 'unknown',
              playlistName: 'unknown',
              trackArtists: [],
              trackHref: 'unknown',
              trackName: 'unknown',
              reason: `Only ${tracksImported} of ${tracksFound} tracks were imported.`,
            });
          }

          // return status of the import
          return reply.status(200).send({
            errors: importErrors.length ? importErrors : null,
            playlistsCount: playlistsImported,
            tracksCount: tracksImported,
          });
        },
      );
    },
    { prefix: '/import' },
  );
};

export default fp(routes, {
  fastify: '4.x',
  dependencies: ['spotify-web-api-client', 'spotify-auth-user'],
  decorators: {
    request: ['spotify', 'user'],
  },
});
