// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IChronoContract.sol";

/**
 * @title ChronoContract
 * @dev Implementation of a time-bound onchain agreement contract
 * Used to create actionable, stateful commitments between two parties
 */
contract ChronoContract is IChronoContract {
    address public creator;
    address public counterparty;
    string public description;
    uint256 public deadline;
    uint256 public value;
    State public state;
    
    /**
     * @dev Modifier that restricts function access to the creator
     */
    modifier onlyCreator() {
        require(msg.sender == creator, "Only the creator can call this function");
        _;
    }
    
    /**
     * @dev Modifier that restricts function access to the counterparty
     */
    modifier onlyCounterparty() {
        require(msg.sender == counterparty, "Only the counterparty can call this function");
        _;
    }
    
    /**
     * @dev Constructor creates a new agreement
     * @param _creator Address of the agreement creator
     * @param _counterparty Address of the agreement counterparty
     * @param _description Description of the task
     * @param _deadline Timestamp by which the task must be completed
     * @param _value Value in ETH to be held in escrow
     */
    constructor(
        address _creator,
        address _counterparty,
        string memory _description,
        uint256 _deadline,
        uint256 _value
    ) {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_creator != _counterparty, "Creator and counterparty cannot be the same");
        
        creator = _creator;
        counterparty = _counterparty;
        description = _description;
        deadline = _deadline;
        value = _value;
        state = State.PROPOSED;
        
        emit StateChanged(state);
    }
    
    /**
     * @inheritdoc IChronoContract
     */
    function getState() external view override returns (State) {
        return state;
    }
    
    /**
     * @inheritdoc IChronoContract
     */
    function getAgreementDetails() external view override returns (
        address,
        address,
        string memory,
        uint256,
        uint256
    ) {
        return (
            creator,
            counterparty,
            description,
            deadline,
            value
        );
    }
    
    /**
     * @inheritdoc IChronoContract
     */
    function accept() external payable override onlyCounterparty {
        require(state == State.PROPOSED, "Agreement must be in PROPOSED state");
        require(msg.value == value, "Must send exact value for escrow");
        
        state = State.ACTIVE;
        emit StateChanged(state);
    }
    
    /**
     * @inheritdoc IChronoContract
     */
    function reject() external override onlyCounterparty {
        require(state == State.PROPOSED, "Agreement must be in PROPOSED state");
        
        state = State.VOIDED;
        emit StateChanged(state);
    }
    
    /**
     * @inheritdoc IChronoContract
     */
    function markAsDone() external override onlyCounterparty {
        require(state == State.ACTIVE, "Agreement must be in ACTIVE state");
        require(block.timestamp <= deadline, "Deadline has passed");
        
        // We don't change the state here, just emit an event that can be tracked off-chain
        // The creator will need to confirm to change the state
        emit StateChanged(state);
    }
    
    /**
     * @inheritdoc IChronoContract
     */
    function confirmCompletion() external override onlyCreator {
        require(state == State.ACTIVE, "Agreement must be in ACTIVE state");
        
        state = State.COMPLETED;
        
        // Transfer the escrowed ETH to the counterparty
        (bool sent, ) = counterparty.call{value: value}("");
        require(sent, "Failed to send Ether");
        
        emit StateChanged(state);
    }
    
    /**
     * @inheritdoc IChronoContract
     */
    function reclaimOnExpiry() external override onlyCreator {
        require(state == State.ACTIVE, "Agreement must be in ACTIVE state");
        require(block.timestamp > deadline, "Deadline has not passed yet");
        
        state = State.EXPIRED;
        
        // Return the escrowed ETH to the creator
        (bool sent, ) = creator.call{value: value}("");
        require(sent, "Failed to send Ether");
        
        emit StateChanged(state);
    }
    
    /**
     * @dev Fallback function to reject direct ETH transfers
     */
    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }
}
