import { ethers } from "hardhat";
import { DeFiSentinel } from "../typechain-types";

async function main() {
    // Get the deployed contract address
    const SENTINEL_ADDRESS = "0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6"; // Replace with your deployed contract address

    // Get the contract instance
    const DeFiSentinel = await ethers.getContractFactory("DeFiSentinel");
    const sentinel = await DeFiSentinel.attach(SENTINEL_ADDRESS) as DeFiSentinel;

    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("Interacting with contract as:", deployer.address);

    // Example interactions
    async function displayProtocolInfo(protocolAddress: string) {
        const details = await sentinel.getProtocolDetails(protocolAddress);
        console.log("\nProtocol Details:");
        console.log("Name:", details.name);
        console.log("Active:", details.isActive);
        console.log("Risk Score:", details.riskScore.toString());
        console.log("Last Update:", new Date(details.lastUpdateTime.toNumber() * 1000).toLocaleString());
    }

    try {
        // 1. Register a new protocol
        console.log("\nRegistering new protocol...");
        const newProtocol = "0x1234567890123456789012345678901234567890";
        const tx1 = await sentinel.registerProtocol(newProtocol, "Test Protocol", 50);
        await tx1.wait();
        console.log("Protocol registered successfully");
        await displayProtocolInfo(newProtocol);

        // 2. Update risk score
        console.log("\nUpdating risk score...");
        const tx2 = await sentinel.updateRiskScore(newProtocol, 75);
        await tx2.wait();
        console.log("Risk score updated successfully");
        await displayProtocolInfo(newProtocol);

        // 3. Record an anomaly
        console.log("\nRecording anomaly...");
        const tx3 = await sentinel.recordAnomaly(
            newProtocol,
            "SUSPICIOUS_ACTIVITY",
            "Large unexpected withdrawal detected",
            4
        );
        await tx3.wait();
        console.log("Anomaly recorded successfully");
        
        const anomalyCount = await sentinel.getAnomalyCount();
        console.log("Total anomalies:", anomalyCount.toString());

        // 4. Get all protocols
        console.log("\nGetting all protocols...");
        const protocols = await sentinel.getAllProtocols();
        console.log("Registered protocols:", protocols);

        // 5. Calculate user risk score
        console.log("\nCalculating user risk score...");
        const tx4 = await sentinel.recordUserExposure(deployer.address, newProtocol);
        await tx4.wait();
        const riskScore = await sentinel.calculateUserRiskScore(deployer.address);
        console.log("User risk score:", riskScore.toString());
        
        const exposures = await sentinel.getUserExposures(deployer.address);
        console.log("User exposures:", exposures);

    } catch (error) {
        console.error("Error during interaction:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 