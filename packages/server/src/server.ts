import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import * as qs from 'qs';
import { environment } from './environments/environment';
import spotifyWebApiClient from './plugins/spotify-web-api-client';
import authRoutes from './routes/api/auth';
import importRoutes from './routes/api/import';
import playlistsRoutes from './routes/api/playlists';
import { HeadersContentTypeJson } from './shared/schemas/content-type-schemas';

// set up server
export const server = fastify({
  logger: environment.logConfig,
  querystringParser: (str) => qs.parse(str),
}).withTypeProvider<TypeBoxTypeProvider>();

server.addSchema(HeadersContentTypeJson);

server.register(cookie);

server.get('/healthcheck', (_, reply) => reply.status(200).send());

// set up API
server.register(
  async (apiInstance) => {
    // API plugins
    await apiInstance.register(spotifyWebApiClient);

    // API routes
    await apiInstance.register(authRoutes);
    await apiInstance.register(playlistsRoutes);
    await apiInstance.register(importRoutes);
  },
  { prefix: '/api' },
);
