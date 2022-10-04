import type {
  FastifyPluginAsyncTypebox,
  TypeBoxTypeProvider,
} from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import { JSONContentType } from '../shared/schemas/content-type-schemas';

const PostPlaylistsExportBody = Type.Array(
  Type.Object({}, { additionalProperties: true }),
);

type PostPlaylistsExportBodyType = Static<typeof PostPlaylistsExportBody>;

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
  fastify.post<{
    Headers: JSONContentType;
    Body: PostPlaylistsExportBodyType;
  }>(
    '/export',
    {
      schema: {
        headers: fastify.getSchema('headers.contentType:json'),
        body: PostPlaylistsExportBody,
      },
    },
    async (request, reply) => {
      const playlistsToExport = request.body;
      return reply.send({ playlistsToExport });
    },
  );
};
