/* GridCredits — wallet.js
 * Real wallet connect via Reown AppKit (ethers adapter), Robinhood Chain mainnet.
 * Cara pakai: isi PROJECT_ID di bawah, lalu pastikan domain situs sudah
 * di-allowlist di dashboard Reown (cloud.reown.com > Project > Domain).
 * Di tiap halaman cukup: <script type="module" src="wallet.js"></script>
 */

const PROJECT_ID = 'd8f269a388cef485d24250c6d19a496a';

import { createAppKit } from 'https://esm.sh/@reown/appkit';
import { EthersAdapter } from 'https://esm.sh/@reown/appkit-adapter-ethers';
import { defineChain } from 'https://esm.sh/@reown/appkit/networks';

const robinhood = defineChain({
  id: 4663,
  caipNetworkId: 'eip155:4663',
  chainNamespace: 'eip155',
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.mainnet.chain.robinhood.com'] } },
  blockExplorers: { default: { name: 'Blockscout', url: 'https://robinhoodchain.blockscout.com' } }
});

const BTN_SELECTOR = '.navright .btn-navy, .navlinks .mwallet';
const DEFAULT_LABEL = 'CONNECT WALLET';

let appkit = null;
try {
  if (!PROJECT_ID || PROJECT_ID.startsWith('YOUR_')) throw new Error('PROJECT_ID belum diisi di wallet.js');
  appkit = createAppKit({
    adapters: [new EthersAdapter()],
    networks: [robinhood],
    defaultNetwork: robinhood,
    projectId: PROJECT_ID,
    metadata: {
      name: 'GridCredits',
      description: 'GridCredits — modular grid character NFTs',
      url: window.location.origin,
      icons: []
    },
    features: { analytics: false, email: false, socials: false, onramp: false, swaps: false },
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#18284D',
      '--w3m-border-radius-master': '0px'
    }
  });
} catch (err) {
  console.error('[wallet.js]', err);
}

const short = (a) => a.slice(0, 6) + '…' + a.slice(-4);

function setLabel(text) {
  document.querySelectorAll(BTN_SELECTOR).forEach((b) => { b.textContent = text; });
}

document.querySelectorAll(BTN_SELECTOR).forEach((b) => {
  b.addEventListener('click', (e) => {
    e.preventDefault();
    if (!appkit) { alert('Wallet belum dikonfigurasi (Project ID belum diisi).'); return; }
    // Belum konek -> modal pilih wallet. Sudah konek -> modal akun (ada tombol Disconnect).
    appkit.open();
  });
});

if (appkit) {
  appkit.subscribeAccount((acc) => {
    if (acc && acc.isConnected && acc.address) {
      setLabel(short(acc.address).toUpperCase());
      window.gridWallet = { address: acc.address, appkit };
    } else {
      setLabel(DEFAULT_LABEL);
      window.gridWallet = { address: null, appkit };
    }
    document.dispatchEvent(new CustomEvent('gridwallet:change', { detail: { address: acc && acc.address || null } }));
  });
}
