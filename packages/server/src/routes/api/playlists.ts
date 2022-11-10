import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import type { AxiosInstance } from 'axios';
import fp from 'fastify-plugin';
import { URL } from 'url';
import {
  GetMeResponse,
  GetPlaylistResponse,
  GetPlaylistTracksResponse,
} from '@spotify-playlist-manager/spotify-sdk';
import { HeadersContentTypeJson } from '../../shared/schemas/content-type-schemas';
import { BodySpotifyToken } from '../../shared/schemas/spotify-token-schema';

const PostPlaylistsExportBody = Type.Intersect([
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

const PostPlaylistsExportResponse = {
  200: Type.Array(
    Type.Intersect([
      Type.Omit(GetPlaylistResponse, ['tracks']),
      Type.Object({
        tracks: Type.Optional(GetPlaylistResponse.tracks),
      }),
    ]),
  ),
};
export type PostPlaylistsExportResponse = Static<
  typeof PostPlaylistsExportResponse['200']
>;

/**
 * Load all tracks in a playlist.
 *
 * @param spotify the Axios client from the request, should have its own auth
 * @playlistId ID of the playlist to fetch tracks for
 * @param nextRequest the request URL to use in the next fetch
 * @param accumulatedResponse accumulates all of the tracks over every response
 * @returns the `accumulatedResponse` once Spotify indicates there are no more tracks
 */
const getAllPlaylistTracks = async (
  spotify: AxiosInstance,
  playlistId: string,
  nextRequest:
    | string
    | null = `${spotify.defaults.baseURL}/playlists/${playlistId}/tracks`,
  accumulatedResponse: GetPlaylistTracksResponse = {
    href: '',
    items: [],
    limit: 50,
    next: null,
    offset: 0,
    previous: null,
    total: 0,
  },
): Promise<GetPlaylistTracksResponse> => {
  if (nextRequest == null) {
    return accumulatedResponse;
  }

  const url = new URL(nextRequest);
  url.searchParams.set('limit', '50');
  url.searchParams.sort();

  const { data } = await spotify.get<GetPlaylistTracksResponse>(url.toString());

  const updatedAccumulation = {
    ...accumulatedResponse,
    items: [...accumulatedResponse.items, ...data.items],
    next: data.next,
    offset: data.offset,
    total: data.total,
  };

  return getAllPlaylistTracks(spotify, playlistId, data.next, updatedAccumulation);
};

/**
 * A router plugin encapsulating all routes design for authentication and authorization to
 *  a Spotify account.
 * @param fastify the Fastify server the router is attached to
 */
const routes: FastifyPluginAsyncTypebox = async (fastify) => {
  await fastify.register(
    async (prefixedInstance) => {
      prefixedInstance.post<{
        Headers: HeadersContentTypeJson;
        Body: PostPlaylistsExportBody;
        Reply: PostPlaylistsExportResponse;
      }>(
        '/export',
        {
          schema: {
            headers: prefixedInstance.getSchema('headers.contentType:json'),
            body: PostPlaylistsExportBody,
            response: PostPlaylistsExportResponse,
          },
        },
        async (request, reply) => {
          const { playlists } = request.body;

          const meResponse = await request.spotify.get<GetMeResponse>('/me');
          const { id: userId } = meResponse.data;

          // hydrate the playlists
          type HydratedPlaylist = PostPlaylistsExportResponse[number];
          const hydratedPlaylists = await Promise.all(
            playlists.map(async ({ id, ownerId }) => {
              const userIsOwner = ownerId === userId;

              let playlist: HydratedPlaylist;
              ({ data: playlist } = await request.spotify.get<HydratedPlaylist>(
                `/playlists/${id}`,
                // don't immediately fetch tracks, we may not need them
                { params: { fields: '(!tracks)' } },
              ));

              // if the user is the owner, then we'll fetch the tracks
              if (userIsOwner && !playlist.error) {
                playlist = {
                  ...playlist,
                  tracks: await getAllPlaylistTracks(request.spotify, id),
                };
              }

              return playlist;
            }),
          );

          return reply.send(hydratedPlaylists);
        },
      );
    },
    { prefix: '/playlists' },
  );
};

export default fp(routes, {
  fastify: '4.x',
  dependencies: ['spotify-web-api-client'],
  decorators: {
    request: ['spotify'],
  },
});
