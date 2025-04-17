import { ethers } from "hardhat";

async function main() {
    console.log("Deploying DeFiSentinel...");

    // Deploy the contract
    const DeFiSentinel = await ethers.getContractFactory("DeFiSentinel");
    const sentinel = await DeFiSentinel.deploy();
    await sentinel.deployed();

    console.log("DeFiSentinel deployed to:", sentinel.address);

    // Register some example protocols (for testing)
    const protocols = [
        {
            address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9", // AAVE
            name: "Aave",
            initialRiskScore: 30
        },
        {
            address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
            name: "Wrapped Ether",
            initialRiskScore: 20
        }
    ];

    console.log("\nRegistering example protocols...");
    for (const protocol of protocols) {
        await sentinel.registerProtocol(
            protocol.address,
            protocol.name,
            protocol.initialRiskScore
        );
        console.log(`Registered ${protocol.name} at ${protocol.address}`);
    }

    // Verify contract on Etherscan
    if (process.env.ETHERSCAN_API_KEY) {
        console.log("\nVerifying contract on Etherscan...");
        try {
            await sentinel.deployTransaction.wait(5); // wait for 5 block confirmations
            await hre.run("verify:verify", {
                address: sentinel.address,
                constructorArguments: []
            });
        } catch (error) {
            console.log("Error verifying contract:", error);
        }
    }

    console.log("\nDeployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 