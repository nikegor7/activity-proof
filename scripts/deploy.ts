import hre from "hardhat";

const { ethers } = hre;

/**
 * Deploy ActivityNFT contract
 * One contract per month: October, November, December
 */
async function main() {
  // Configuration - update these for each monthly deployment
  const MONTH = process.env.DEPLOY_MONTH || "October";
  const config = getMonthConfig(MONTH);

  console.log(`Deploying ActivityNFT for ${MONTH}...`);
  console.log(`  Name: ${config.name}`);
  console.log(`  Symbol: ${config.symbol}`);
  console.log(`  Max Supply: ${config.maxSupply}`);
  console.log(`  Default URI: ${config.defaultTokenURI}`);

  const ActivityNFT = await ethers.getContractFactory("ActivityNFT");
  const activityNFT = await ActivityNFT.deploy(
    config.name,
    config.symbol,
    config.maxSupply,
    config.defaultTokenURI
  );

  await activityNFT.waitForDeployment();
  const address = await activityNFT.getAddress();

  console.log(`\nActivityNFT (${MONTH}) deployed to: ${address}`);
  console.log(`\nUpdate your .env.local with:`);
  console.log(`NEXT_PUBLIC_ACTIVITY_NFT_${MONTH.toUpperCase()}_ADDRESS=${address}`);

  return address;
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
    October: "ipfs://bafkreibf33bsbdof7cpnusn25r7qdgpouky6u4jvyb574reqj7yvh7e6ji",
    November: "ipfs://bafkreicgisxbt2airnuc6ail4zh3bjh4mtj2goeqfwsmbiqpvau2ke53mi",
    December: "ipfs://bafkreibfpm6eihhsb6unjwxgdajpvjajiuwdr2qszb3hddon4vw46gaazy",
    January: "ipfs://bafkreif5ccgpnjsp3hfeympzlapndiv6w57jl22yn4gj4rffjfkodkdzyq",
    February: "ipfs://bafkreienlopqfgcqboytlkmppvgwaz5dd4mhtw2jioakhcixffszjkqnkm",
  };

  const configs: Record<string, MonthConfig> = {
    October: {
      name: "Pharos Atlantic October 2025",
      symbol: "PAOCT",
      maxSupply,
      defaultTokenURI: METADATA_URIS.October,
    },
    November: {
      name: "Pharos Atlantic November 2025",
      symbol: "PANOV",
      maxSupply,
      defaultTokenURI: METADATA_URIS.November,
    },
    December: {
      name: "Pharos Atlantic December 2025",
      symbol: "PADEC",
      maxSupply,
      defaultTokenURI: METADATA_URIS.December,
    },
    January: {
      name: "Pharos Atlantic January 2026",
      symbol: "PAJAN",
      maxSupply,
      defaultTokenURI: METADATA_URIS.January,
    },
    February: {
      name: "Pharos Atlantic February 2026",
      symbol: "PAFEB",
      maxSupply,
      defaultTokenURI: METADATA_URIS.February,
    },
  };

  const config = configs[month];
  if (!config) {
    throw new Error(`Invalid month: ${month}. Must be October, November, December, January, or February`);
  }

  return config;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
