// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DeFAI Sentinel Monitoring Contract
 * @dev Contract for monitoring restaking protocols and providing on-chain risk assessments
 */
contract DeFiSentinel is Ownable, ReentrancyGuard {
    // Structs
    struct Protocol {
        address contractAddress;
        string name;
        uint256 riskScore;  // 0-100, higher is riskier
        bool isActive;
        uint256 lastUpdateTime;
    }

    struct Anomaly {
        address protocol;
        string anomalyType;
        string description;
        uint256 severity;  // 1-5, 5 being most severe
        uint256 timestamp;
        bool resolved;
    }

    // State variables
    mapping(address => Protocol) public protocols;
    address[] public registeredProtocols;
    Anomaly[] public anomalies;
    mapping(address => address[]) public userExposures;
    uint256 public constant RISK_THRESHOLD = 70;

    // Events
    event AlertRaised(
        address indexed protocol,
        address indexed caller,
        string alertType,
        uint256 riskScore,
        uint256 timestamp
    );
    
    event ProtocolRegistered(
        address indexed protocol,
        string name,
        uint256 timestamp
    );

    event AnomalyDetected(
        address indexed protocol,
        string anomalyType,
        uint256 severity
    );

    event AnomalyResolved(uint256 indexed anomalyId);
    event UserExposureRecorded(address indexed user, address indexed protocol);

    // Protocol registration
    function registerProtocol(
        address _protocol,
        string memory _name,
        uint256 _initialRiskScore
    ) external onlyOwner {
        require(!protocols[_protocol].isActive, "Protocol already registered");
        require(_initialRiskScore <= 100, "Risk score must be 0-100");
        
        protocols[_protocol] = Protocol({
            contractAddress: _protocol,
            name: _name,
            riskScore: _initialRiskScore,
            isActive: true,
            lastUpdateTime: block.timestamp
        });
        
        registeredProtocols.push(_protocol);
        
        emit ProtocolRegistered(_protocol, _name, block.timestamp);
    }

    // Update risk score for a protocol
    function updateRiskScore(address _protocol, uint256 _riskScore) external onlyOwner {
        require(protocols[_protocol].isActive, "Protocol not active");
        require(_riskScore <= 100, "Risk score must be <= 100");
        
        protocols[_protocol].riskScore = _riskScore;
        protocols[_protocol].lastUpdateTime = block.timestamp;
        
        if (_riskScore >= RISK_THRESHOLD) {
            emit AlertRaised(
                _protocol,
                msg.sender,
                "HIGH_RISK_SCORE",
                _riskScore,
                block.timestamp
            );
        }
    }

    // Record anomaly
    function recordAnomaly(
        address _protocol,
        string memory _anomalyType,
        string memory _description,
        uint256 _severity
    ) external onlyOwner {
        require(protocols[_protocol].isActive, "Protocol not active");
        require(_severity >= 1 && _severity <= 5, "Severity must be 1-5");
        
        anomalies.push(Anomaly({
            protocol: _protocol,
            anomalyType: _anomalyType,
            description: _description,
            severity: _severity,
            timestamp: block.timestamp,
            resolved: false
        }));
        
        emit AnomalyDetected(_protocol, _anomalyType, _severity);
    }

    // Resolve anomaly
    function resolveAnomaly(uint256 _anomalyId) external onlyOwner {
        require(_anomalyId < anomalies.length, "Invalid anomaly ID");
        require(!anomalies[_anomalyId].resolved, "Anomaly already resolved");
        
        anomalies[_anomalyId].resolved = true;
        emit AnomalyResolved(_anomalyId);
    }

    // Record user exposure
    function recordUserExposure(address _user, address _protocol) external {
        require(protocols[_protocol].isActive, "Protocol not active");
        
        bool alreadyExposed = false;
        for(uint i = 0; i < userExposures[_user].length; i++) {
            if(userExposures[_user][i] == _protocol) {
                alreadyExposed = true;
                break;
            }
        }
        
        if(!alreadyExposed) {
            userExposures[_user].push(_protocol);
            emit UserExposureRecorded(_user, _protocol);
        }
    }

    // View functions
    function getProtocolDetails(address _protocol)
        external
        view
        returns (
            string memory name,
            bool isActive,
            uint256 riskScore,
            uint256 lastUpdateTime
        )
    {
        Protocol memory protocol = protocols[_protocol];
        return (
            protocol.name,
            protocol.isActive,
            protocol.riskScore,
            protocol.lastUpdateTime
        );
    }

    function getAllProtocols() external view returns (address[] memory) {
        return registeredProtocols;
    }

    function getAnomalyCount() external view returns (uint256) {
        return anomalies.length;
    }

    function getUserExposures(address _user) external view returns (address[] memory) {
        return userExposures[_user];
    }

    function calculateUserRiskScore(address _user) external view returns (uint256) {
        address[] memory exposures = userExposures[_user];
        
        if(exposures.length == 0) {
            return 0;
        }
        
        uint256 totalRisk = 0;
        for(uint i = 0; i < exposures.length; i++) {
            totalRisk += protocols[exposures[i]].riskScore;
        }
        
        return totalRisk / exposures.length;
    }
} 