import { type Month, type MonthConfig, type ChainId } from '@/types';

export const ACTIVITY_NFT_ABI = [
  {
    inputs: [],
    name: 'mint',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'hasMinted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'defaultTokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'minter', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'tokenURI', type: 'string' },
    ],
    name: 'NFTMinted',
    type: 'event',
  },
] as const;

// Per-chain month configurations
// Block ranges calculated: ~108,000 blocks/day for Pharos
const PHAROS_ATLANTIC_MONTHS: MonthConfig[] = [
  {
    name: 'October',
    year: 2025,
    chainSlug: 'pharos-atlantic',
    contractAddress: (process.env.NEXT_PUBLIC_PHAROS_OCTOBER_ADDRESS || '0x') as `0x${string}`,
    startBlock: 74250,
    endBlock: 2286948,
    metadataURI: 'ipfs://bafkreibf33bsbdof7cpnusn25r7qdgpouky6u4jvyb574reqj7yvh7e6ji',
  },
  {
    name: 'November',
    year: 2025,
    chainSlug: 'pharos-atlantic',
    contractAddress: (process.env.NEXT_PUBLIC_PHAROS_NOVEMBER_ADDRESS || '0x') as `0x${string}`,
    startBlock: 2286949,
    endBlock: 5147719,
    metadataURI: 'ipfs://bafkreicgisxbt2airnuc6ail4zh3bjh4mtj2goeqfwsmbiqpvau2ke53mi',
  },
  {
    name: 'December',
    year: 2025,
    chainSlug: 'pharos-atlantic',
    contractAddress: (process.env.NEXT_PUBLIC_PHAROS_DECEMBER_ADDRESS || '0x') as `0x${string}`,
    startBlock: 5147720,
    endBlock: 8291372,
    metadataURI: 'ipfs://bafkreibfpm6eihhsb6unjwxgdajpvjajiuwdr2qszb3hddon4vw46gaazy',
  },
  {
    name: 'January',
    year: 2026,
    chainSlug: 'pharos-atlantic',
    contractAddress: (process.env.NEXT_PUBLIC_PHAROS_JANUARY_ADDRESS || '0x') as `0x${string}`,
    startBlock: 8291373,
    endBlock: 12326699,
    metadataURI: 'ipfs://bafkreif5ccgpnjsp3hfeympzlapndiv6w57jl22yn4gj4rffjfkodkdzyq',
  },
  {
    name: 'February',
    year: 2026,
    chainSlug: 'pharos-atlantic',
    contractAddress: (process.env.NEXT_PUBLIC_PHAROS_FEBRUARY_ADDRESS || '0x') as `0x${string}`,
    startBlock: 12342700,
    endBlock: 15982250,
    metadataURI: 'ipfs://bafkreienlopqfgcqboytlkmppvgwaz5dd4mhtw2jioakhcixffszjkqnkm',
  },
];

// IOPN Testnet month configurations
// Uses timestamp-based activity verification (block ranges are wide)
const IOPN_TESTNET_MONTHS: MonthConfig[] = [
  {
    name: 'September',
    year: 2025,
    chainSlug: 'iopn-testnet',
    contractAddress: (process.env.NEXT_PUBLIC_IOPN_SEPTEMBER_ADDRESS || '0x') as `0x${string}`,
    startBlock: 1,
    endBlock: 1840000,
    metadataURI: 'ipfs://bafkreif3qwdgs6lxbngmdxp3ozym47avduc5ni2m4jioaa4lmuiqnlobu4',
  },
  {
    name: 'October',
    year: 2025,
    chainSlug: 'iopn-testnet',
    contractAddress: (process.env.NEXT_PUBLIC_IOPN_OCTOBER_ADDRESS || '0x') as `0x${string}`,
    startBlock: 1840001,
    endBlock: 3876000,
    metadataURI: 'ipfs://bafkreie2xkt2rqikimqomwo4uaxznj4e7vqurvydyubgtrqrhf5xes2pmm',
  },
  {
    name: 'November',
    year: 2025,
    chainSlug: 'iopn-testnet',
    contractAddress: (process.env.NEXT_PUBLIC_IOPN_NOVEMBER_ADDRESS || '0x') as `0x${string}`,
    startBlock: 3876001,
    endBlock: 5842000,
    metadataURI: 'ipfs://bafkreihzhiw5g3l3wlvqgd3pn2w53kguj6khcxe4ohylngapfa2v5ndmcy',
  },
  {
    name: 'December',
    year: 2025,
    chainSlug: 'iopn-testnet',
    contractAddress: (process.env.NEXT_PUBLIC_IOPN_DECEMBER_ADDRESS || '0x') as `0x${string}`,
    startBlock: 5842001,
    endBlock: 7884500,
    metadataURI: 'ipfs://bafkreih4mnsw256mpls56lgb53fotuci7y2zttehypcyrmwoq4ph234lxe',
  },
  {
    name: 'January',
    year: 2026,
    chainSlug: 'iopn-testnet',
    contractAddress: (process.env.NEXT_PUBLIC_IOPN_JANUARY_ADDRESS || '0x') as `0x${string}`,
    startBlock: 7884501,
    endBlock: 9916800,
    metadataURI: 'ipfs://bafkreih3lis743od4n6q2pu6nw3lincmwi7u64k4hdoedytl3go5lsekze',
  },
  {
    name: 'February',
    year: 2026,
    chainSlug: 'iopn-testnet',
    contractAddress: (process.env.NEXT_PUBLIC_IOPN_FEBRUARY_ADDRESS || '0x') as `0x${string}`,
    startBlock: 9916801,
    endBlock: 99999999,
    metadataURI: 'ipfs://bafkreig62kkt2cteibt4lmxil6roa63odj5wmtdhgp6mwn2l44xpig7cyq',
  },
];

// Registry of all chain month configs
const CHAIN_MONTH_CONFIGS: Record<ChainId, MonthConfig[]> = {
  'pharos-atlantic': PHAROS_ATLANTIC_MONTHS,
  'ethereum-sepolia': [], // To be configured when chain is active
  'base-sepolia': [],     // To be configured when chain is active
  'arbitrum-sepolia': [], // To be configured when chain is active
  'iopn-testnet': IOPN_TESTNET_MONTHS,
};

// Get month configs for a specific chain
export function getMonthConfigsForChain(chainSlug: ChainId): MonthConfig[] {
  return CHAIN_MONTH_CONFIGS[chainSlug] || [];
}

// Get a specific month config for a chain
export function getMonthConfig(chainSlug: ChainId, month: Month): MonthConfig | undefined {
  return CHAIN_MONTH_CONFIGS[chainSlug]?.find((config) => config.name === month);
}

// Get contract address for a specific chain and month
export function getContractAddress(chainSlug: ChainId, month: Month): `0x${string}` | undefined {
  return getMonthConfig(chainSlug, month)?.contractAddress;
}

// Legacy exports for backward compatibility
export const MONTH_CONFIGS = PHAROS_ATLANTIC_MONTHS;
