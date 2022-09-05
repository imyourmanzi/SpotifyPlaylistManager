import { DarkTheme, BaseProvider, LightTheme } from 'baseui';
import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import { SpotifyAuthProvider } from '@contexts/spotify-auth/SpotifyAuth';
import App from './app/app';

const engine = new Styletron();

const rootElement = document.getElementById('root')!;

const getLightThemeQuery = () => window.matchMedia('(prefers-color-scheme: light)');

const setBodyBackground = (light: boolean) => {
  (rootElement.parentElement as HTMLBodyElement).style.backgroundColor = light
    ? 'rgb(245,247,250)'
    : 'rgb(0,0,27)';
};

const AppWithProviders = () => {
  const [useLightTheme, setUseLightTheme] = useState(getLightThemeQuery().matches);
  setBodyBackground(useLightTheme);

  const updateTheme = useCallback((event: MediaQueryListEvent) => {
    const requestedLightTheme = event.matches;
    setUseLightTheme(requestedLightTheme);
  }, []);

  useEffect(() => {
    const mediaQuery = getLightThemeQuery();
    mediaQuery.addEventListener('change', updateTheme);

    // this is the cleanup function to remove the listener
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={useLightTheme ? LightTheme : DarkTheme}>
        <SpotifyAuthProvider>
          <App />
        </SpotifyAuthProvider>
      </BaseProvider>
    </StyletronProvider>
  );
};

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <AppWithProviders />
    </BrowserRouter>
  </StrictMode>,
);
