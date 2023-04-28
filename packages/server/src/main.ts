import { server } from './server';
import { environment } from './environments/environment';

const { port } = environment;
server.listen({ port }, (error) => {
  if (error) {
    server.log.error(error);
    process.exit(1);
  }
});
