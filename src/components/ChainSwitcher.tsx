'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveChains, getChainBySlug } from '@/lib/chains';
import { useChainSwitch } from '@/hooks/useChainSwitch';
import { type ChainId } from '@/types';

interface ChainSwitcherProps {
  currentChainSlug: ChainId;
}

export function ChainSwitcher({ currentChainSlug }: ChainSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { switchToChain, isSwitching, isOnChain } = useChainSwitch();

  const currentChain = getChainBySlug(currentChainSlug);
  const activeChains = getActiveChains();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChainSelect = async (chainSlug: ChainId) => {
    setIsOpen(false);

    if (chainSlug === currentChainSlug) return;

    // Navigate to the new chain's page
    router.push(`/chains/${chainSlug}`);

    // Try to switch the wallet network
    await switchToChain(chainSlug);
  };

  if (!mounted || !currentChain) {
    return (
      <div className="h-10 w-36 bg-gray-800 rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-750 hover:border-gray-600 transition-colors disabled:opacity-50"
      >
        {/* Chain icon */}
        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${currentChain.iconColor}`} />

        {/* Chain name */}
        <span className="text-sm font-medium text-white">
          {currentChain.shortName}
        </span>

        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {activeChains.map((chain) => {
            const isCurrentPage = chain.slug === currentChainSlug;
            const isWalletOnChain = isOnChain(chain.slug);

            return (
              <button
                key={chain.slug}
                onClick={() => handleChainSelect(chain.slug)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isCurrentPage
                    ? 'bg-gray-700 cursor-default'
                    : 'hover:bg-gray-750'
                }`}
              >
                {/* Chain icon */}
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${chain.iconColor}`} />

                {/* Chain info */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-white block truncate">
                    {chain.shortName}
                  </span>
                </div>

                {/* Status indicators */}
                <div className="flex items-center gap-1">
                  {isCurrentPage && (
                    <span className="text-xs text-gray-400">Current</span>
                  )}
                  {isWalletOnChain && !isCurrentPage && (
                    <span className="w-2 h-2 rounded-full bg-green-500" title="Wallet connected" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
