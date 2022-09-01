import { Route, Routes, Link } from 'react-router-dom';
import { Me } from '@components/me/Me';
import { SpotifyLoginCallbackHandler } from '@components/spotify-login-callback-handler/SpotifyLoginCallbackHandler';
import { SpotifyAuthProvider } from '@contexts/spotify-auth/SpotifyAuth';
import { LoginLink } from '@components/login-link/LoginLink';

export function App() {
  return (
    <SpotifyAuthProvider>
      <h1>Hello World!</h1>
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
        <Route path="/spotify" element={<LoginLink />} />
        <Route path="/callback" element={<SpotifyLoginCallbackHandler />} />
        <Route path="/me" element={<Me />} />
      </Routes>
    </SpotifyAuthProvider>
  );
}

export default App;
