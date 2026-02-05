'use client';

import { useState, useEffect } from 'react';
import { useChainSwitch } from '@/hooks/useChainSwitch';
import { getChainBySlug } from '@/lib/chains';
import { type ChainId } from '@/types';

interface NetworkWarningProps {
  expectedChainSlug: ChainId;
}

export function NetworkWarning({ expectedChainSlug }: NetworkWarningProps) {
  const [mounted, setMounted] = useState(false);
  const { isOnChain, switchToChain, isSwitching, currentChainId } = useChainSwitch();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show anything during SSR or if no wallet connected
  if (!mounted || !currentChainId) {
    return null;
  }

  // Don't show if already on correct chain
  if (isOnChain(expectedChainSlug)) {
    return null;
  }

  const expectedChain = getChainBySlug(expectedChainSlug);
  if (!expectedChain) return null;

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 mb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <svg
            className="w-5 h-5 text-yellow-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-sm text-yellow-200">
            Your wallet is connected to a different network. Switch to{' '}
            <strong>{expectedChain.name}</strong> to mint NFTs.
          </span>
        </div>
        <button
          onClick={() => switchToChain(expectedChainSlug)}
          disabled={isSwitching}
          className="px-4 py-1.5 text-sm font-medium bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isSwitching ? 'Switching...' : `Switch to ${expectedChain.shortName}`}
        </button>
      </div>
    </div>
  );
}
