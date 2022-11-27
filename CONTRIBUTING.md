# CONTRIBUTING

## Running Locally

Start the application like this.

```sh
SPOTIFY_SECRET="<SECRET>" npx nx run-many --target=serve --projects=server,ui
```

Run this to check if the server is running.

```sh
curl localhost:8888/healthcheck
```
