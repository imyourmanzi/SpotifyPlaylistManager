import { Route, Routes, Link } from 'react-router-dom';

export function App() {
  return (
    <>
      <h1>Hello World!</h1>
      {/* START: routes */}
      <Routes>
        <Route
          path="/"
          element={
            <div>
              This is the generated root route.{' '}
              <Link to="/spotify">Click here for Spotify.</Link>
            </div>
          }
        />
        <Route
          path="/spotify"
          element={
            <>
              <div className="container">
                <div id="login">
                  <h1>This is an example of the Authorization Code flow</h1>
                  <button
                    onClick={() => {
                      fetch('/api/login');
                    }}
                    className="btn btn-primary"
                  >
                    Log in with Spotify
                  </button>
                </div>
                <div id="loggedin">
                  <div id="user-profile"></div>
                  <div id="oauth"></div>
                  <button className="btn btn-default" id="obtain-new-token">
                    Obtain new token using the refresh token
                  </button>
                  <button className="btn btn-default" id="list-playlists">
                    List Playlists
                  </button>
                  <div>
                    <h3>Playlists</h3>
                    <ul id="playlists"></ul>
                  </div>
                </div>
              </div>

              {/* <script id="user-profile-template" type="text/x-handlebars-template">
                <h1>Logged in as {{display_name}}</h1>
                <div className='media'>
                  <div className='pull-left'>
                    <img className='media-object' width='150' src='{{images.0.url}}' />
                  </div>
                  <div className='media-body'>
                    <dl className='dl-horizontal'>
                      <dt>Display name</dt><dd className='clearfix'>{{display_name}}</dd>
                      <dt>Id</dt><dd id='user-id'>{{id}}</dd>
                      <dt>Email</dt><dd>{{email}}</dd>
                      <dt>Spotify URI</dt><dd><a
                          href='{{external_urls.spotify}}'
                        >{{external_urls.spotify}}</a></dd>
                      <dt>Link</dt><dd><a href='{{href}}'>{{href}}</a></dd>
                      <dt>Profile Image</dt><dd className='clearfix'><a
                          href='{{images.0.url}}'
                        >{{images.0.url}}</a></dd>
                      <dt>Country</dt><dd>{{country}}</dd>
                    </dl>
                  </div>
                </div>
              </script>

              <script id="oauth-template" type="text/x-handlebars-template">
                <h2>oAuth info</h2>
                <dl className='dl-horizontal'>
                  <dt>Access token</dt><dd className='text-overflow'>{{access_token}}</dd>
                  <dt>Refresh token</dt><dd className='text-overflow'>{{refresh_token}}</dd>
                </dl>
              </script>

              <script src="https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0-alpha.1/handlebars.min.js"></script>
              <script src="https://code.jquery.com/jquery-1.10.1.min.js"></script>
              <script>
                (function () {
                  // Obtains parameters from the hash of the URL
                  // @return Object
                  function getHashParams() {
                    var hashParams = {};
                    var e,
                      r = /([^&;=]+)=?([^&;]*)/g,
                      q = window.location.hash.substring(1);
                    while ((e = r.exec(q))) {
                      hashParams[e[1]] = decodeURIComponent(e[2]);
                    }
                    return hashParams;
                  }

                  var userProfileSource = document.getElementById(
                      'user-profile-template'
                    ).innerHTML,
                    userProfileTemplate = Handlebars.compile(userProfileSource),
                    userProfilePlaceholder = document.getElementById('user-profile');

                  var oauthSource = document.getElementById('oauth-template').innerHTML,
                    oauthTemplate = Handlebars.compile(oauthSource),
                    oauthPlaceholder = document.getElementById('oauth');

                  var params = getHashParams();

                  var access_token = params.access_token,
                    refresh_token = params.refresh_token,
                    error = params.error;

                  if (error) {
                    alert('There was an error during the authentication');
                  } else {
                    if (access_token) {
                      // render oauth info
                      oauthPlaceholder.innerHTML = oauthTemplate({
                        access_token: access_token,
                        refresh_token: refresh_token,
                      });

                      $.ajax({
                        url: 'https://api.spotify.com/v1/me',
                        headers: {
                          Authorization: 'Bearer ' + access_token,
                        },
                        success: function (response) {
                          userProfilePlaceholder.innerHTML = userProfileTemplate(response);

                          $('#login').hide();
                          $('#loggedin').show();
                        },
                      });
                    } else {
                      // render initial screen
                      $('#login').show();
                      $('#loggedin').hide();
                    }

                    document.getElementById('obtain-new-token').addEventListener(
                      'click',
                      function () {
                        $.ajax({
                          url: '/refresh_token',
                          data: {
                            refresh_token: refresh_token,
                          },
                        }).done(function (data) {
                          access_token = data.access_token;
                          oauthPlaceholder.innerHTML = oauthTemplate({
                            access_token: access_token,
                            refresh_token: refresh_token,
                          });
                        });
                      },
                      false
                    );

                    document.getElementById('list-playlists').addEventListener('click', () => {
                      $.ajax({
                        url:
                          'https://api.spotify.com/v1/users/' + $('#user-id').text() + '/playlists',
                        headers: {
                          Authorization: 'Bearer ' + access_token,
                        },
                      }).done((data) => {
                        var ulel = $('#playlists');
                        data.items.forEach((i) => ulel.append('<li>' + i.name + '</li>'));
                      });
                    });
                  }
                })();
              </script> */}
            </>
          }
        />
      </Routes>
      {/* END: routes */}
    </>
  );
}

export default App;
