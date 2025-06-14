import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThirdwebProvider } from '@thirdweb-dev/react';
import App from './pages/App';
import WalletProvider from './context/WalletProvider';
import { THIRDWEB_CLIENT_ID, ALCHEMY_API_KEY, CHAIN_CONFIG, BASE_CHAINS, CustomBaseSepoliaChain } from './config/thirdweb.jsx';
import './utils/polyfills'; // Import polyfills to fix Buffer errors
import './styles/index.css';
import './styles/guide.css'; // Import guide styles

ReactDOM.createRoot(document.getElementById('root')).render(  <React.StrictMode>
    <ThirdwebProvider 
      activeChain={CustomBaseSepoliaChain}
      clientId={THIRDWEB_CLIENT_ID}
      supportedChains={BASE_CHAINS}
      dAppMeta={{
        name: "Chronos Protocol",
        description: "Blockchain-based time commitment platform",
        logoUrl: "/chronos-logo.svg",
        url: window.location.origin,
      }}
      sdkOptions={{
        alchemyApiKey: ALCHEMY_API_KEY,
        gasSettings: {
          maxPriceInGwei: 500,
          speed: "standard"
        },
      }}
    >
      <WalletProvider>
        <App />
      </WalletProvider>
    </ThirdwebProvider>
  </React.StrictMode>
);
