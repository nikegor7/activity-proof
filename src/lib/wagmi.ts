import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';
import { CHAINS } from './chains';

// Define chains for wagmi/viem
export const pharosTestnet = defineChain({
  id: CHAINS['pharos-atlantic'].id,
  name: CHAINS['pharos-atlantic'].name,
  nativeCurrency: CHAINS['pharos-atlantic'].nativeCurrency,
  rpcUrls: {
    default: {
      http: [CHAINS['pharos-atlantic'].rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: 'Pharos Explorer',
      url: CHAINS['pharos-atlantic'].explorerUrl,
    },
  },
  testnet: true,
});

export const ethereumSepolia = defineChain({
  id: CHAINS['ethereum-sepolia'].id,
  name: CHAINS['ethereum-sepolia'].name,
  nativeCurrency: CHAINS['ethereum-sepolia'].nativeCurrency,
  rpcUrls: {
    default: {
      http: [CHAINS['ethereum-sepolia'].rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: CHAINS['ethereum-sepolia'].explorerUrl,
    },
  },
  testnet: true,
});

export const baseSepolia = defineChain({
  id: CHAINS['base-sepolia'].id,
  name: CHAINS['base-sepolia'].name,
  nativeCurrency: CHAINS['base-sepolia'].nativeCurrency,
  rpcUrls: {
    default: {
      http: [CHAINS['base-sepolia'].rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: 'Basescan',
      url: CHAINS['base-sepolia'].explorerUrl,
    },
  },
  testnet: true,
});

export const arbitrumSepolia = defineChain({
  id: CHAINS['arbitrum-sepolia'].id,
  name: CHAINS['arbitrum-sepolia'].name,
  nativeCurrency: CHAINS['arbitrum-sepolia'].nativeCurrency,
  rpcUrls: {
    default: {
      http: [CHAINS['arbitrum-sepolia'].rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: 'Arbiscan',
      url: CHAINS['arbitrum-sepolia'].explorerUrl,
    },
  },
  testnet: true,
});

export const iopnTestnet = defineChain({
  id: CHAINS['iopn-testnet'].id,
  name: CHAINS['iopn-testnet'].name,
  nativeCurrency: CHAINS['iopn-testnet'].nativeCurrency,
  rpcUrls: {
    default: {
      http: [CHAINS['iopn-testnet'].rpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: 'IOPN Explorer',
      url: CHAINS['iopn-testnet'].explorerUrl,
    },
  },
  testnet: true,
});

// All supported chains
const chains = [pharosTestnet, ethereumSepolia, baseSepolia, arbitrumSepolia, iopnTestnet] as const;

export const config = createConfig({
  chains,
  connectors: [
    injected(),
  ],
  transports: {
    [pharosTestnet.id]: http(),
    [ethereumSepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
    [iopnTestnet.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
