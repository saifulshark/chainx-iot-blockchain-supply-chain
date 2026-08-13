// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProductHash
 * @dev A simple contract for storing a SHA256 hash of product data keyed by
 * product ID. The hash can be retrieved later to verify the integrity
 * of offline data. Only the most recent hash per product ID is stored.
 */
contract ProductHash {
    // Mapping of product ID to its data hash
    mapping(uint256 => string) private productHashes;

    // Event emitted when a new hash is stored
    event HashStored(uint256 indexed productId, string hash);

    /**
     * @notice Store a hash for a given product ID
     * @param productId The unique identifier of the product
     * @param hash The SHA256 hash string representing the product's data
     */
    function storeHash(uint256 productId, string calldata hash) external {
        productHashes[productId] = hash;
        emit HashStored(productId, hash);
    }

    /**
     * @notice Retrieve the stored hash for a product ID
     * @param productId The product identifier to query
     * @return The stored SHA256 hash string
     */
    function getHash(uint256 productId) external view returns (string memory) {
        return productHashes[productId];
    }
}