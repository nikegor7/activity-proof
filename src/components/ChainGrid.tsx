'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAllChains } from '@/lib/chains';

type FilterTab = 'all' | 'active' | 'coming-soon';

export function ChainGrid() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const chains = getAllChains();
  const activeChains = chains.filter((chain) => chain.isActive);
  const comingSoonChains = chains.filter((chain) => !chain.isActive);

  // Sort chains: active first, then coming soon
  const sortedChains = [...activeChains, ...comingSoonChains];

  const filteredChains =
    activeTab === 'all'
      ? sortedChains
      : activeTab === 'active'
      ? activeChains
      : comingSoonChains;

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: chains.length },
    { id: 'active', label: 'Active', count: activeChains.length },
    { id: 'coming-soon', label: 'Coming Soon', count: comingSoonChains.length },
  ];

  return (
    <section>
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-white'
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Chain Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChains.map((chain) =>
          chain.isActive ? (
            <Link
              key={chain.slug}
              href={`/chains/${chain.slug}`}
              className="group p-6 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${chain.iconColor}`} />
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {chain.shortName}
                  </h3>
                  <p className="text-sm text-gray-500">{chain.name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                  Active
                </span>
                <svg
                  className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ) : (
            <div
              key={chain.slug}
              className="p-6 bg-gray-800/30 rounded-xl border border-gray-800 opacity-60"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${chain.iconColor} opacity-50`} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-400">{chain.shortName}</h3>
                  <p className="text-sm text-gray-600">{chain.name}</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                Coming Soon
              </span>
            </div>
          )
        )}
      </div>

      {/* Empty state */}
      {filteredChains.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No chains found for this filter.</p>
        </div>
      )}
    </section>
  );
}
