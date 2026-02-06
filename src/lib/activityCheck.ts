import { type Month, type ChainId } from '@/types';
import { getMonthConfigsForChain } from './contracts';
import { CHAINS } from './chains';

const BLOCK_CHUNK_SIZE = 50000;
const IOPN_BLOCK_CHUNK_SIZE = 500000;
const MAX_CONCURRENT_REQUESTS = 5;
const IOPN_MAX_CONCURRENT_REQUESTS = 2;

// Chains that need server-side proxy (no CORS headers on explorer API)
const PROXY_CHAINS: ChainId[] = ['iopn-testnet'];

// Chains that use timestamp-based verification instead of block ranges
const TIMESTAMP_BASED_CHAINS: ChainId[] = [];

interface TxListResponse {
  status: string;
  message: string;
  result: Array<{
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
  }>;
}

// Get Unix timestamp range for a month
function getMonthTimestampRange(month: Month, year: number): { start: number; end: number } {
  const monthIndex: Record<Month, number> = {
    September: 8,
    October: 9,
    November: 10,
    December: 11,
    January: 0,
    February: 1,
  };

  const startDate = new Date(Date.UTC(year, monthIndex[month], 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, monthIndex[month] + 1, 0, 23, 59, 59));

  return {
    start: Math.floor(startDate.getTime() / 1000),
    end: Math.floor(endDate.getTime() / 1000),
  };
}

function getCacheKey(address: string, chainSlug: ChainId, month: Month): string {
  return `activity_${chainSlug}_${address.toLowerCase()}_${month}`;
}

function getCachedResult(address: string, chainSlug: ChainId, month: Month): boolean | null {
  if (typeof window === 'undefined') return null;
  const cached = localStorage.getItem(getCacheKey(address, chainSlug, month));
  if (cached) {
    const { hasActivity, timestamp } = JSON.parse(cached);
    // Cache for 1 hour
    if (Date.now() - timestamp < 3600000) {
      return hasActivity;
    }
  }
  return null;
}

function setCachedResult(address: string, chainSlug: ChainId, month: Month, hasActivity: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    getCacheKey(address, chainSlug, month),
    JSON.stringify({ hasActivity, timestamp: Date.now() })
  );
}

function getApiKey(chainSlug: ChainId): string {
  switch (chainSlug) {
    case 'pharos-atlantic':
      return process.env.NEXT_PUBLIC_SOCIALSCAN_API_KEY || '';
    case 'ethereum-sepolia':
      return process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';
    case 'base-sepolia':
      return process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '';
    case 'arbitrum-sepolia':
      return process.env.NEXT_PUBLIC_ARBISCAN_API_KEY || '';
    case 'iopn-testnet':
      return process.env.NEXT_PUBLIC_IOPN_API_KEY || '';
    default:
      return '';
  }
}

async function fetchTransactions(
  address: string,
  chainSlug: ChainId,
  startBlock: number,
  endBlock: number
): Promise<boolean> {
  let url: string;

  if (PROXY_CHAINS.includes(chainSlug)) {
    // Use server-side proxy to avoid CORS issues
    url = `/api/explorer?chain=${chainSlug}&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=1&sort=asc`;
  } else {
    const chain = CHAINS[chainSlug];
    const apiKey = getApiKey(chainSlug);
    url = `${chain.explorerApiUrl}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=1&sort=asc&apikey=${apiKey}`;
  }

  try {
    const response = await fetch(url);
    const data: TxListResponse = await response.json();
    return data.status === '1' && data.result && data.result.length > 0;
  } catch {
    return false;
  }
}

// Fetch all transactions and filter by timestamp for chains without block-based limits
async function checkActivityByTimestamp(
  address: string,
  chainSlug: ChainId,
  month: Month,
  year: number
): Promise<boolean> {
  const chain = CHAINS[chainSlug];
  const apiKey = getApiKey(chainSlug);
  const { start: startTimestamp, end: endTimestamp } = getMonthTimestampRange(month, year);

  const url = `${chain.explorerApiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data: TxListResponse = await response.json();

    if (data.status !== '1' || !data.result || data.result.length === 0) {
      return false;
    }

    // Filter transactions by timestamp
    return data.result.some((tx) => {
      const txTimestamp = parseInt(tx.timeStamp, 10);
      return txTimestamp >= startTimestamp && txTimestamp <= endTimestamp;
    });
  } catch {
    return false;
  }
}

async function checkChunkBatch(
  address: string,
  chainSlug: ChainId,
  chunks: Array<{ start: number; end: number }>
): Promise<boolean> {
  const results = await Promise.all(
    chunks.map((chunk) => fetchTransactions(address, chainSlug, chunk.start, chunk.end))
  );
  return results.some((hasActivity) => hasActivity);
}

export async function checkActivityForMonth(
  address: string,
  chainSlug: ChainId,
  month: Month,
  onProgress?: (checked: number, total: number) => void
): Promise<boolean> {
  // Check cache first
  const cached = getCachedResult(address, chainSlug, month);
  if (cached !== null) {
    return cached;
  }

  const monthConfigs = getMonthConfigsForChain(chainSlug);
  const config = monthConfigs.find((c) => c.name === month);
  if (!config) {
    throw new Error(`Invalid month: ${month} for chain: ${chainSlug}`);
  }

  // Use timestamp-based verification for certain chains
  if (TIMESTAMP_BASED_CHAINS.includes(chainSlug)) {
    onProgress?.(0, 1);
    const hasActivity = await checkActivityByTimestamp(address, chainSlug, month, config.year);
    onProgress?.(1, 1);
    setCachedResult(address, chainSlug, month, hasActivity);
    return hasActivity;
  }

  // Block-based verification for other chains
  const { startBlock, endBlock } = config;
  const chunkSize = PROXY_CHAINS.includes(chainSlug) ? IOPN_BLOCK_CHUNK_SIZE : BLOCK_CHUNK_SIZE;
  const maxConcurrent = PROXY_CHAINS.includes(chainSlug) ? IOPN_MAX_CONCURRENT_REQUESTS : MAX_CONCURRENT_REQUESTS;
  const totalBlocks = endBlock - startBlock;
  const totalChunks = Math.ceil(totalBlocks / chunkSize);

  // Create all chunks
  const chunks: Array<{ start: number; end: number }> = [];
  for (let i = 0; i < totalChunks; i++) {
    const chunkStart = startBlock + i * chunkSize;
    const chunkEnd = Math.min(chunkStart + chunkSize - 1, endBlock);
    chunks.push({ start: chunkStart, end: chunkEnd });
  }

  // Process chunks in batches with early exit
  let checkedChunks = 0;
  for (let i = 0; i < chunks.length; i += maxConcurrent) {
    const batch = chunks.slice(i, i + MAX_CONCURRENT_REQUESTS);
    const hasActivity = await checkChunkBatch(address, chainSlug, batch);

    checkedChunks += batch.length;
    onProgress?.(checkedChunks, totalChunks);

    if (hasActivity) {
      setCachedResult(address, chainSlug, month, true);
      return true;
    }
  }

  setCachedResult(address, chainSlug, month, false);
  return false;
}

export async function checkAllMonthsActivity(
  address: string,
  chainSlug: ChainId,
  onMonthComplete?: (month: Month, hasActivity: boolean) => void
): Promise<Record<Month, boolean>> {
  const results: Record<Month, boolean> = {
    September: false,
    October: false,
    November: false,
    December: false,
    January: false,
    February: false,
  };

  const monthConfigs = getMonthConfigsForChain(chainSlug);

  // Check months sequentially to avoid rate limiting
  for (const config of monthConfigs) {
    const hasActivity = await checkActivityForMonth(address, chainSlug, config.name);
    results[config.name] = hasActivity;
    onMonthComplete?.(config.name, hasActivity);
  }

  return results;
}

export function clearActivityCache(address?: string, chainSlug?: ChainId): void {
  if (typeof window === 'undefined') return;

  if (address && chainSlug) {
    const monthConfigs = getMonthConfigsForChain(chainSlug);
    monthConfigs.forEach((config) => {
      localStorage.removeItem(getCacheKey(address, chainSlug, config.name));
    });
  } else {
    // Clear all activity cache
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('activity_')) {
        localStorage.removeItem(key);
      }
    });
  }
}
