#!/bin/bash

# The deployed contract address
CONTRACT_ADDRESS="0xB4685D9441e2DD20C74eb4E079D741D4f8520ba6"

# Run the verification command
echo "Verifying contract at address: $CONTRACT_ADDRESS"
npx hardhat verify --network base $CONTRACT_ADDRESS 