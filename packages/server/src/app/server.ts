import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyCookie from '@fastify/cookie';
import * as qs from 'qs';
import { request as makeRequest } from 'undici';
import { URLSearchParams } from 'node:url';
import {
  PostAPIToken,
  PostAPITokenBody,
  SPOTIFY_ACCOUNTS_BASE_URL,
} from '@spotify-playlist-manager/spotify-sdk';
import { environment as env } from '../environments/environment';
import { generateRandomString } from '../utils/strings';

type MakeRequestOptions = Parameters<typeof makeRequest>['1'];

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? 'b80440eadf0a4f989bba93e5b4ff2fc5';

const API_TOKEN_URI = `${SPOTIFY_ACCOUNTS_BASE_URL}/api/token`;
const STATE_KEY = 'spotify_auth_state';

const fastify = Fastify({
  logger: true,
  querystringParser: (str) => qs.parse(str),
});

fastify.register(FastifyCors);
fastify.register(FastifyCookie);

fastify.get('/verify', (request, reply) => {
  return reply.status(200).send({ status: 'server is running' });
});

// request authorization
fastify.get('/api/login', (request, reply) => {
  const state = generateRandomString(16);
  reply.setCookie(STATE_KEY, state);

  const scope = 'user-read-private user-read-email playlist-read-private';
  const authRedirectURI = `${SPOTIFY_ACCOUNTS_BASE_URL}/authorize?${qs.stringify({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope,
    redirect_uri: env.redirectURI,
    state,
  })}`;

  return reply.send({ authRedirect: authRedirectURI });
});

// request refresh and access tokens after checking the state parameter
fastify.get('/api/callback', async (request, reply) => {
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
  } as PostAPITokenBody);
  const apiTokenRequestOptions: MakeRequestOptions = {
    method: 'POST',
    body: apiTokenRequestData.toString(),
    headers: {
      authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${env.spotifySecret}`).toString(
        'base64',
      )}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    throwOnError: true,
  };

  try {
    const apiTokenResponse = await makeRequest(API_TOKEN_URI, apiTokenRequestOptions);

    const apiTokenBody = (await apiTokenResponse.body.json()) as PostAPIToken<'access'>;
    const { access_token, refresh_token } = apiTokenBody;

    // return the tokens back to the caller so it can make requests
    return reply.send({
      access_token,
      refresh_token,
    });
  } catch (error) {
    console.error('Failed to get access and refresh tokens', error);
    return reply.status(400).send({
      error: 'invalid_token',
    });
  }
});

// request new access token from refresh token
fastify.get('/api/refresh_token', async (request, reply) => {
  const { refresh_token } = request.query as Record<string, string>;

  const requestData = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refresh_token,
  } as PostAPITokenBody);
  const requestOptions: MakeRequestOptions = {
    method: 'POST',
    headers: {
      authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${env.spotifySecret}`).toString(
        'base64',
      )}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: requestData.toString(),
    throwOnError: true,
  };

  try {
    const response = await makeRequest(API_TOKEN_URI, requestOptions);
    const { access_token } = (await response.body.json()) as PostAPIToken;

    return reply.send({
      access_token,
    });
  } catch (error) {
    console.error('Failed to refresh access token', error);
    return reply.status(500).send({
      error: 'refresh_failure',
    });
  }
});

export const server = fastify;
