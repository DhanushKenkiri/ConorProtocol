const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChronoContract", function () {
  let ChronoContract;
  let contract;
  let creator;
  let counterparty;
  let addr3;
  
  // Constants for the contract
  const DESCRIPTION = "Complete the documentation";
  const VALUE = ethers.utils.parseEther("1.0");
  let DEADLINE;
  
  // State enum mapping
  const State = {
    PROPOSED: 0,
    ACTIVE: 1,
    COMPLETED: 2,
    EXPIRED: 3,
    VOIDED: 4
  };
  
  beforeEach(async function () {
    // Get signers
    [creator, counterparty, addr3] = await ethers.getSigners();
    
    // Set deadline to 1 day in the future
    const now = Math.floor(Date.now() / 1000);
    DEADLINE = now + 86400; // 1 day later
    
    // Deploy contract
    ChronoContract = await ethers.getContractFactory("ChronoContract");
    contract = await ChronoContract.deploy(
      creator.address,
      counterparty.address,
      DESCRIPTION,
      DEADLINE,
      VALUE
    );
    await contract.deployed();
  });
  
  describe("Deployment", function () {
    it("Should set the correct initial state", async function () {
      expect(await contract.creator()).to.equal(creator.address);
      expect(await contract.counterparty()).to.equal(counterparty.address);
      expect(await contract.description()).to.equal(DESCRIPTION);
      expect(await contract.deadline()).to.equal(DEADLINE);
      expect(await contract.value()).to.equal(VALUE);
      expect(await contract.state()).to.equal(State.PROPOSED);
    });
  });
  
  describe("Agreement Lifecycle", function () {
    it("Should allow counterparty to accept the agreement", async function () {
      await expect(contract.connect(counterparty).accept({ value: VALUE }))
        .to.emit(contract, "StateChanged")
        .withArgs(State.ACTIVE);
      
      expect(await contract.state()).to.equal(State.ACTIVE);
      expect(await ethers.provider.getBalance(contract.address)).to.equal(VALUE);
    });
    
    it("Should not allow accepting with incorrect value", async function () {
      const wrongValue = ethers.utils.parseEther("0.5"); // Half the required value
      await expect(
        contract.connect(counterparty).accept({ value: wrongValue })
      ).to.be.revertedWith("Must send exact value for escrow");
    });
    
    it("Should not allow non-counterparty to accept", async function () {
      await expect(
        contract.connect(addr3).accept({ value: VALUE })
      ).to.be.revertedWith("Only the counterparty can call this function");
    });
    
    it("Should allow counterparty to reject", async function () {
      await expect(contract.connect(counterparty).reject())
        .to.emit(contract, "StateChanged")
        .withArgs(State.VOIDED);
      
      expect(await contract.state()).to.equal(State.VOIDED);
    });
    
    it("Should allow task completion flow", async function () {
      // Counterparty accepts
      await contract.connect(counterparty).accept({ value: VALUE });
      expect(await contract.state()).to.equal(State.ACTIVE);
      
      // Counterparty marks as done
      await contract.connect(counterparty).markAsDone();
      // State should still be ACTIVE (only emits event)
      expect(await contract.state()).to.equal(State.ACTIVE);
      
      // Creator confirms completion
      const counterpartyBalanceBefore = await counterparty.getBalance();
      await contract.connect(creator).confirmCompletion();
      const counterpartyBalanceAfter = await counterparty.getBalance();
      
      expect(await contract.state()).to.equal(State.COMPLETED);
      // Check that counterparty got the escrowed funds (approximately)
      expect(counterpartyBalanceAfter.sub(counterpartyBalanceBefore))
        .to.be.closeTo(VALUE, ethers.utils.parseEther("0.01")); // Allow for gas costs
    });
    
    it("Should allow expiry flow", async function () {
      // Counterparty accepts
      await contract.connect(counterparty).accept({ value: VALUE });
      
      // Simulate time passing beyond deadline
      await ethers.provider.send("evm_increaseTime", [86401]); // 1 day + 1 second
      await ethers.provider.send("evm_mine");
      
      // Creator reclaims funds
      const creatorBalanceBefore = await creator.getBalance();
      await contract.connect(creator).reclaimOnExpiry();
      const creatorBalanceAfter = await creator.getBalance();
      
      expect(await contract.state()).to.equal(State.EXPIRED);
      // Check that creator got the escrowed funds back (approximately)
      expect(creatorBalanceAfter.sub(creatorBalanceBefore))
        .to.be.closeTo(VALUE, ethers.utils.parseEther("0.01")); // Allow for gas costs
    });
  });
});
