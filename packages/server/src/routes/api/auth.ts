import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  GetCallbackResponse,
  GetLoginResponse,
  HeadersContentTypeJson,
  PostRefreshTokenBody,
  PostRefreshTokenResponse,
} from '@spotify-playlist-manager/schemas';
import {
  PostApiTokenResponse,
  PostApiTokenBody,
  SPOTIFY_ACCOUNTS_BASE_URL,
} from '@spotify-playlist-manager/spotify-sdk';
import fp from 'fastify-plugin';
import { URLSearchParams } from 'node:url';
import * as qs from 'qs';
import { environment as env } from '../../environments/environment';
import { makeRequest, RequestOptions } from '../../shared/make-request';
import { generateRandomString } from '../../shared/strings';

const API_TOKEN_URI = `${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`;
const STATE_KEY = 'spotify_auth_state';

const routes: FastifyPluginAsyncTypebox = async (fastify) => {
  await fastify.register(
    async (prefixedInstance) => {
      // request authorization
      prefixedInstance.get<{ Reply: GetLoginResponse }>(
        '/login',
        { schema: { response: GetLoginResponse } },
        async (_, reply) => {
          const state = generateRandomString(16);
          reply.setCookie(STATE_KEY, state);

          const scope = [
            'user-read-private',
            'user-read-email',
            'playlist-read-private',
            'playlist-modify-private',
          ].join(' ');
          const authRedirectURI = `${SPOTIFY_ACCOUNTS_BASE_URL}/authorize?${qs.stringify({
            response_type: 'code',
            client_id: env.clientId,
            scope,
            redirect_uri: env.redirectURI,
            state,
          })}`;

          return reply.send({ authRedirect: authRedirectURI });
        },
      );

      // request refresh and access tokens after checking the state parameter
      prefixedInstance.get<{ Reply: GetCallbackResponse }>(
        '/callback',
        { schema: { response: GetCallbackResponse } },
        async (request, reply) => {
          const { code, state } = request.query as Record<string, string>;

          // check the code query param
          if (code == null) {
            return reply.status(400).send({
              error: 'missing_code',
            });
          }

          // check and handle the state query param
          const storedState = request.cookies ? request.cookies[STATE_KEY] : null;
          if (state == null || state !== storedState) {
            return reply.status(400).send({
              error: 'state_mismatch',
            });
          }
          reply.clearCookie(STATE_KEY);

          const apiTokenRequestData = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: env.redirectURI,
          } as PostApiTokenBody);

          const apiTokenRequestOptions: RequestOptions = {
            method: 'POST',
            body: apiTokenRequestData.toString(),
            headers: {
              authorization: `Basic ${Buffer.from(
                `${env.clientId}:${env.spotifySecret}`,
              ).toString('base64')}`,
              'content-type': 'application/x-www-form-urlencoded',
            },
            throwOnError: true,
          };

          try {
            const apiTokenResponse = await makeRequest(
              API_TOKEN_URI,
              apiTokenRequestOptions,
            );

            const apiTokenBody =
              (await apiTokenResponse.body.json()) as PostApiTokenResponse;
            const { access_token, refresh_token } = apiTokenBody;

            if (!refresh_token) {
              return reply.status(400).send({ error: 'invalid_token' });
            }

            // return the tokens back to the caller so it can make requests
            return reply.send({
              access_token,
              refresh_token,
            });
          } catch (error) {
            console.error('Failed to get access and refresh tokens', error);
            return reply.status(400).send({ error: 'invalid_token' });
          }
        },
      );

      // request new access token from refresh token
      prefixedInstance.post<{
        Headers: HeadersContentTypeJson;
        Body: PostRefreshTokenBody;
        Reply: PostRefreshTokenResponse;
      }>(
        '/refresh_token',
        {
          schema: {
            headers: prefixedInstance.getSchema('headers.contentType:json'),
            body: PostRefreshTokenBody,
            response: PostRefreshTokenResponse,
          },
        },
        async (request, reply) => {
          const { refreshToken } = request.body;

          const requestData = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          } as PostApiTokenBody);

          const requestOptions: RequestOptions = {
            method: 'POST',
            headers: {
              authorization: `Basic ${Buffer.from(
                `${env.clientId}:${env.spotifySecret}`,
              ).toString('base64')}`,
              'content-type': 'application/x-www-form-urlencoded',
            },
            body: requestData.toString(),
            throwOnError: true,
          };

          try {
            const response = await makeRequest(API_TOKEN_URI, requestOptions);
            const { access_token } = (await response.body.json()) as PostApiTokenResponse;

            return reply.send({
              access_token,
            });
          } catch (error) {
            console.error('Failed to refresh access token', error);
            return reply.status(500).send({
              error: 'refresh_failure',
            });
          }
        },
      );
    },
    { prefix: '/auth' },
  );
};

export default fp(routes, {
  fastify: '4.x',
});
