import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import type { AxiosInstance } from 'axios';
import {
  GetMeResponseType,
  GetPlaylistResponse,
  GetPlaylistTracksResponseType,
} from '@spotify-playlist-manager/spotify-sdk';
import { SpotifyWebApiClient } from '../plugins/spotify-web-api-client';
import { HeadersContentTypeJsonType } from '../shared/schemas/content-type-schemas';
import { BodySpotifyToken } from '../shared/schemas/spotify-token-schema';
import { URL } from 'url';

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

export type PostPlaylistsExportBodyType = Static<typeof PostPlaylistsExportBody>;

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
export type PostPlaylistsExportResponseType = Static<
  typeof PostPlaylistsExportResponse['200']
>;

/**
 * The server path prefix intended to be used with the router.
 */
export const prefix = '/playlists';

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
  accumulatedResponse: GetPlaylistTracksResponseType = {
    href: '',
    items: [],
    limit: 50,
    next: null,
    offset: 0,
    previous: null,
    total: 0,
  },
): Promise<GetPlaylistTracksResponseType> => {
  if (nextRequest == null) {
    return accumulatedResponse;
  }

  const url = new URL(nextRequest);
  url.searchParams.set('limit', '50');
  url.searchParams.sort();

  const { data } = await spotify.get<GetPlaylistTracksResponseType>(url.toString());

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
export const router: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.register(SpotifyWebApiClient);

  fastify.post<{
    Headers: HeadersContentTypeJsonType;
    Body: PostPlaylistsExportBodyType;
    Reply: PostPlaylistsExportResponseType;
  }>(
    '/export',
    {
      schema: {
        headers: fastify.getSchema('headers.contentType:json'),
        body: PostPlaylistsExportBody,
        response: PostPlaylistsExportResponse,
      },
    },
    async (request, reply) => {
      const { playlists } = request.body;

      const meResponse = await request.spotify.get<GetMeResponseType>('/me');
      const { id: userId } = meResponse.data;

      // hydrate the playlists
      type HydratedPlaylist = PostPlaylistsExportResponseType[number];
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
};
