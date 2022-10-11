import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import { URLSearchParams } from 'node:url';
import {
  GetMeResponseType,
  GetPlaylistResponse,
  GetPlaylistResponseType,
} from '@spotify-playlist-manager/spotify-sdk';
import { SpotifyWebApiClient } from '../plugins/spotify-web-api-client';
import { HeadersContentTypeJsonType } from '../shared/schemas/content-type-schemas';
import { BodySpotifyToken } from '../shared/schemas/spotify-token-schema';

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
  200: Type.Array(GetPlaylistResponse),
};
export type PostPlaylistsExportResponseType = Static<
  typeof PostPlaylistsExportResponse['200']
>;

/**
 * The server path prefix intended to be used with the router.
 */
export const prefix = '/playlists';

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
      const { token, playlists } = request.body;

      const meResponse = await request.webApi.get<GetMeResponseType>('/me');
      const { id: userId } = meResponse.data;

      // hydrate the playlists
      const hydratedPlaylists = await Promise.all(
        playlists.map(async ({ id, ownerId }) => {
          const params = new URLSearchParams();
          if (ownerId !== userId) {
            // don't return tracks in playlists that the requesting user does not own
            params.set('fields', '!tracks');
          }

          const url = `/playlists/${id}`;

          const playlistResponse = await request.webApi.get<GetPlaylistResponseType>(
            url,
            { params },
          );

          request.log.info({ playlistResponse });

          return playlistResponse.data;
        }),
      );

      return reply.send(hydratedPlaylists);
    },
  );
};

// todo need a "get playlist all tracks" function
