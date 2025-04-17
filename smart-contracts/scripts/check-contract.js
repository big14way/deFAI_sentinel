const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABI from the artifacts directory
const abiPath = path.join(__dirname, "../artifacts/contracts/DeFiSentinel.sol/DeFiSentinel.json");
const contractData = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const abi = contractData.abi;

async function main() {
  // Contract address on Base Sepolia
  const contractAddress = "0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6";
  
  // Connect to the Base Sepolia network
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"
  );
  
  // Initialize contract instance
  const contract = new ethers.Contract(contractAddress, abi, provider);
  
  try {
    console.log("Checking contract status on Base Sepolia...");
    
    // Check if contract exists by calling a read function
    const protocolCount = await contract.getAllProtocols();
    console.log(`✓ Contract is deployed and responding at ${contractAddress}`);
    console.log(`✓ Number of registered protocols: ${protocolCount.length}`);
    
    // Get contract owner
    const owner = await contract.owner();
    console.log(`✓ Contract owner: ${owner}`);
    
    // Get risk threshold
    const riskThreshold = await contract.RISK_THRESHOLD();
    console.log(`✓ Risk threshold: ${riskThreshold}`);
    
    // Check anomaly count
    const anomalyCount = await contract.getAnomalyCount();
    console.log(`✓ Recorded anomalies: ${anomalyCount}`);
    
    // Get protocol details if any exist
    if (protocolCount.length > 0) {
      const firstProtocol = protocolCount[0];
      const details = await contract.getProtocolDetails(firstProtocol);
      console.log("\nFirst Protocol Details:");
      console.log(`Name: ${details.name}`);
      console.log(`Active: ${details.isActive}`);
      console.log(`Risk Score: ${details.riskScore}`);
      console.log(`Last Update: ${new Date(details.lastUpdateTime.toNumber() * 1000).toLocaleString()}`);
    }
    
    console.log("\n✅ Contract verification complete - DeFiSentinel is operational");
  } catch (error) {
    console.error("\n❌ Contract verification failed:", error);
    console.error("The contract may not be properly deployed or is not responding.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 