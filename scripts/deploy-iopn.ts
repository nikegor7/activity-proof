import hre from "hardhat";

const { ethers } = hre;

/**
 * Deploy ActivityNFT contract to IOPN Testnet
 * One contract per month: September, October, November, December, January, February
 *
 * Usage:
 *   DEPLOY_MONTH=September npx hardhat run scripts/deploy-iopn.ts --network iopn_testnet
 *   DEPLOY_MONTH=October npx hardhat run scripts/deploy-iopn.ts --network iopn_testnet
 *   etc.
 *
 * Or deploy all months at once:
 *   DEPLOY_ALL=true npx hardhat run scripts/deploy-iopn.ts --network iopn_testnet
 */
async function main() {
  // Accept month from command line args: npx hardhat run script.ts --network iopn_testnet October
  const args = process.argv.slice(2);
  const monthArg = args.find(arg => !arg.startsWith("--") && !arg.includes("network"));

  const deployAll = process.env.DEPLOY_ALL === "true";

  if (deployAll) {
    console.log("Deploying all IOPN ActivityNFT contracts...\n");
    const months = ["September", "October", "November", "December", "January", "February"];
    const addresses: Record<string, string> = {};

    for (const month of months) {
      const address = await deployMonth(month);
      addresses[month] = address;
      console.log("---\n");
    }

    console.log("\n=== DEPLOYMENT SUMMARY ===\n");
    console.log("Add these to your .env.local:\n");
    for (const [month, address] of Object.entries(addresses)) {
      console.log(`NEXT_PUBLIC_IOPN_${month.toUpperCase()}_ADDRESS=${address}`);
    }
  } else {
    const month = monthArg || process.env.DEPLOY_MONTH || "February";
    await deployMonth(month);
  }
}

async function deployMonth(month: string): Promise<string> {
  const config = getMonthConfig(month);
  const maxRetries = 20;
  const retryDelay = 10000; // 10 seconds between retries

  console.log(`Deploying ActivityNFT for IOPN ${month}...`);
  console.log(`  Name: ${config.name}`);
  console.log(`  Symbol: ${config.symbol}`);
  console.log(`  Max Supply: ${config.maxSupply}`);
  console.log(`  Default URI: ${config.defaultTokenURI || "(not set)"}`);

  const ActivityNFT = await ethers.getContractFactory("ActivityNFT");
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const onChainNonce = await ethers.provider.getTransactionCount(signerAddress, "latest");
      const nonce = process.env.FORCE_NONCE ? parseInt(process.env.FORCE_NONCE) : onChainNonce;
      console.log(`  Using nonce: ${nonce} (on-chain: ${onChainNonce})`);
      const activityNFT = await ActivityNFT.deploy(
        config.name,
        config.symbol,
        config.maxSupply,
        config.defaultTokenURI,
        {
          gasPrice: ethers.parseUnits("7", "gwei"),
          gasLimit: 3000000,
          nonce,
        }
      );

      await activityNFT.waitForDeployment();
      const address = await activityNFT.getAddress();

      console.log(`\nActivityNFT (IOPN ${month}) deployed to: ${address}`);
      console.log(`\nUpdate your .env.local with:`);
      console.log(`NEXT_PUBLIC_IOPN_${month.toUpperCase()}_ADDRESS=${address}`);

      return address;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const isRetryable = msg.includes("mempool") || msg.includes("nonce");
      if (isRetryable && attempt < maxRetries) {
        console.log(`  Attempt ${attempt}/${maxRetries} failed (${msg.slice(0, 60)}). Retrying in ${retryDelay / 1000}s...`);
        await new Promise((r) => setTimeout(r, retryDelay));
      } else {
        throw error;
      }
    }
  }

  throw new Error(`Failed to deploy after ${maxRetries} attempts`);
}

interface MonthConfig {
  name: string;
  symbol: string;
  maxSupply: number;
  defaultTokenURI: string;
}

function getMonthConfig(month: string): MonthConfig {
  const maxSupply = parseInt(process.env.MAX_SUPPLY || "100000");

  // IPFS URIs for each month's NFT metadata JSON
  const METADATA_URIS: Record<string, string> = {
    September: "ipfs://bafkreif3qwdgs6lxbngmdxp3ozym47avduc5ni2m4jioaa4lmuiqnlobu4",
    October: "ipfs://bafkreie2xkt2rqikimqomwo4uaxznj4e7vqurvydyubgtrqrhf5xes2pmm",
    November: "ipfs://bafkreihzhiw5g3l3wlvqgd3pn2w53kguj6khcxe4ohylngapfa2v5ndmcy",
    December: "ipfs://bafkreih4mnsw256mpls56lgb53fotuci7y2zttehypcyrmwoq4ph234lxe",
    January: "ipfs://bafkreih3lis743od4n6q2pu6nw3lincmwi7u64k4hdoedytl3go5lsekze",
    February: "ipfs://bafkreig62kkt2cteibt4lmxil6roa63odj5wmtdhgp6mwn2l44xpig7cyq",
  };

  const configs: Record<string, MonthConfig> = {
    September: {
      name: "IOPN September 2025 Activity",
      symbol: "IOPNSEP",
      maxSupply,
      defaultTokenURI: METADATA_URIS.September,
    },
    October: {
      name: "IOPN October 2025 Activity",
      symbol: "IOPNOCT",
      maxSupply,
      defaultTokenURI: METADATA_URIS.October,
    },
    November: {
      name: "IOPN November 2025 Activity",
      symbol: "IOPNNOV",
      maxSupply,
      defaultTokenURI: METADATA_URIS.November,
    },
    December: {
      name: "IOPN December 2025 Activity",
      symbol: "IOPNDEC",
      maxSupply,
      defaultTokenURI: METADATA_URIS.December,
    },
    January: {
      name: "IOPN January 2026 Activity",
      symbol: "IOPNJAN",
      maxSupply,
      defaultTokenURI: METADATA_URIS.January,
    },
    February: {
      name: "IOPN February 2026 Activity",
      symbol: "IOPNFEB",
      maxSupply,
      defaultTokenURI: METADATA_URIS.February,
    },
  };

  const config = configs[month];
  if (!config) {
    throw new Error(
      `Invalid month: ${month}. Must be September, October, November, December, January, or February`
    );
  }

  return config;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
