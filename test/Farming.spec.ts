import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployAllFarmingDependencies() {
    const [owner, otherAccount] = await ethers.getSigners();

    const MockBEP20 = await ethers.getContractFactory("MockBEP20");
    const cake = await MockBEP20.deploy("Pancake", "CAKE", ethers.utils.parseUnits("1000000", 18));

    const masterChefAddress = owner.address;
    const cakePoolId = 0;

    const CakePool = await ethers.getContractFactory("CakePool");
    const cakePool = await CakePool.deploy(cake.address, masterChefAddress, owner.address, owner.address, owner.address, cakePoolId);

    await cake["mint(address,uint256)"](cakePool.address, ethers.utils.parseUnits("1000", 18));
    await cake["mint(address,uint256)"](owner.address, ethers.utils.parseUnits("1000000", 18));

    return { cake, cakePool };
  }

  describe("Deployment", function () {
    it("Should set the right cake address", async function () {
      const { cakePool } = await loadFixture(deployAllFarmingDependencies);
      expect(cakePool.address).not.to.be.equals(ethers.constants.AddressZero);
    });

    it("Should be able to transfer cake to contract as rewards", async function () {
      const { cakePool } = await loadFixture(deployAllFarmingDependencies);
      const balanceOf = await cakePool.balanceOf();
      expect(balanceOf).to.be.equals(ethers.utils.parseUnits("1000", 18));
    });

    it("Should be able to deposit to earn reward", async function () {
      const { cake, cakePool } = await loadFixture(deployAllFarmingDependencies);

      const stakingAmount = ethers.utils.parseUnits("200", 18);
      const LOCK_DURATION = 1 * 7 * 24 * 60 * 60;

      await cake.approve(cakePool.address, stakingAmount.mul(3));
      await cakePool.deposit(stakingAmount, LOCK_DURATION);
    });
  });
});
