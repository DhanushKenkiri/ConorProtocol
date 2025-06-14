// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IChronoContract
 * @dev Interface for ChronoContract, a time-bound onchain agreement
 */
interface IChronoContract {
    // State machine for the agreement
    enum State {
        PROPOSED,
        ACTIVE,
        COMPLETED,
        EXPIRED,
        VOIDED
    }
    
    /**
     * @dev Emitted when the state of the contract changes
     * @param newState The new state of the contract
     */
    event StateChanged(State newState);
    
    /**
     * @dev Get the current state of the contract
     * @return The current state
     */
    function getState() external view returns (State);
    
    /**
     * @dev Get details about the agreement
     * @return creator The address that created the agreement
     * @return counterparty The address that needs to complete the task
     * @return description Description of the task
     * @return deadline Timestamp by which the task must be completed
     * @return value Amount of ETH in escrow
     */
    function getAgreementDetails() external view returns (
        address creator,
        address counterparty,
        string memory description,
        uint256 deadline,
        uint256 value
    );
    
    /**
     * @dev Accept the agreement and fund the escrow
     * Must be called by the counterparty
     */
    function accept() external payable;
    
    /**
     * @dev Reject the agreement
     * Must be called by the counterparty
     */
    function reject() external;
    
    /**
     * @dev Mark the task as done
     * Must be called by the counterparty
     */
    function markAsDone() external;
    
    /**
     * @dev Confirm completion of the task and release funds
     * Must be called by the creator
     */
    function confirmCompletion() external;
    
    /**
     * @dev Reclaim funds after expiry
     * Must be called by the creator and only if deadline has passed
     */
    function reclaimOnExpiry() external;
}
