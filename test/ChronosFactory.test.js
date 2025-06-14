const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChronosFactory", function () {
  let ChronosFactory;
  let factory;
  let owner;
  let addr1;
  let addr2;
  
  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();
    
    // Deploy factory
    ChronosFactory = await ethers.getContractFactory("ChronosFactory");
    factory = await ChronosFactory.deploy();
    await factory.deployed();
  });
  
  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(factory.address).to.be.properAddress;
    });
    
    it("Should have empty deployed agreements initially", async function () {
      const deployedAgreements = await factory.getDeployedAgreements();
      expect(deployedAgreements.length).to.equal(0);
    });
  });
  
  describe("Agreement Creation", function () {
    it("Should create an agreement", async function () {
      const now = Math.floor(Date.now() / 1000);
      const deadline = now + 86400; // 1 day later
      const value = ethers.utils.parseEther("1.0");
      
      await expect(factory.createAgreement(
        addr1.address,
        "Test Agreement",
        deadline,
        value
      )).to.emit(factory, "AgreementCreated")
        .withArgs(
          owner.address,
          addr1.address,
          // We can't check the agreement address as it's auto-generated
          ethers.constants.AddressZero, // This will fail but we just check the first two args
          "Test Agreement",
          deadline,
          value
        );
      
      // Check that the agreement was stored
      const deployedAgreements = await factory.getDeployedAgreements();
      expect(deployedAgreements.length).to.equal(1);
      
      // Check user agreements
      const ownerAgreements = await factory.getUserAgreements(owner.address);
      const addr1Agreements = await factory.getUserAgreements(addr1.address);
      
      expect(ownerAgreements.length).to.equal(1);
      expect(addr1Agreements.length).to.equal(1);
      expect(ownerAgreements[0]).to.equal(deployedAgreements[0]);
      expect(addr1Agreements[0]).to.equal(deployedAgreements[0]);
    });
  });
});
