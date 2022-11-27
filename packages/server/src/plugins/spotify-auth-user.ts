import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { GetMeResponse } from '@spotify-playlist-manager/spotify-sdk';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    user: GetMeResponse;
  }
}

export type AuthenticateSpotifyUserOptions = Record<string, never>;

const decorateRequestWithAuthenticatedSpotifyUser: FastifyPluginAsyncTypebox<
  AuthenticateSpotifyUserOptions
> = async (fastify) => {
  fastify.decorateRequest('user', null);

  fastify.addHook('preHandler', async (request) => {
    // only try if our Spotify client has an auth token
    if (request.spotify.defaults.headers['Authorization']) {
      const userResponse = await request.spotify.get<GetMeResponse>(`/me`);
      request.user = userResponse.data;
    }
  });
};

export default fp(decorateRequestWithAuthenticatedSpotifyUser, {
  fastify: '4.x',
  name: 'spotify-auth-user',
  dependencies: ['spotify-web-api-client'],
  decorators: {
    request: ['spotify'],
  },
});
