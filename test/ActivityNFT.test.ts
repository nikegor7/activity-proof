import { expect } from "chai";
import hre from "hardhat";
import { ActivityNFT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const { ethers } = hre;

describe("ActivityNFT", function () {
  let activityNFT: ActivityNFT;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const NAME = "Pharos Atlantic October";
  const SYMBOL = "PAOCT";
  const MAX_SUPPLY = 1000;
  const DEFAULT_URI = "ipfs://QmDefaultTokenURI";

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ActivityNFTFactory = await ethers.getContractFactory("ActivityNFT");
    activityNFT = await ActivityNFTFactory.deploy(NAME, SYMBOL, MAX_SUPPLY, DEFAULT_URI);
    await activityNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set correct name and symbol", async function () {
      expect(await activityNFT.name()).to.equal(NAME);
      expect(await activityNFT.symbol()).to.equal(SYMBOL);
    });

    it("should set correct max supply", async function () {
      expect(await activityNFT.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("should set correct default token URI", async function () {
      expect(await activityNFT.defaultTokenURI()).to.equal(DEFAULT_URI);
    });

    it("should set correct owner", async function () {
      expect(await activityNFT.owner()).to.equal(owner.address);
    });

    it("should start with zero total supply", async function () {
      expect(await activityNFT.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("should allow free mint", async function () {
      await expect(activityNFT.connect(user1).mint())
        .to.emit(activityNFT, "NFTMinted")
        .withArgs(user1.address, 0, DEFAULT_URI);

      expect(await activityNFT.ownerOf(0)).to.equal(user1.address);
      expect(await activityNFT.tokenURI(0)).to.equal(DEFAULT_URI);
      expect(await activityNFT.totalSupply()).to.equal(1);
    });

    it("should set hasMinted to true after minting", async function () {
      expect(await activityNFT.hasMinted(user1.address)).to.be.false;
      await activityNFT.connect(user1).mint();
      expect(await activityNFT.hasMinted(user1.address)).to.be.true;
    });

    it("should prevent double minting from same wallet", async function () {
      await activityNFT.connect(user1).mint();
      await expect(activityNFT.connect(user1).mint()).to.be.revertedWith("Already minted");
    });

    it("should allow different wallets to mint", async function () {
      await activityNFT.connect(user1).mint();
      await activityNFT.connect(user2).mint();

      expect(await activityNFT.ownerOf(0)).to.equal(user1.address);
      expect(await activityNFT.ownerOf(1)).to.equal(user2.address);
      expect(await activityNFT.totalSupply()).to.equal(2);
    });

    it("should revert when max supply reached", async function () {
      // Deploy with max supply of 2
      const ActivityNFTFactory = await ethers.getContractFactory("ActivityNFT");
      const limitedNFT = await ActivityNFTFactory.deploy(NAME, SYMBOL, 2, DEFAULT_URI);

      await limitedNFT.connect(user1).mint();
      await limitedNFT.connect(user2).mint();

      const [, , , user3] = await ethers.getSigners();
      await expect(limitedNFT.connect(user3).mint()).to.be.revertedWith("Max supply reached");
    });

    it("should revert when paused", async function () {
      await activityNFT.pause();
      await expect(activityNFT.connect(user1).mint()).to.be.reverted;
    });

    it("should allow minting after unpause", async function () {
      await activityNFT.pause();
      await activityNFT.unpause();
      await expect(activityNFT.connect(user1).mint()).to.not.be.reverted;
    });
  });

  describe("Owner Functions", function () {
    describe("setMaxSupply", function () {
      it("should allow owner to increase max supply", async function () {
        await expect(activityNFT.setMaxSupply(2000))
          .to.emit(activityNFT, "MaxSupplyUpdated")
          .withArgs(2000);
        expect(await activityNFT.maxSupply()).to.equal(2000);
      });

      it("should allow owner to decrease max supply above minted", async function () {
        await activityNFT.connect(user1).mint();
        await activityNFT.setMaxSupply(500);
        expect(await activityNFT.maxSupply()).to.equal(500);
      });

      it("should revert when setting below minted amount", async function () {
        await activityNFT.connect(user1).mint();
        await activityNFT.connect(user2).mint();
        await expect(activityNFT.setMaxSupply(1)).to.be.revertedWith("Cannot set below minted amount");
      });

      it("should revert when non-owner calls", async function () {
        await expect(activityNFT.connect(user1).setMaxSupply(2000)).to.be.reverted;
      });
    });

    describe("setDefaultTokenURI", function () {
      const NEW_URI = "ipfs://QmNewDefaultURI";

      it("should allow owner to update default URI", async function () {
        await expect(activityNFT.setDefaultTokenURI(NEW_URI))
          .to.emit(activityNFT, "DefaultTokenURIUpdated")
          .withArgs(NEW_URI);
        expect(await activityNFT.defaultTokenURI()).to.equal(NEW_URI);
      });

      it("should apply new default URI to future mints only", async function () {
        await activityNFT.connect(user1).mint();
        await activityNFT.setDefaultTokenURI(NEW_URI);
        await activityNFT.connect(user2).mint();

        expect(await activityNFT.tokenURI(0)).to.equal(DEFAULT_URI);
        expect(await activityNFT.tokenURI(1)).to.equal(NEW_URI);
      });

      it("should revert when non-owner calls", async function () {
        await expect(activityNFT.connect(user1).setDefaultTokenURI(NEW_URI)).to.be.reverted;
      });
    });

    describe("updateTokenURI", function () {
      const UPDATED_URI = "ipfs://QmUpdatedTokenURI";

      it("should allow owner to update specific token URI", async function () {
        await activityNFT.connect(user1).mint();
        await expect(activityNFT.updateTokenURI(0, UPDATED_URI))
          .to.emit(activityNFT, "TokenURIUpdated")
          .withArgs(0, UPDATED_URI);
        expect(await activityNFT.tokenURI(0)).to.equal(UPDATED_URI);
      });

      it("should revert for non-existent token", async function () {
        await expect(activityNFT.updateTokenURI(999, UPDATED_URI)).to.be.revertedWith("Token does not exist");
      });

      it("should revert when non-owner calls", async function () {
        await activityNFT.connect(user1).mint();
        await expect(activityNFT.connect(user1).updateTokenURI(0, UPDATED_URI)).to.be.reverted;
      });
    });

    describe("pause/unpause", function () {
      it("should allow owner to pause", async function () {
        await activityNFT.pause();
        expect(await activityNFT.paused()).to.be.true;
      });

      it("should allow owner to unpause", async function () {
        await activityNFT.pause();
        await activityNFT.unpause();
        expect(await activityNFT.paused()).to.be.false;
      });

      it("should revert when non-owner calls pause", async function () {
        await expect(activityNFT.connect(user1).pause()).to.be.reverted;
      });

      it("should revert when non-owner calls unpause", async function () {
        await activityNFT.pause();
        await expect(activityNFT.connect(user1).unpause()).to.be.reverted;
      });
    });
  });

  describe("View Functions", function () {
    it("should return correct total supply", async function () {
      expect(await activityNFT.totalSupply()).to.equal(0);
      await activityNFT.connect(user1).mint();
      expect(await activityNFT.totalSupply()).to.equal(1);
      await activityNFT.connect(user2).mint();
      expect(await activityNFT.totalSupply()).to.equal(2);
    });

    it("should support ERC721 interface", async function () {
      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await activityNFT.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
    });
  });
});
