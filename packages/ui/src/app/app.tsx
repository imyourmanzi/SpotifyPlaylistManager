import { useStyletron } from 'baseui';
import { StyledDivider } from 'baseui/divider';
import { DisplayMedium } from 'baseui/typography';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Home } from '@components/home/Home';
import { Me } from '@components/me/Me';
import { SpotifyLoginCallbackHandler } from '@components/spotify-login-callback-handler/SpotifyLoginCallbackHandler';
import { SpotifyAuthProvider } from '@contexts/spotify-auth/SpotifyAuth';

export function App() {
  const [css] = useStyletron();
  const navigate = useNavigate();

  return (
    <SpotifyAuthProvider>
      <div className={css({ textAlign: 'center', paddingTop: '3rem' })}>
        <DisplayMedium
          className={css({ cursor: 'pointer' })}
          onClick={() => navigate('/')}
        >
          Spotify Playlist Manager
        </DisplayMedium>
        <StyledDivider className={css({ margin: '2rem' })} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<SpotifyLoginCallbackHandler />} />
          <Route path="/me" element={<Me />} />
        </Routes>
      </div>
    </SpotifyAuthProvider>
  );
}

export default App;
