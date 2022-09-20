import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyCookie from '@fastify/cookie';
import * as qs from 'qs';
import { router } from './router';

// set up server
const fastify = Fastify({
  logger: true,
  querystringParser: (str) => qs.parse(str),
});

fastify.register(FastifyCors);
fastify.register(FastifyCookie);

fastify.get('/healthcheck', (request, reply) => reply.status(200).send());

// register API routes
fastify.register(router, { prefix: '/api' });

export const server = fastify;
