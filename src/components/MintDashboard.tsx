'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useActivityCheck } from '@/hooks/useActivityCheck';
import { MintCard } from './MintCard';
import { getMonthConfigsForChain } from '@/lib/contracts';
import { CHAINS } from '@/lib/chains';
import { type Month, type ChainId } from '@/types';

interface MintDashboardProps {
  chainSlug: ChainId;
}

export function MintDashboard({ chainSlug }: MintDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();
  const { results, isCheckingAll, refreshActivity } = useActivityCheck(chainSlug);
  const monthConfigs = getMonthConfigsForChain(chainSlug);
  const chain = CHAINS[chainSlug];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4 animate-pulse" />
        <div className="h-6 w-48 bg-gray-800 rounded mx-auto mb-2 animate-pulse" />
        <div className="h-4 w-64 bg-gray-800 rounded mx-auto animate-pulse" />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
          <svg
            className="w-8 h-8 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Connect your wallet to check your activity and mint NFTs for the months
          you were active on {chain.name}.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Activity NFTs</h2>
          <p className="text-gray-400 mt-1">
            Claim NFTs for months you were active on {chain.name}
          </p>
        </div>
        <button
          onClick={refreshActivity}
          disabled={isCheckingAll}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <svg
            className={`w-4 h-4 ${isCheckingAll ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isCheckingAll ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      {/* Progress indicator when checking all months */}
      {isCheckingAll && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-blue-400">
              Checking your transaction history across all months...
            </span>
          </div>
        </div>
      )}

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {monthConfigs.map((config) => (
          <MintCard
            key={config.name}
            chainSlug={chainSlug}
            month={config.name as Month}
            activity={results[config.name as Month]}
          />
        ))}
      </div>
    </div>
  );
}
