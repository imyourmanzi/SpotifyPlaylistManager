import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { BodySpotifyToken, HeadersSpotifyToken } from '@spotify-playlist-manager/schemas';
import { createWebApiClient } from '@spotify-playlist-manager/spotify-sdk';
import type { AxiosInstance } from 'axios';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    spotify: AxiosInstance;
  }
}

export type SpotifyWebApiClientOptions = Record<string, never>;

const decorateRequestWithWebApiClient: FastifyPluginAsyncTypebox<
  SpotifyWebApiClientOptions
> = async (fastify) => {
  fastify.decorateRequest('spotify', null);

  fastify.addHook<{
    Headers?: Partial<HeadersSpotifyToken>;
    Body?: Partial<BodySpotifyToken>;
  }>('preHandler', async (request) => {
    // initialize a Spotify web API client with a token from, in order of precedence
    // 1. the `x-spotify-token` header
    // 2. the request body's `token` property
    // 3. `undefined`
    request.spotify = createWebApiClient(
      request.headers?.['x-spotify-token'] ?? request.body?.token,
    );
  });
};

export default fp(decorateRequestWithWebApiClient, {
  fastify: '4.x',
  name: 'spotify-web-api-client',
});
