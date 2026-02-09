'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { type Month, type ChainId } from '@/types';
import { ACTIVITY_NFT_ABI, getContractAddress } from '@/lib/contracts';

const CONFIRM_TIMEOUT_MS = 60_000; // 60 seconds
const STORAGE_KEY = 'activity-proof-pending-mints';

interface PendingMint {
  txHash: `0x${string}`;
  timestamp: number;
}

// Pending mints stored as: { "chainSlug:month:address": { txHash, timestamp } }
type PendingMints = Record<string, PendingMint>;

function getPendingMintKey(chainSlug: ChainId, month: Month, address: string): string {
  return `${chainSlug}:${month}:${address.toLowerCase()}`;
}

function loadPendingMints(): PendingMints {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePendingMint(chainSlug: ChainId, month: Month, address: string, txHash: `0x${string}`) {
  try {
    const mints = loadPendingMints();
    mints[getPendingMintKey(chainSlug, month, address)] = { txHash, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mints));
  } catch { /* ignore storage errors */ }
}

function clearPendingMint(chainSlug: ChainId, month: Month, address: string) {
  try {
    const mints = loadPendingMints();
    delete mints[getPendingMintKey(chainSlug, month, address)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mints));
  } catch { /* ignore storage errors */ }
}

function getPendingMint(chainSlug: ChainId, month: Month, address: string): PendingMint | null {
  const mints = loadPendingMints();
  return mints[getPendingMintKey(chainSlug, month, address)] ?? null;
}

interface UseMintReturn {
  hasMinted: boolean;
  isLoadingMintStatus: boolean;
  isMinting: boolean;
  isConfirming: boolean;
  isConfirmTimeout: boolean;
  mint: () => void;
  error: string | null;
  txHash: `0x${string}` | undefined;
  isSuccess: boolean;
  reset: () => void;
  totalSupply: bigint | undefined;
  maxSupply: bigint | undefined;
  isLoadingSupply: boolean;
}

export function useMint(chainSlug: ChainId, month: Month): UseMintReturn {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const contractAddress = getContractAddress(chainSlug, month);

  // Restore pending mint txHash from localStorage on mount
  const [restoredTxHash, setRestoredTxHash] = useState<`0x${string}` | undefined>(undefined);

  useEffect(() => {
    if (!address) return;
    const pending = getPendingMint(chainSlug, month, address);
    if (pending) {
      setRestoredTxHash(pending.txHash);
    }
  }, [chainSlug, month, address]);

  // Check if user has already minted
  const {
    data: hasMintedData,
    isLoading: isLoadingMintStatus,
    refetch: refetchMintStatus,
  } = useReadContract({
    address: contractAddress,
    abi: ACTIVITY_NFT_ABI,
    functionName: 'hasMinted',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contractAddress && contractAddress !== '0x',
    },
  });

  // Read total supply
  const {
    data: totalSupplyData,
    isLoading: isLoadingTotalSupply,
    refetch: refetchTotalSupply,
  } = useReadContract({
    address: contractAddress,
    abi: ACTIVITY_NFT_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!contractAddress && contractAddress !== '0x',
    },
  });

  // Read max supply
  const {
    data: maxSupplyData,
    isLoading: isLoadingMaxSupply,
  } = useReadContract({
    address: contractAddress,
    abi: ACTIVITY_NFT_ABI,
    functionName: 'maxSupply',
    query: {
      enabled: !!contractAddress && contractAddress !== '0x',
    },
  });

  // Write contract hook
  const {
    writeContract,
    data: writeTxHash,
    isPending: isMinting,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  // Use writeTxHash when available, fall back to restored hash
  const txHash = writeTxHash ?? restoredTxHash;

  // Persist txHash to localStorage when a new mint tx is sent
  useEffect(() => {
    if (writeTxHash && address) {
      savePendingMint(chainSlug, month, address, writeTxHash);
    }
  }, [writeTxHash, chainSlug, month, address]);

  // Wait for transaction confirmation
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: receiptFetched,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Derive actual transaction success from receipt status
  const isSuccess = receiptFetched && receipt?.status === 'success';
  const isReverted = receiptFetched && receipt?.status === 'reverted';

  // Clear localStorage when mint is confirmed (success or revert)
  useEffect(() => {
    if ((isSuccess || isReverted) && address) {
      clearPendingMint(chainSlug, month, address);
      setRestoredTxHash(undefined);
    }
  }, [isSuccess, isReverted, chainSlug, month, address]);

  // Also clear localStorage when contract confirms hasMinted
  useEffect(() => {
    if (hasMintedData && address) {
      clearPendingMint(chainSlug, month, address);
      setRestoredTxHash(undefined);
    }
  }, [hasMintedData, chainSlug, month, address]);

  // Confirmation timeout - RPC may lag behind block explorer
  const [isConfirmTimeout, setIsConfirmTimeout] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (isConfirming && txHash) {
      // For restored txHashes, check if the original tx is already old enough to timeout immediately
      if (restoredTxHash && !writeTxHash && address) {
        const pending = getPendingMint(chainSlug, month, address);
        if (pending && Date.now() - pending.timestamp >= CONFIRM_TIMEOUT_MS) {
          setIsConfirmTimeout(true);
          return;
        }
      }
      timeoutRef.current = setTimeout(() => {
        setIsConfirmTimeout(true);
      }, CONFIRM_TIMEOUT_MS);
    } else {
      setIsConfirmTimeout(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isConfirming, txHash, restoredTxHash, writeTxHash, address, chainSlug, month]);

  // Refetch mint status and supply after successful mint or confirmation timeout
  useEffect(() => {
    if (isSuccess || isConfirmTimeout) {
      refetchMintStatus();
      refetchTotalSupply();
    }
  }, [isSuccess, isConfirmTimeout, refetchMintStatus, refetchTotalSupply]);

  // Handle errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || 'Failed to mint');
    } else if (confirmError) {
      setError(confirmError.message || 'Transaction failed');
    } else if (isReverted) {
      setError('Transaction reverted on-chain. The mint may have failed due to eligibility, supply limit, or contract conditions.');
    }
  }, [writeError, confirmError, isReverted]);

  const mint = useCallback(() => {
    if (!contractAddress || contractAddress === '0x' || !isConnected) {
      setError('Wallet not connected or contract not deployed');
      return;
    }

    setError(null);
    writeContract({
      address: contractAddress,
      abi: ACTIVITY_NFT_ABI,
      functionName: 'mint',
    });
  }, [contractAddress, isConnected, writeContract]);

  const reset = useCallback(() => {
    setError(null);
    setIsConfirmTimeout(false);
    if (address) {
      clearPendingMint(chainSlug, month, address);
    }
    setRestoredTxHash(undefined);
    resetWrite();
  }, [resetWrite, address, chainSlug, month]);

  return {
    hasMinted: hasMintedData ?? false,
    isLoadingMintStatus,
    isMinting,
    isConfirming,
    isConfirmTimeout,
    mint,
    error,
    txHash,
    isSuccess,
    reset,
    totalSupply: totalSupplyData as bigint | undefined,
    maxSupply: maxSupplyData as bigint | undefined,
    isLoadingSupply: isLoadingTotalSupply || isLoadingMaxSupply,
  };
}
