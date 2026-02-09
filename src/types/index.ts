// Supported chain identifiers
export type ChainId = 'pharos-atlantic' | 'ethereum-sepolia' | 'base-sepolia' | 'arbitrum-sepolia' | 'iopn-testnet';

export type Month = 'September' | 'October' | 'November' | 'December' | 'January' | 'February';

// Chain configuration for multi-chain support
export interface ChainConfig {
  id: number;                    // Numeric chain ID (e.g., 688689 for Pharos)
  slug: ChainId;                 // URL-friendly identifier
  name: string;                  // Display name
  shortName: string;             // Short display name
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrl: string;
  explorerUrl: string;
  explorerApiUrl: string;
  iconColor: string;             // Gradient color for UI
  isTestnet: boolean;
  isActive: boolean;             // Whether this chain is currently supported
}

// Month configuration per chain
export interface MonthConfig {
  name: Month;
  year: number;
  chainSlug: ChainId;
  contractAddress: `0x${string}`;
  startBlock: number;
  endBlock: number;
  metadataURI: string;
}

export interface ActivityResult {
  month: Month;
  chainSlug: ChainId;
  hasActivity: boolean;
  isLoading: boolean;
  isChecked: boolean;
  error: string | null;
}

export interface MintStatus {
  month: Month;
  chainSlug: ChainId;
  hasMinted: boolean;
  isLoading: boolean;
  isMinting: boolean;
  error: string | null;
  txHash: string | null;
}

export interface NFTData {
  tokenId: bigint;
  month: Month;
  chainSlug: ChainId;
  tokenURI: string;
  imageUrl: string;
}
