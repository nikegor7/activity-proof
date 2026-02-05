'use client';

import { useSwitchChain, useAccount } from 'wagmi';
import { useCallback } from 'react';
import { getChainBySlug } from '@/lib/chains';
import { type ChainId } from '@/types';

export function useChainSwitch() {
  const { switchChain, isPending, error } = useSwitchChain();
  const { chain: currentChain } = useAccount();

  const switchToChain = useCallback(
    async (chainSlug: ChainId) => {
      const chainConfig = getChainBySlug(chainSlug);
      if (!chainConfig) {
        throw new Error(`Unknown chain: ${chainSlug}`);
      }

      try {
        await switchChain({ chainId: chainConfig.id });
        return true;
      } catch {
        return false;
      }
    },
    [switchChain]
  );

  const isOnChain = useCallback(
    (chainSlug: ChainId) => {
      const chainConfig = getChainBySlug(chainSlug);
      return currentChain?.id === chainConfig?.id;
    },
    [currentChain]
  );

  return {
    switchToChain,
    isOnChain,
    isSwitching: isPending,
    switchError: error,
    currentChainId: currentChain?.id,
  };
}
