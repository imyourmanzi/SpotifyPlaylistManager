import { server } from './server';

server.listen({ port: 8888 }, (error) => {
  if (error) {
    server.log.error(error);
    process.exit(1);
  }
});
