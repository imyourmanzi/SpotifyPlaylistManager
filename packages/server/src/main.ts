import { setUpServer } from './server';
import { environment } from './environments/environment';

const { host, port } = environment;
setUpServer()
  .then((server) => {
    server.listen({ host, port }, (error) => {
      if (error) {
        server.log.error(error);
        process.exit(1);
      }
    });
  })
  .catch((error) => {
    console.error({ msg: 'Server failed to start up!', error: { ...error } });
  });
