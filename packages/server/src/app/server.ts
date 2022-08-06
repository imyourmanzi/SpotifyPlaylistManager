import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyCookie from '@fastify/cookie';
import * as qs from 'qs';
import { request as makeRequest } from 'undici';
import { URLSearchParams } from 'node:url';

type APITokenResponse = {
  access_token: string;
  token_type: 'Bearer';
  scope: string;
  expires_in: number;
  refresh_token: string;
};

type RefreshTokenResponse = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
};

const API_TOKEN_URI = 'https://accounts.spotify.com/api/token';
const CLIENT_ID = 'b80440eadf0a4f989bba93e5b4ff2fc5'; // Your client id
const REDIRECT_URI = 'http://localhost:8888/callback'; // Your redirect uri
const STATE_KEY = 'spotify_auth_state';
const { CLIENT_SECRET } = process.env;

if (!CLIENT_SECRET) {
  console.error('Missing client secret!');
  process.exit(1);
}

const fastify = Fastify({
  logger: true,
  querystringParser: (str) => qs.parse(str),
});

fastify.register(FastifyCors);
fastify.register(FastifyCookie);

/**
 * Generates a random string containing numbers and letters.
 *
 * @param length the length of the string
 * @return the generated string
 */
const generateRandomString = (length: number) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

fastify.get('/verify', (request, reply) => {
  reply.status(200).send({ status: 'server is running' });
});

fastify.get('/login', (request, reply) => {
  const state = generateRandomString(16);
  reply.setCookie(STATE_KEY, state);

  // your application requests authorization
  const scope = 'user-read-private user-read-email';
  const authRedirect =
    'https://accounts.spotify.com/authorize?' +
    qs.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state,
    });

  reply.redirect(authRedirect);
});

fastify.get('/callback', async (request, reply) => {
  // your application requests refresh and access tokens
  // after checking the state parameter
  const query = request.query as Record<string, string>;
  const code = query.code ?? null;
  const state = query.state ?? null;

  const storedState = request.cookies ? request.cookies[STATE_KEY] : null;

  if (state === null || state !== storedState) {
    reply.redirect(
      '/#' +
        qs.stringify({
          error: 'state_mismatch',
        }),
    );
  } else {
    reply.clearCookie(STATE_KEY);

    const apiTokenRequestData = new URLSearchParams();
    apiTokenRequestData.set('grant_type', 'authorization_code'); ////// WHY ARE YOU MISSING?????
    apiTokenRequestData.set('code', code);
    apiTokenRequestData.set('redirect_uri', REDIRECT_URI);

    const apiTokenRequestOptions: Parameters<typeof makeRequest>['1'] = {
      method: 'POST',
      body: apiTokenRequestData.toString(),
      headers: {
        authorization:
          'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        'content-type': 'application/x-www-form-urlencoded',
      },
      throwOnError: true,
    };

    let access_token: string, refresh_token: string;
    try {
      const apiTokenResponse = await makeRequest(API_TOKEN_URI, apiTokenRequestOptions);

      const apiTokenBody = (await apiTokenResponse.body.json()) as APITokenResponse;
      ({ access_token, refresh_token } = apiTokenBody);
    } catch (error) {
      console.error('CALLBACK FAILURE', error);
      reply.redirect(
        '/#' +
          qs.stringify({
            error: 'invalid_token',
          }),
      );
      return;
    }

    // we can also pass the token to the browser to make requests from there
    reply.redirect(
      '/#' +
        qs.stringify({
          access_token: access_token,
          refresh_token: refresh_token,
        }),
    );
  }
});

fastify.get('/refresh_token', async (request, reply) => {
  // requesting access token from refresh token
  const { refresh_token } = request.query as Record<string, string>;

  const requestData = new URLSearchParams();
  requestData.set('grant_type', 'refresh_token');
  requestData.set('refresh_token', refresh_token);
  const requestOptions: Parameters<typeof makeRequest>['1'] = {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestData.toString(),
    throwOnError: true,
  };

  try {
    const response = await makeRequest(API_TOKEN_URI, requestOptions);
    const { access_token } = (await response.body.json()) as RefreshTokenResponse;

    reply.send({
      access_token: access_token,
    });
  } catch (error) {
    console.error('REFRESH FAILURE', error);
  }
});

export const server = fastify;
