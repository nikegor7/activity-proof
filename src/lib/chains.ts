import { type ChainConfig, type ChainId } from '@/types';

// Chain registry - add new chains here
export const CHAINS: Record<ChainId, ChainConfig> = {
  'pharos-atlantic': {
    id: 688689,
    slug: 'pharos-atlantic',
    name: 'Pharos Atlantic Testnet',
    shortName: 'Pharos',
    nativeCurrency: {
      name: 'PHRS',
      symbol: 'PHRS',
      decimals: 18,
    },
    rpcUrl: process.env.NEXT_PUBLIC_PHAROS_RPC_URL || 'https://atlantic.dplabs-internal.com',
    explorerUrl: 'https://pharos-testnet.socialscan.io',
    explorerApiUrl: 'https://api.socialscan.io/pharos-atlantic-testnet/v1/developer/api',
    iconColor: 'from-blue-500 to-purple-600',
    isTestnet: true,
    isActive: true,
  },
  'ethereum-sepolia': {
    id: 11155111,
    slug: 'ethereum-sepolia',
    name: 'Ethereum Sepolia',
    shortName: 'Sepolia',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    explorerApiUrl: 'https://api-sepolia.etherscan.io/api',
    iconColor: 'from-gray-500 to-blue-500',
    isTestnet: true,
    isActive: false, // Not yet supported
  },
  'base-sepolia': {
    id: 84532,
    slug: 'base-sepolia',
    name: 'Base Sepolia',
    shortName: 'Base',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    explorerApiUrl: 'https://api-sepolia.basescan.org/api',
    iconColor: 'from-blue-600 to-blue-400',
    isTestnet: true,
    isActive: false, // Not yet supported
  },
  'arbitrum-sepolia': {
    id: 421614,
    slug: 'arbitrum-sepolia',
    name: 'Arbitrum Sepolia',
    shortName: 'Arbitrum',
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    explorerApiUrl: 'https://api-sepolia.arbiscan.io/api',
    iconColor: 'from-blue-400 to-cyan-400',
    isTestnet: true,
    isActive: false, // Not yet supported
  },
  'iopn-testnet': {
    id: 984,
    slug: 'iopn-testnet',
    name: 'IOPN Testnet',
    shortName: 'IOPN',
    nativeCurrency: {
      name: 'OPN',
      symbol: 'OPN',
      decimals: 18,
    },
    rpcUrl: process.env.NEXT_PUBLIC_IOPN_RPC_URL || 'https://testnet-rpc.iopn.tech',
    explorerUrl: 'https://testnet.iopn.tech',
    explorerApiUrl: 'https://testnet.iopn.tech/api',
    iconColor: 'from-emerald-500 to-teal-400',
    isTestnet: true,
    isActive: true,
  },
};

// Get all chains
export function getAllChains(): ChainConfig[] {
  return Object.values(CHAINS);
}

// Get only active chains
export function getActiveChains(): ChainConfig[] {
  return Object.values(CHAINS).filter((chain) => chain.isActive);
}

// Get chain by slug
export function getChainBySlug(slug: ChainId): ChainConfig | undefined {
  return CHAINS[slug];
}

// Get chain by numeric ID
export function getChainById(id: number): ChainConfig | undefined {
  return Object.values(CHAINS).find((chain) => chain.id === id);
}

// Check if chain slug is valid
export function isValidChainSlug(slug: string): slug is ChainId {
  return slug in CHAINS;
}

// Check if chain is active
export function isChainActive(slug: ChainId): boolean {
  return CHAINS[slug]?.isActive ?? false;
}
