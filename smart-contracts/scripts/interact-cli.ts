import { ethers } from "hardhat";
import { DeFiSentinel } from "../typechain-types";
import readline from "readline";

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for input
const prompt = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

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

    // Display menu and handle user input
    while (true) {
      console.log("\n=== DeFiSentinel CLI Interface ===");
      console.log("1. List all protocols");
      console.log("2. Get protocol details");
      console.log("3. Register new protocol");
      console.log("4. Update protocol risk score");
      console.log("5. Record anomaly");
      console.log("6. Resolve anomaly");
      console.log("7. Calculate user risk score");
      console.log("8. Exit");

      const choice = await prompt("\nSelect an option (1-8): ");

      switch (choice) {
        case "1":
          // List all protocols
          const protocols = await sentinel.getAllProtocols();
          console.log("\nRegistered Protocols:");
          protocols.forEach((addr, i) => {
            console.log(`${i + 1}. ${addr}`);
          });
          break;

        case "2":
          // Get protocol details
          const protocolAddr = await prompt("Enter protocol address: ");
          try {
            const details = await sentinel.getProtocolDetails(protocolAddr);
            console.log("\nProtocol Details:");
            console.log("Name:", details.name);
            console.log("Active:", details.isActive);
            console.log("Risk Score:", details.riskScore.toString());
            console.log("Last Update:", new Date(details.lastUpdateTime.toNumber() * 1000).toLocaleString());
          } catch (error) {
            console.error("Error fetching protocol details:", error);
          }
          break;

        case "3":
          // Register new protocol
          const newProtocol = await prompt("Enter protocol address: ");
          const protocolName = await prompt("Enter protocol name: ");
          const initialRiskScore = await prompt("Enter initial risk score (0-100): ");
          
          try {
            const tx = await sentinel.registerProtocol(newProtocol, protocolName, initialRiskScore);
            await tx.wait();
            console.log("Protocol registered successfully!");
          } catch (error) {
            console.error("Error registering protocol:", error);
          }
          break;

        case "4":
          // Update risk score
          const updateAddr = await prompt("Enter protocol address: ");
          const newRiskScore = await prompt("Enter new risk score (0-100): ");
          
          try {
            const tx = await sentinel.updateRiskScore(updateAddr, newRiskScore);
            await tx.wait();
            console.log("Risk score updated successfully!");
          } catch (error) {
            console.error("Error updating risk score:", error);
          }
          break;

        case "5":
          // Record anomaly
          const anomalyProtocol = await prompt("Enter protocol address: ");
          const anomalyType = await prompt("Enter anomaly type: ");
          const description = await prompt("Enter description: ");
          const severity = await prompt("Enter severity (1-5): ");
          
          try {
            const tx = await sentinel.recordAnomaly(anomalyProtocol, anomalyType, description, severity);
            await tx.wait();
            console.log("Anomaly recorded successfully!");
          } catch (error) {
            console.error("Error recording anomaly:", error);
          }
          break;

        case "6":
          // Resolve anomaly
          const anomalyCount = await sentinel.getAnomalyCount();
          console.log(`Total anomalies: ${anomalyCount}`);
          const anomalyId = await prompt("Enter anomaly ID to resolve: ");
          
          try {
            const tx = await sentinel.resolveAnomaly(anomalyId);
            await tx.wait();
            console.log("Anomaly resolved successfully!");
          } catch (error) {
            console.error("Error resolving anomaly:", error);
          }
          break;

        case "7":
          // Calculate user risk score
          const userAddress = await prompt("Enter user address: ");
          
          try {
            const riskScore = await sentinel.calculateUserRiskScore(userAddress);
            console.log(`User risk score: ${riskScore}`);
            
            const exposures = await sentinel.getUserExposures(userAddress);
            console.log("User exposures:", exposures);
          } catch (error) {
            console.error("Error calculating user risk score:", error);
          }
          break;

        case "8":
          // Exit
          console.log("Exiting...");
          rl.close();
          return;

        default:
          console.log("Invalid option. Please try again.");
      }
    }
  } catch (error) {
    console.error("Error during interaction:", error);
    rl.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });