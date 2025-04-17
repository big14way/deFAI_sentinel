import { ethers } from "hardhat";
import { DeFiSentinel } from "../typechain-types";

async function main() {
    // Get the deployed contract address
    const SENTINEL_ADDRESS = "0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6";

    try {
        // Get the contract instance
        const DeFiSentinel = await ethers.getContractFactory("DeFiSentinel");
        const sentinel = await DeFiSentinel.attach(SENTINEL_ADDRESS) as DeFiSentinel;

        // Get signers
        const [deployer] = await ethers.getSigners();
        console.log("Connected account:", deployer.address);
        console.log("Contract address:", SENTINEL_ADDRESS);

        // Get some basic contract info to verify it's working
        console.log("\nVerifying contract functionality...");
        
        // Get all registered protocols
        const protocols = await sentinel.getAllProtocols();
        console.log("Registered protocols:", protocols);

        // Get protocol details for the first protocol (if any exist)
        if (protocols.length > 0) {
            const firstProtocol = protocols[0];
            const details = await sentinel.getProtocolDetails(firstProtocol);
            console.log("\nFirst Protocol Details:");
            console.log("Name:", details.name);
            console.log("Active:", details.isActive);
            console.log("Risk Score:", details.riskScore.toString());
            console.log("Last Update:", new Date(details.lastUpdateTime.toNumber() * 1000).toLocaleString());
        } else {
            console.log("No protocols registered yet.");
        }

        // Get anomaly count
        const anomalyCount = await sentinel.getAnomalyCount();
        console.log("\nTotal anomalies:", anomalyCount.toString());

        console.log("\nContract verification successful! The contract is operational.");
        
    } catch (error) {
        console.error("Error during verification:", error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 