import type {
  FastifyPluginAsyncTypebox,
  TypeBoxTypeProvider,
} from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import { JSONContentType } from '../schemas/content-type-schemas';

const PostPlaylistsExportBody = Type.Array(
  Type.Object({}, { additionalProperties: true }),
);

type PostPlaylistsExportBodyType = Static<typeof PostPlaylistsExportBody>;

export const prefix = '/playlists';
export const router: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.withTypeProvider<TypeBoxTypeProvider>();

  fastify.post<{
    Headers: JSONContentType;
    Body: PostPlaylistsExportBodyType;
  }>(
    '/export',
    {
      schema: {
        headers: fastify.getSchema('json.contentType'),
        body: PostPlaylistsExportBody,
      },
    },
    async (request, reply) => {
      const playlistsToExport = request.body;
      return reply.send({ playlistsToExport });
    },
  );
};
