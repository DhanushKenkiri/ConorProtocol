// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ChronoContract.sol";

/**
 * @title ChronosFactory
 * @dev Factory contract for creating new ChronoContract instances
 * Maintains a registry of all agreements created through it
 */
contract ChronosFactory {
    // Array to store all deployed agreement addresses
    address[] public deployedAgreements;
    
    // Mapping from user address to their agreements (both as creator and counterparty)
    mapping(address => address[]) public userAgreements;
    
    /**
     * @dev Emitted when a new agreement is created
     * @param creator Address of the agreement creator
     * @param counterparty Address of the agreement counterparty
     * @param agreementAddress Address of the newly created ChronoContract
     * @param description Description of the task
     * @param deadline Timestamp by which the task must be completed
     * @param value Value in ETH to be held in escrow
     */
    event AgreementCreated(
        address indexed creator,
        address indexed counterparty,
        address agreementAddress,
        string description,
        uint256 deadline,
        uint256 value
    );
    
    /**
     * @dev Create a new ChronoContract agreement
     * @param counterparty Address of the agreement counterparty
     * @param description Description of the task
     * @param deadline Timestamp by which the task must be completed
     * @param value Value in ETH to be held in escrow
     * @return The address of the newly created ChronoContract
     */
    function createAgreement(
        address counterparty,
        string memory description,
        uint256 deadline,
        uint256 value
    ) external returns (address) {
        // Create a new ChronoContract
        ChronoContract newAgreement = new ChronoContract(
            msg.sender,
            counterparty,
            description,
            deadline,
            value
        );
        
        address agreementAddress = address(newAgreement);
        
        // Store the agreement address
        deployedAgreements.push(agreementAddress);
        
        // Store in user mappings
        userAgreements[msg.sender].push(agreementAddress);
        userAgreements[counterparty].push(agreementAddress);
        
        // Emit event
        emit AgreementCreated(
            msg.sender,
            counterparty,
            agreementAddress,
            description,
            deadline,
            value
        );
        
        return agreementAddress;
    }
    
    /**
     * @dev Get all deployed agreements
     * @return An array of all deployed ChronoContract addresses
     */
    function getDeployedAgreements() external view returns (address[] memory) {
        return deployedAgreements;
    }
    
    /**
     * @dev Get all agreements for a specific user
     * @param user Address of the user to query
     * @return An array of ChronoContract addresses associated with the user
     */
    function getUserAgreements(address user) external view returns (address[] memory) {
        return userAgreements[user];
    }
}
