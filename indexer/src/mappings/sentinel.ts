import {
  AlertRaised as AlertRaisedEvent,
  ProtocolRegistered as ProtocolRegisteredEvent,
  RiskScoreUpdated,
  AnomalyRecorded,
  UserExposureRecorded
} from '../generated/DeFiSentinel/DeFiSentinel'
import { Alert, Protocol, Anomaly, UserExposure } from '../generated/schema'
import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts'

export function handleAlertRaised(event: AlertRaisedEvent): void {
  let alertId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let alert = new Alert(alertId)
  
  alert.protocol = event.params.protocol
  alert.caller = event.params.caller
  alert.alertType = event.params.alertType
  alert.riskScore = event.params.riskScore
  alert.timestamp = event.params.timestamp
  alert.transactionHash = event.transaction.hash
  
  alert.save()
  
  // Update protocol risk score
  let protocol = Protocol.load(event.params.protocol.toHexString())
  if (protocol) {
    protocol.lastRiskScore = event.params.riskScore
    protocol.lastUpdateTime = event.params.timestamp
    protocol.save()
  }
}

export function handleProtocolRegistered(event: ProtocolRegisteredEvent): void {
  let protocol = new Protocol(event.params.protocol.toHexString())
  
  protocol.address = event.params.protocol
  protocol.name = event.params.name
  protocol.isRegistered = true
  protocol.lastRiskScore = BigInt.fromI32(0)
  protocol.lastUpdateTime = event.params.timestamp
  protocol.registrationTime = event.params.timestamp
  
  protocol.save()
}

export function handleRiskScoreUpdated(event: RiskScoreUpdated): void {
  let protocol = Protocol.load(event.params.protocolAddress.toHexString())
  if (protocol) {
    protocol.riskScore = event.params.newRiskScore
    protocol.lastUpdateTime = event.block.timestamp
    protocol.save()
  }
}

export function handleAnomalyRecorded(event: AnomalyRecorded): void {
  let anomalyId = event.transaction.hash.toHexString() + '-' + event.logIndex.toString()
  let anomaly = new Anomaly(anomalyId)
  
  anomaly.protocol = event.params.protocolAddress.toHexString()
  anomaly.anomalyType = event.params.anomalyType
  anomaly.description = event.params.description
  anomaly.severity = event.params.severity
  anomaly.timestamp = event.block.timestamp
  anomaly.save()

  // Update protocol's last anomaly time
  let protocol = Protocol.load(event.params.protocolAddress.toHexString())
  if (protocol) {
    protocol.lastAnomalyTime = event.block.timestamp
    protocol.anomalyCount = protocol.anomalyCount.plus(BigInt.fromI32(1))
    protocol.save()
  }
}

export function handleUserExposureRecorded(event: UserExposureRecorded): void {
  let exposureId = event.params.user.toHexString() + '-' + event.params.protocolAddress.toHexString()
  let exposure = new UserExposure(exposureId)
  
  exposure.user = event.params.user
  exposure.protocol = event.params.protocolAddress.toHexString()
  exposure.timestamp = event.block.timestamp
  exposure.save()
}

// Retry mechanism for missed blocks
export function handleBlock(block: ethereum.Block): void {
  let blockNumber = block.number
  let lastProcessedBlock = BigInt.fromI32(0) // Load from your persistent storage

  if (blockNumber.gt(lastProcessedBlock.plus(BigInt.fromI32(1)))) {
    // Missed blocks detected
    for (let i = lastProcessedBlock.plus(BigInt.fromI32(1)); i.lt(blockNumber); i = i.plus(BigInt.fromI32(1))) {
      // Process missed block
      // Implement your retry logic here
    }
  }

  // Update last processed block
  // Save to your persistent storage
} 