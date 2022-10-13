# Spotify Playlist Manager

A TypeScript Node project to enable exporting and importing Spotify playlists in various formats.

## Features

### Non-Public Requests

Any requests that need non-public data from Spotify need to provide the bearer token in their request body like:

```js
const body = {
  token: '<BEARER_TOKEN>',
  // ...other body values
};
```

### Playlist Export

On the Playlists page, you can select one or more playlists and export them to a file.

#### UI

The UI can display up to 50 playlists per page, which is the recommended maximum number of playlists to export at once.

Use the checkboxes to select playlists and click the "Export" button. Once the download is ready, a pop-up modal will provide a link to download the file.

#### Server

The endpoint is `POST /api/playlists/export` and accepts a JSON body.

The body should include an array of playlist IDs and their owners' IDs.

```js
const body = {
  playlists: [
    {
      id: '<PLAYLIST_ID>',
      ownerId: '<PLAYLIST_OWNER_ID>',
    },
    // ...
  ],
};
```

It will return an array of playlists, each playlist has the format of the [`GET /playlist`](https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlist) response.

The only exception is:

- if the playlist **is not** owned by the requesting user, it will not have a `tracks` property with the track list enumerated
- if the playlist **is** owned by the requesting user, _all_ of its tracks will be hydrated into the `tracks property
