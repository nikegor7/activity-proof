import { type Month, type ChainId } from '@/types';
import { getMonthConfigsForChain } from '../contracts';
import { checkActivity as checkPharosActivity } from './pharos';
import { checkActivity as checkIopnActivity } from './iopn';

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

function getChainChecker(chainSlug: ChainId) {
  switch (chainSlug) {
    case 'pharos-atlantic':
      return checkPharosActivity;
    case 'iopn-testnet':
      return checkIopnActivity;
    default:
      return null;
  }
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

  const checker = getChainChecker(chainSlug);
  if (!checker) {
    return false;
  }

  const hasActivity = await checker(address, config.startBlock, config.endBlock, onProgress);
  setCachedResult(address, chainSlug, month, hasActivity);
  return hasActivity;
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

  // Check months sequentially to avoid overwhelming the explorer API
  for (const config of monthConfigs) {
    // Skip months with no deployed contract
    if (!config.contractAddress || config.contractAddress === '0x') {
      onMonthComplete?.(config.name, false);
      continue;
    }

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
