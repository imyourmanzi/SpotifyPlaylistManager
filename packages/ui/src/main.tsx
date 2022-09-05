import { DarkTheme, BaseProvider } from 'baseui';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Client as Styletron } from 'styletron-engine-atomic';
import { Provider as StyletronProvider } from 'styletron-react';
import App from './app/app';

const engine = new Styletron();

const rootElement = document.getElementById('root')!;
rootElement.parentElement?.setAttribute('style', 'background-color: rgb(0, 0, 0)');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <StyletronProvider value={engine}>
        <BaseProvider theme={DarkTheme}>
          <App />
        </BaseProvider>
      </StyletronProvider>
    </BrowserRouter>
  </StrictMode>,
);
