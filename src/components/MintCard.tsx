'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { type Month, type ActivityResult, type ChainId } from '@/types';
import { useMint } from '@/hooks/useMint';
import { getMonthConfigsForChain } from '@/lib/contracts';
import { CHAINS } from '@/lib/chains';

interface MintCardProps {
  chainSlug: ChainId;
  month: Month;
  activity: ActivityResult;
  onCheckEligibility?: () => void;
}

export function MintCard({ chainSlug, month, activity, onCheckEligibility }: MintCardProps) {
  const {
    hasMinted,
    isLoadingMintStatus,
    isMinting,
    isConfirming,
    isConfirmTimeout,
    mint,
    error,
    txHash,
    isSuccess,
    reset,
    totalSupply,
    maxSupply,
    isLoadingSupply,
  } = useMint(chainSlug, month);

  const monthConfigs = getMonthConfigsForChain(chainSlug);
  const config = monthConfigs.find((c) => c.name === month);
  const chain = CHAINS[chainSlug];
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!config?.metadataURI) return;

    const metadataUrl = `${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/${config.metadataURI.replace('ipfs://', '')}`;

    fetch(metadataUrl)
      .then((res) => res.json())
      .then((metadata) => {
        const imageCid = metadata.image.replace('ipfs://', '');
        setImageUrl(`${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/${imageCid}`);
        setImageError(false);
      })
      .catch(() => {
        setImageError(true);
      });
  }, [config?.metadataURI]);

  // Determine card state
  const isLoading = activity?.isLoading || isLoadingMintStatus;
  const canMint = activity?.hasActivity && !hasMinted && !isLoading;
  const isPending = (isMinting || isConfirming) && !error && !isConfirmTimeout;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        hasMinted
          ? 'border-green-500/50 bg-green-500/10'
          : activity?.hasActivity
          ? 'border-blue-500/50 bg-blue-500/10 hover:border-blue-400'
          : 'border-gray-700 bg-gray-800/50'
      }`}
    >
      {/* NFT Image */}
      <div className="aspect-square relative bg-gray-900">
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={`${month} ${config?.year} NFT`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover ${
              !activity?.hasActivity && !hasMinted ? 'opacity-30 grayscale' : ''
            }`}
          />
        ) : imageError ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
            Failed to load image
          </div>
        ) : null}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {hasMinted ? (
            <span className="px-3 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
              Minted
            </span>
          ) : activity?.hasActivity ? (
            <span className="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
              Eligible
            </span>
          ) : activity?.isChecked ? (
            <span className="px-3 py-1 text-xs font-medium bg-gray-600 text-gray-300 rounded-full">
              No Activity
            </span>
          ) : null}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white">
          {month} {config?.year}
        </h3>

        {/* Supply Progress */}
        {!isLoadingSupply && totalSupply !== undefined && maxSupply !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>{Number(totalSupply).toLocaleString()} minted</span>
              <span>{Number(maxSupply - totalSupply).toLocaleString()} remaining</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${Math.min((Number(totalSupply) / Number(maxSupply)) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
            Checking eligibility...
          </div>
        )}

        {/* Not Checked State - Show check button */}
        {!isLoading && !activity?.isChecked && !hasMinted && onCheckEligibility && (
          <button
            onClick={onCheckEligibility}
            className="mt-3 w-full py-2 px-4 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Check eligibility
          </button>
        )}

        {/* No Activity State */}
        {!isLoading && activity?.isChecked && !activity?.hasActivity && !hasMinted && (
          <p className="mt-2 text-sm text-gray-500">
            No transactions found in {month}
          </p>
        )}

        {/* Already Minted State */}
        {hasMinted && (
          <p className="mt-2 text-sm text-green-400">
            You have claimed this NFT
          </p>
        )}

        {/* Mint Button */}
        {canMint && (
          <button
            onClick={mint}
            disabled={isPending}
            className="mt-4 w-full py-2.5 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                {isMinting ? 'Confirm in wallet...' : 'Minting...'}
              </span>
            ) : (
              'Mint NFT'
            )}
          </button>
        )}

        {/* Success Message */}
        {isSuccess && txHash && (
          <div className="mt-3 p-2 bg-green-500/20 rounded-lg">
            <p className="text-sm text-green-400">Minted successfully!</p>
            <a
              href={`${chain.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              View transaction
            </a>
          </div>
        )}

        {/* Confirmation Timeout - RPC lag */}
        {isConfirmTimeout && !isSuccess && !error && txHash && (
          <div className="mt-3 p-2 bg-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-400">
              Transaction sent but confirmation is taking longer than expected.
              {hasMinted ? ' It looks like the mint succeeded!' : ' Check the explorer to verify.'}
            </p>
            <a
              href={`${chain.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:underline"
            >
              View on explorer
            </a>
            <button
              onClick={reset}
              className="mt-1 block text-xs text-gray-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-2 bg-red-500/20 rounded-lg">
            <p className="text-sm text-red-400 truncate">{error}</p>
            <button
              onClick={reset}
              className="mt-1 text-xs text-gray-400 hover:text-white"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
