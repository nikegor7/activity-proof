'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount } from 'wagmi';
import { type Month, type ActivityResult, type ChainId } from '@/types';
import { checkActivityForMonth, checkAllMonthsActivity, clearActivityCache } from '@/lib/activityCheck';
import { getMonthConfigsForChain } from '@/lib/contracts';

// Determine the current month name from the date
function getCurrentMonth(): Month | null {
  const monthNames: Month[] = [
    'January', 'February', 'September', 'October', 'November', 'December',
  ];
  const now = new Date();
  const name = now.toLocaleString('en-US', { month: 'long' }) as Month;
  return monthNames.includes(name) ? name : null;
}

export function useActivityCheck(chainSlug: ChainId) {
  const { address, isConnected } = useAccount();
  const monthConfigs = getMonthConfigsForChain(chainSlug);

  const [results, setResults] = useState<Record<Month, ActivityResult>>(() => {
    const initial: Record<Month, ActivityResult> = {} as Record<Month, ActivityResult>;
    monthConfigs.forEach((config) => {
      initial[config.name] = {
        month: config.name,
        chainSlug,
        hasActivity: false,
        isLoading: false,
        isChecked: false,
        error: null,
      };
    });
    return initial;
  });
  const [isCheckingAll, setIsCheckingAll] = useState(false);
  const checkingRef = useRef(false);

  const checkMonth = useCallback(
    async (month: Month) => {
      if (!address) return;

      setResults((prev) => ({
        ...prev,
        [month]: { ...prev[month], isLoading: true, error: null },
      }));

      try {
        const hasActivity = await checkActivityForMonth(address, chainSlug, month);
        setResults((prev) => ({
          ...prev,
          [month]: { ...prev[month], hasActivity, isLoading: false, isChecked: true },
        }));
      } catch (error) {
        setResults((prev) => ({
          ...prev,
          [month]: {
            ...prev[month],
            isLoading: false,
            isChecked: true,
            error: error instanceof Error ? error.message : 'Failed to check activity',
          },
        }));
      }
    },
    [address, chainSlug]
  );

  const checkAllMonths = useCallback(async () => {
    if (!address || checkingRef.current) return;
    checkingRef.current = true;

    setIsCheckingAll(true);

    // Set all months to loading
    setResults((prev) => {
      const updated = { ...prev };
      monthConfigs.forEach((config) => {
        updated[config.name] = { ...updated[config.name], isLoading: true, error: null };
      });
      return updated;
    });

    try {
      await checkAllMonthsActivity(address, chainSlug, (month, hasActivity) => {
        setResults((prev) => ({
          ...prev,
          [month]: { ...prev[month], hasActivity, isLoading: false, isChecked: true },
        }));
      });
    } catch (error) {
      // Set error for all months that are still loading
      setResults((prev) => {
        const updated = { ...prev };
        monthConfigs.forEach((config) => {
          if (updated[config.name].isLoading) {
            updated[config.name] = {
              ...updated[config.name],
              isLoading: false,
              isChecked: true,
              error: error instanceof Error ? error.message : 'Failed to check activity',
            };
          }
        });
        return updated;
      });
    } finally {
      setIsCheckingAll(false);
      checkingRef.current = false;
    }
  }, [address, chainSlug, monthConfigs]);

  const refreshActivity = useCallback(() => {
    if (address) {
      clearActivityCache(address, chainSlug);
      checkAllMonths();
    }
  }, [address, chainSlug, checkAllMonths]);

  // Auto-check only the current month when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      const currentMonth = getCurrentMonth();
      // Find the matching config for the current month
      const hasCurrentMonth = currentMonth && monthConfigs.some((c) => c.name === currentMonth);
      if (hasCurrentMonth) {
        checkMonth(currentMonth);
      }
    } else {
      // Reset results when disconnected
      setResults((prev) => {
        const reset = { ...prev };
        monthConfigs.forEach((config) => {
          reset[config.name] = {
            month: config.name,
            chainSlug,
            hasActivity: false,
            isLoading: false,
            isChecked: false,
            error: null,
          };
        });
        return reset;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, chainSlug]);

  return {
    results,
    isCheckingAll,
    checkMonth,
    checkAllMonths,
    refreshActivity,
  };
}
