import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import * as qs from 'qs';
import { environment } from './environments/environment';
import spotifyAuthUser from './plugins/spotify-auth-user';
import spotifyWebApiClient from './plugins/spotify-web-api-client';
import authRoutes from './routes/api/auth';
import importRoutes from './routes/api/import';
import playlistsRoutes from './routes/api/playlists';
import {
  HeadersContentTypeForm,
  HeadersContentTypeJson,
} from './shared/schemas/content-type-schemas';

// set up server configuration
export const server = fastify({
  logger: environment.logConfig,
  querystringParser: (str) => qs.parse(str),
}).withTypeProvider<TypeBoxTypeProvider>();

// add common schemas
server.addSchema(HeadersContentTypeJson);
server.addSchema(HeadersContentTypeForm);

// add basic health check endpoint
server.get('/healthcheck', (_, reply) => reply.status(200).send());

// set up API
server.register(
  async (apiInstance) => {
    // add auth routes which have no dependencies
    await apiInstance.register(authRoutes);

    // API plugins
    await apiInstance.register(cookie);
    await apiInstance.register(spotifyWebApiClient);
    await apiInstance.register(spotifyAuthUser);

    // API routes
    await apiInstance.register(playlistsRoutes);
    await apiInstance.register(importRoutes);
  },
  { prefix: '/api' },
);

server.setErrorHandler((error, request, reply) => {
  request.log.error(error, 'Error hanlding request', { user: request.user });
  return reply
    .status(500)
    .send({ errorType: 'unknown', message: 'An error occurred on our end!' });
});
