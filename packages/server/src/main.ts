import { server } from './server';
import { environment } from './environments/environment';

const { host, port } = environment;
server.listen({ host, port }, (error) => {
  if (error) {
    server.log.error(error);
    process.exit(1);
  }
});
