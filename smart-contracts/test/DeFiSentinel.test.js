const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFiSentinel", function () {
    let DeFiSentinel;
    let sentinel;
    let owner;
    let user1;
    let user2;
    let mockProtocol;

    beforeEach(async function () {
        [owner, user1, user2, mockProtocol] = await ethers.getSigners();
        
        DeFiSentinel = await ethers.getContractFactory("DeFiSentinel");
        sentinel = await DeFiSentinel.deploy();
        await sentinel.deployed();
    });

    describe("Protocol Management", function () {
        it("Should register a new protocol", async function () {
            await sentinel.registerProtocol(mockProtocol.address, "Mock Protocol", 50);
            
            const protocols = await sentinel.getAllProtocols();
            expect(protocols).to.include(mockProtocol.address);
            
            const details = await sentinel.getProtocolDetails(mockProtocol.address);
            expect(details.name).to.equal("Mock Protocol");
            expect(details.isActive).to.be.true;
            expect(details.riskScore).to.equal(50);
        });

        it("Should not register same protocol twice", async function () {
            await sentinel.registerProtocol(mockProtocol.address, "Mock Protocol", 50);
            
            await expect(
                sentinel.registerProtocol(mockProtocol.address, "Mock Protocol 2", 60)
            ).to.be.revertedWith("Protocol already registered");
        });

        it("Should update risk score", async function () {
            await sentinel.registerProtocol(mockProtocol.address, "Mock Protocol", 50);
            await sentinel.updateRiskScore(mockProtocol.address, 75);
            
            const details = await sentinel.getProtocolDetails(mockProtocol.address);
            expect(details.riskScore).to.equal(75);
        });

        it("Should emit alert for high risk score", async function () {
            await sentinel.registerProtocol(mockProtocol.address, "Mock Protocol", 50);
            
            await expect(sentinel.updateRiskScore(mockProtocol.address, 80))
                .to.emit(sentinel, "AlertRaised")
                .withArgs(
                    mockProtocol.address,
                    owner.address,
                    "HIGH_RISK_SCORE",
                    80,
                    await ethers.provider.getBlock("latest").then(b => b.timestamp)
                );
        });
    });

    describe("Anomaly Management", function () {
        beforeEach(async function () {
            await sentinel.registerProtocol(mockProtocol.address, "Mock Protocol", 50);
        });

        it("Should record an anomaly", async function () {
            await sentinel.recordAnomaly(
                mockProtocol.address,
                "SUSPICIOUS_ACTIVITY",
                "Large unexpected withdrawal",
                4
            );
            
            expect(await sentinel.getAnomalyCount()).to.equal(1);
        });

        it("Should resolve an anomaly", async function () {
            await sentinel.recordAnomaly(
                mockProtocol.address,
                "SUSPICIOUS_ACTIVITY",
                "Large unexpected withdrawal",
                4
            );
            
            await sentinel.resolveAnomaly(0);
            const anomaly = await sentinel.anomalies(0);
            expect(anomaly.resolved).to.be.true;
        });
    });

    describe("User Exposure", function () {
        beforeEach(async function () {
            await sentinel.registerProtocol(mockProtocol.address, "Mock Protocol", 50);
        });

        it("Should record user exposure", async function () {
            await sentinel.recordUserExposure(user1.address, mockProtocol.address);
            
            const exposures = await sentinel.getUserExposures(user1.address);
            expect(exposures).to.include(mockProtocol.address);
        });

        it("Should not record duplicate exposure", async function () {
            await sentinel.recordUserExposure(user1.address, mockProtocol.address);
            await sentinel.recordUserExposure(user1.address, mockProtocol.address);
            
            const exposures = await sentinel.getUserExposures(user1.address);
            expect(exposures.length).to.equal(1);
        });

        it("Should calculate user risk score", async function () {
            await sentinel.recordUserExposure(user1.address, mockProtocol.address);
            
            const riskScore = await sentinel.calculateUserRiskScore(user1.address);
            expect(riskScore).to.equal(50);
        });
    });
}); 