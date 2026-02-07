const CHUNK_SIZE = 500000;
const MAX_CONCURRENT = 2;

let cachedLatestBlock: { block: number; timestamp: number } | null = null;

async function getLatestBlock(): Promise<number | null> {
  // Cache for 5 minutes
  if (cachedLatestBlock && Date.now() - cachedLatestBlock.timestamp < 300000) {
    return cachedLatestBlock.block;
  }

  const url = `/api/explorer?chain=iopn-testnet&module=block&action=getblocknobytime&timestamp=9999999999&closest=before`;

  try {
    const response = await fetch(url);
    const data: { status: string; result: { blockNumber: string } } = await response.json();
    if (data.status === '1' && data.result?.blockNumber) {
      const block = parseInt(data.result.blockNumber, 10);
      cachedLatestBlock = { block, timestamp: Date.now() };
      return block;
    }
  } catch {
    // Fall back to configured endBlock
  }
  return null;
}

interface TxListResponse {
  status: string;
  message: string;
  result: Array<{
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
  }>;
}

async function fetchChunk(
  address: string,
  startBlock: number,
  endBlock: number
): Promise<boolean> {
  // Use server-side proxy to avoid CORS issues
  const url = `/api/explorer?chain=iopn-testnet&address=${address}&startblock=${startBlock}&endblock=${endBlock}&page=1&offset=1&sort=asc`;

  try {
    const response = await fetch(url);
    const data: TxListResponse = await response.json();
    return data.status === '1' && data.result && data.result.length > 0;
  } catch {
    return false;
  }
}

async function checkBatch(
  address: string,
  chunks: Array<{ start: number; end: number }>
): Promise<boolean> {
  const results = await Promise.all(
    chunks.map((chunk) => fetchChunk(address, chunk.start, chunk.end))
  );
  return results.some((hit) => hit);
}

export async function checkActivity(
  address: string,
  startBlock: number,
  endBlock: number,
  onProgress?: (checked: number, total: number) => void
): Promise<boolean> {
  // Cap endBlock at the actual latest block to avoid checking future blocks
  const latestBlock = await getLatestBlock();
  if (latestBlock) {
    endBlock = Math.min(endBlock, latestBlock);
  }

  // Month hasn't started yet
  if (startBlock > endBlock) {
    return false;
  }

  const totalChunks = Math.ceil((endBlock - startBlock) / CHUNK_SIZE);

  const chunks: Array<{ start: number; end: number }> = [];
  for (let i = 0; i < totalChunks; i++) {
    const chunkStart = startBlock + i * CHUNK_SIZE;
    const chunkEnd = Math.min(chunkStart + CHUNK_SIZE - 1, endBlock);
    chunks.push({ start: chunkStart, end: chunkEnd });
  }

  let checked = 0;
  for (let i = 0; i < chunks.length; i += MAX_CONCURRENT) {
    const batch = chunks.slice(i, i + MAX_CONCURRENT);
    const hasActivity = await checkBatch(address, batch);

    checked += batch.length;
    onProgress?.(checked, totalChunks);

    if (hasActivity) {
      return true;
    }
  }

  return false;
}
