# Server

## Running Locally

Start the server like this.

```sh
CLIENT_SECRET="<client secret>" npx nx serve server
```

Run this to check if the server is running.

```sh
curl localhost:8888/verify

# jq version:
# curl localhost:8888/verify -s | jq
```
