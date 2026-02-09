import { NextRequest, NextResponse } from 'next/server';
import { CHAINS } from '@/lib/chains';
import { type ChainId } from '@/types';

// Simple in-memory rate limiter: max 30 requests per minute per IP
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { status: '0', message: 'Rate limit exceeded, try again later', result: [] },
      { status: 429 }
    );
  }
  const searchParams = request.nextUrl.searchParams;
  const chainSlug = searchParams.get('chain') as ChainId;
  const apiModule = searchParams.get('module') || 'account';
  const action = searchParams.get('action') || 'txlist';

  const chain = CHAINS[chainSlug];
  if (!chainSlug || !chain) {
    return NextResponse.json({ status: '0', message: 'Invalid chain', result: [] });
  }

  const apiKey = getApiKey(chainSlug);

  // Build URL based on the module/action
  let url: string;
  if (apiModule === 'block' && action === 'getblocknobytime') {
    const timestamp = searchParams.get('timestamp') || '9999999999';
    const closest = searchParams.get('closest') || 'before';
    url = `${chain.explorerApiUrl}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=${closest}&apikey=${apiKey}`;
  } else {
    const address = searchParams.get('address');
    const startblock = searchParams.get('startblock');
    const endblock = searchParams.get('endblock');
    const page = searchParams.get('page') || '1';
    const offset = searchParams.get('offset') || '1';
    const sort = searchParams.get('sort') || 'asc';

    if (!address || !startblock || !endblock) {
      return NextResponse.json({ status: '0', message: 'Missing parameters', result: [] });
    }

    url = `${chain.explorerApiUrl}?module=account&action=txlist&address=${address}&startblock=${startblock}&endblock=${endblock}&page=${page}&offset=${offset}&sort=${sort}&apikey=${apiKey}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: '0', message: 'Fetch error', result: [] });
  }
}

function getApiKey(chainSlug: ChainId): string {
  switch (chainSlug) {
    case 'pharos-atlantic':
      return process.env.NEXT_PUBLIC_SOCIALSCAN_API_KEY || '';
    case 'ethereum-sepolia':
      return process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';
    case 'base-sepolia':
      return process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '';
    case 'arbitrum-sepolia':
      return process.env.NEXT_PUBLIC_ARBISCAN_API_KEY || '';
    case 'iopn-testnet':
      return process.env.NEXT_PUBLIC_IOPN_API_KEY || '';
    default:
      return '';
  }
}
