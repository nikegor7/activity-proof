import { ConnectButton } from '@/components/ConnectButton';
import { ChainGrid } from '@/components/ChainGrid';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600" />
              <span className="text-lg font-semibold text-white">
                Activity Proof
              </span>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Prove Your On-Chain Activity
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Verify your blockchain activity across multiple networks and claim exclusive monthly NFTs.
            Select a chain below to get started.
          </p>
        </div>

        {/* Chain Grid with Filters */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-white mb-6">Networks</h2>
          <ChainGrid />
        </div>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Select a Chain</h3>
              <p className="text-sm text-gray-400">
                Choose a blockchain network where you&apos;ve been active. Each chain has its own activity verification.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-green-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Verify Activity</h3>
              <p className="text-sm text-gray-400">
                Connect your wallet and we&apos;ll check your transaction history for each month automatically.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Claim NFTs</h3>
              <p className="text-sm text-gray-400">
                Mint free NFTs for each month you were active. One per wallet per month, only gas fees required.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Activity Proof - Multi-Chain Activity Verification
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
