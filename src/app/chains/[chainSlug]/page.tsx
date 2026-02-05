import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ConnectButton } from '@/components/ConnectButton';
import { MintDashboard } from '@/components/MintDashboard';
import { ChainSwitcher } from '@/components/ChainSwitcher';
import { NetworkWarning } from '@/components/NetworkWarning';
import { CHAINS, isValidChainSlug, isChainActive } from '@/lib/chains';
import type { ChainId } from '@/types';

interface ChainPageProps {
  params: Promise<{ chainSlug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(CHAINS).map((chainSlug) => ({
    chainSlug,
  }));
}

export async function generateMetadata({ params }: ChainPageProps) {
  const { chainSlug } = await params;

  if (!isValidChainSlug(chainSlug)) {
    return { title: 'Chain Not Found' };
  }

  const chain = CHAINS[chainSlug as ChainId];
  return {
    title: `${chain.name} - Activity Proof`,
    description: `Verify your on-chain activity on ${chain.name} and claim free NFTs`,
  };
}

export default async function ChainPage({ params }: ChainPageProps) {
  const { chainSlug } = await params;

  if (!isValidChainSlug(chainSlug)) {
    notFound();
  }

  if (!isChainActive(chainSlug as ChainId)) {
    return (
      <div className="min-h-screen">
        <Header chainSlug={chainSlug as ChainId} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Coming Soon</h1>
            <p className="text-lg text-gray-400 mb-8">
              {CHAINS[chainSlug as ChainId].name} support is not yet available.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Chains
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const chain = CHAINS[chainSlug as ChainId];

  return (
    <div className="min-h-screen">
      <Header chainSlug={chainSlug as ChainId} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Network Warning */}
        <NetworkWarning expectedChainSlug={chainSlug as ChainId} />

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${chain.iconColor}`} />
            <h1 className="text-4xl sm:text-5xl font-bold text-white">
              {chain.shortName}
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Verify your activity on {chain.name} and claim exclusive monthly NFTs.
            One free mint per wallet per month.
          </p>
        </div>

        {/* Mint Dashboard */}
        <MintDashboard chainSlug={chainSlug as ChainId} />

        {/* Info Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            }
            color="blue"
            title="Activity Verified"
            description="We check your on-chain transaction history to verify your activity during each month."
          />
          <InfoCard
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            }
            color="green"
            title="100% Free"
            description="No mint price required. Just pay the gas fee to claim your NFT. One mint per wallet per month."
          />
          <InfoCard
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            }
            color="purple"
            title="Unique Artwork"
            description="Each month features unique artwork stored on IPFS. Collect them all to show your journey."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Activity Proof - {chain.name}
            </p>
            <div className="flex items-center gap-6">
              <a
                href={chain.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Explorer
              </a>
              <Link
                href="/"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                All Chains
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Header({ chainSlug }: { chainSlug: ChainId }) {
  return (
    <header className="border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600" />
              <span className="text-lg font-semibold text-white hidden sm:block">
                Activity Proof
              </span>
            </Link>
            <span className="text-gray-600">/</span>
            <ChainSwitcher currentChainSlug={chainSlug} />
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

function InfoCard({
  icon,
  color,
  title,
  description,
}: {
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple';
  title: string;
  description: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    purple: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}
