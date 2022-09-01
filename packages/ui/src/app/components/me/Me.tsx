import { useSpotifyAuth } from '@contexts/spotify-auth/SpotifyAuth';
import { useEffect, useState } from 'react';

export const Me = () => {
  const {
    state: { accessToken, refreshToken },
    setAccessToken,
  } = useSpotifyAuth();
  const [userData, setUserData] = useState<Record<string, any> | null>(null);
  const [playlists, setPlaylists] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    console.log('entered useeffect me', { accessToken });

    if (accessToken) {
      fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log({ message: 'me data', data });
          setUserData(data);
        });
    }
  }, []);

  return (
    <>
      {userData && (
        <div id="wrapper">
          <div id="user-profile">
            <h1>Logged in as {userData.display_name}</h1>
            <div className="media">
              <div className="pull-left">
                <img
                  className="media-object"
                  width="150"
                  src={userData.images['0'].url}
                />
              </div>
              <div className="media-body">
                <dl className="dl-horizontal">
                  <dt>Display name</dt>
                  <dd className="clearfix">{userData.display_name}</dd>
                  <dt>Id</dt>
                  <dd id="user-id">{userData.id}</dd>
                  <dt>Email</dt>
                  <dd>{userData.email}</dd>
                  <dt>Spotify URI</dt>
                  <dd>
                    <a href={userData.external_urls.spotify}>
                      {userData.external_urls.spotify}
                    </a>
                  </dd>
                  <dt>Link</dt>
                  <dd>
                    <a href={userData.href}>{userData.href}</a>
                  </dd>
                  <dt>Profile Image</dt>
                  <dd className="clearfix">
                    <a href={userData.images['0'].url}>{userData.images['0'].url}</a>
                  </dd>
                  <dt>Country</dt>
                  <dd>{userData.country}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div id="oauth">
            <h2>oAuth info</h2>
            <dl className="dl-horizontal">
              <dt>Access token</dt>
              <dd className="text-overflow">{accessToken}</dd>
              <dt>Refresh token</dt>
              <dd className="text-overflow">{refreshToken}</dd>
            </dl>
          </div>
          <button
            className="btn btn-default"
            id="obtain-new-token"
            onClick={() => {
              fetch(
                `/api/refresh_token?${new URLSearchParams({
                  refresh_token: refreshToken,
                }).toString()}`,
              ).then(async (response) => {
                const { access_token } = await response.json();
                setAccessToken(access_token);
              });
            }}
          >
            Obtain new token using the refresh token
          </button>
          <button
            className="btn btn-default"
            id="list-playlists"
            onClick={() => {
              fetch(`https://api.spotify.com/v1/users/${userData.id}/playlists`, {
                headers: {
                  Authorization: 'Bearer ' + accessToken,
                },
              }).then(async (response) => {
                const data = await response.json();
                setPlaylists(data.items);
              });
            }}
          >
            List Playlists
          </button>
          {!!playlists.length && (
            <div>
              <h3>Playlists</h3>
              <ul id="playlists">
                {playlists.map((playlist) => (
                  <li key={playlist.id}>{playlist.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
};
