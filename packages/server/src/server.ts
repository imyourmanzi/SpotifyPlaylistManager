import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import {
  HeadersContentTypeForm,
  HeadersContentTypeJson,
} from '@spotify-playlist-manager/schemas';
import * as qs from 'qs';
import { environment } from './environments/environment';
import spotifyAuthUser from './plugins/spotify-auth-user';
import spotifyWebApiClient from './plugins/spotify-web-api-client';
import authRoutes from './routes/api/auth';
import importRoutes from './routes/api/import';
import playlistsRoutes from './routes/api/playlists';

// set up server configuration
export const setUpServer = async () => {
  const server = fastify({
    logger: environment.logConfig,
    querystringParser: (str) => qs.parse(str),
  }).withTypeProvider<TypeBoxTypeProvider>();

  // add common schemas
  server.addSchema(HeadersContentTypeJson);
  server.addSchema(HeadersContentTypeForm);

  // set up API
  await server.register(
    async (apiInstance) => {
      // plugins
      await apiInstance.register(cookie);

      // routes
      apiInstance.get('/healthcheck', { logLevel: 'error' }, (_, reply) =>
        reply.status(200).send({ healthy: true }),
      );
      await apiInstance.register(authRoutes);

      // portion of server that is for authenticated requests
      await apiInstance.register(async (authenticatedInstance) => {
        // plugins
        await authenticatedInstance.register(spotifyWebApiClient);
        await authenticatedInstance.register(spotifyAuthUser);

        // routes
        await authenticatedInstance.register(playlistsRoutes);
        await authenticatedInstance.register(importRoutes);
      });
    },
    { prefix: '/api' },
  );

  // set up default error handler
  server.setErrorHandler((error, request, reply) => {
    request.log.error(error, 'Error hanlding request', { user: request.user });
    return reply
      .status(500)
      .send({ errorType: 'unknown', reason: 'An error occurred on our end!' });
  });

  return server;
};
