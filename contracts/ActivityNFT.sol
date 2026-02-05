// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title ActivityNFT
 * @notice Free mint NFT contract for multi-chain monthly activity rewards
 * @dev Deploy one contract per month (October, November, December)
 *      Activity verification happens off-chain in the frontend
 */
contract ActivityNFT is ERC721, ERC721URIStorage, Ownable, Pausable {
    uint256 private _nextTokenId;
    uint256 public maxSupply;
    string public defaultTokenURI;

    /// @notice Tracks whether an address has already minted
    mapping(address => bool) public hasMinted;

    event NFTMinted(address indexed minter, uint256 indexed tokenId, string tokenURI);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    event DefaultTokenURIUpdated(string newDefaultURI);
    event TokenURIUpdated(uint256 indexed tokenId, string newTokenURI);

    /**
     * @param _name Token name (e.g., "Pharos Atlantic October")
     * @param _symbol Token symbol (e.g., "PAOCT")
     * @param _maxSupply Maximum number of NFTs that can be minted
     * @param _defaultTokenURI Default metadata URI for minted tokens
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _maxSupply,
        string memory _defaultTokenURI
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        maxSupply = _maxSupply;
        defaultTokenURI = _defaultTokenURI;
    }

    /**
     * @notice Mint a free NFT (one per wallet)
     * @dev Activity check is performed off-chain before calling this function
     * @return tokenId The ID of the newly minted token
     */
    function mint() external whenNotPaused returns (uint256) {
        require(!hasMinted[msg.sender], "Already minted");
        require(_nextTokenId < maxSupply, "Max supply reached");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        hasMinted[msg.sender] = true;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, defaultTokenURI);

        emit NFTMinted(msg.sender, tokenId, defaultTokenURI);
        return tokenId;
    }

    // ============ Owner Functions ============

    /**
     * @notice Update the maximum supply
     * @param _maxSupply New maximum supply (cannot be below already minted amount)
     */
    function setMaxSupply(uint256 _maxSupply) external onlyOwner {
        require(_maxSupply >= _nextTokenId, "Cannot set below minted amount");
        maxSupply = _maxSupply;
        emit MaxSupplyUpdated(_maxSupply);
    }

    /**
     * @notice Update the default token URI for future mints
     * @dev Does not affect already minted tokens
     * @param _defaultTokenURI New default metadata URI
     */
    function setDefaultTokenURI(string calldata _defaultTokenURI) external onlyOwner {
        defaultTokenURI = _defaultTokenURI;
        emit DefaultTokenURIUpdated(_defaultTokenURI);
    }

    /**
     * @notice Update the token URI for a specific already-minted token
     * @param tokenId The token ID to update
     * @param _tokenURI New metadata URI for the token
     */
    function updateTokenURI(uint256 tokenId, string calldata _tokenURI) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _setTokenURI(tokenId, _tokenURI);
        emit TokenURIUpdated(tokenId, _tokenURI);
    }

    /**
     * @notice Pause minting
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause minting
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ View Functions ============

    /**
     * @notice Get the total number of minted tokens
     * @return The current supply
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId;
    }

    // ============ Required Overrides ============

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
