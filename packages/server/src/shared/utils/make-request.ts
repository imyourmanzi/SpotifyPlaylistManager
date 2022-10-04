import { request as makeRequest } from 'undici';

export type RequestOptions = Parameters<typeof makeRequest>['1'];

export { makeRequest };
