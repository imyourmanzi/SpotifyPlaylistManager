import multipart from '@fastify/multipart';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Static, Type } from '@sinclair/typebox';
import fp from 'fastify-plugin';

const PostImportResponse = {
  200: Type.Object({
    playlistsCount: Type.Number(),
    tracksCount: Type.Number(),
    errors: Type.Union([
      Type.Array(
        Type.Object({
          errorType: Type.Union([
            Type.Literal('not_created'),
            Type.Literal('track_not_found'),
            Type.Literal('not_followed'),
          ]),
          playlistId: Type.String(),
        }),
      ),
      Type.Null(),
    ]),
  }),
  400: Type.Object({
    errorType: Type.Union([Type.Literal('no_file'), Type.Literal('file_too_large')]),
    message: Type.String(),
  }),
};
type PostImportResponse =
  | Static<typeof PostImportResponse['200']>
  | Static<typeof PostImportResponse['400']>;

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
      // borrowing these other limits from the fastify-multipart README
      fieldNameSize: 100,
      fieldSize: 100,
      fields: 10,
      headerPairs: 2000,
    },
  });

  await fastify.register(
    async (prefixedInstance) => {
      prefixedInstance.post<{ Reply: PostImportResponse }>(
        '/',
        { schema: { response: PostImportResponse } },
        async (request, reply) => {
          // get the raw import file data
          const fileData = await request.file();

          let importDataRaw: Buffer | undefined;
          try {
            importDataRaw = await fileData?.toBuffer?.();
          } catch (error) {
            // make sure we're not over the file size limit
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
          const importData = JSON.parse(importDataRaw.toString());
          request.log.info({ importData });

          reply.status(200).send({ errors: null, playlistsCount: 0, tracksCount: 0 }); // TODO: this is a placeholder
        },
      );
    },
    { prefix: '/import' },
  );
};

export default fp(routes, {
  fastify: '4.x',
  dependencies: ['spotify-web-api-client'],
  decorators: {
    request: ['spotify'],
  },
});
