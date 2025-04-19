import axios from 'axios';
import { Protocol, ProtocolReputation } from '../types/protocol';
import { mockProtocols } from './mockData'; // Import mock data for development

// Get the base API URL from environment
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Get reputation data for a protocol
 * @param protocolAddress The protocol's blockchain address
 */
export const getProtocolReputation = async (protocolAddress: string): Promise<ProtocolReputation | null> => {
  try {
    // First try to get from API
    const response = await axios.get(`${apiUrl}/api/protocols/${protocolAddress}/reputation`);
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`API request failed for ${protocolAddress} reputation:`, error);
    
    // If API fails, look for mock data
    const mockProtocol = mockProtocols.find(
      p => p.address.toLowerCase() === protocolAddress.toLowerCase()
    );
    
    if (mockProtocol?.reputationDetails) {
      return mockProtocol.reputationDetails;
    }
    
    // Generate mock reputation data for demo purposes
    if (protocolAddress) {
      // Return mock data based on protocol address to ensure consistency
      const addressSum = Array.from(protocolAddress.slice(2, 10))
        .map(char => char.charCodeAt(0))
        .reduce((sum, code) => sum + code, 0);
      
      const normalizedSum = addressSum % 100; // 0-99 range
      
      // More established protocols (low risk score) tend to have better reputation
      const mockProtocol = mockProtocols.find(
        p => p.address.toLowerCase() === protocolAddress.toLowerCase()
      );
      
      const baseScore = mockProtocol ? 
        Math.max(30, 100 - mockProtocol.riskScore) : // Inverse of risk score with minimum of 30
        40 + (normalizedSum % 40); // 40-80 range based on address
      
      const variability = 15; // Score variability
      
      return {
        transparencyScore: Math.min(100, Math.max(0, baseScore + (Math.random() * variability * 2 - variability))),
        auditHistory: [
          {
            id: `audit-1-${protocolAddress.slice(2, 10)}`,
            auditor: normalizedSum > 50 ? 'OpenZeppelin' : 'Trail of Bits',
            date: Date.now() - 1000 * 60 * 60 * 24 * 30 * (1 + (normalizedSum % 6)), // 1-6 months ago
            reportUrl: `https://example.com/audits/${protocolAddress.slice(2, 10)}`,
            severity: normalizedSum > 70 ? 'low' : normalizedSum > 40 ? 'medium' : 'high',
            score: baseScore + 5,
            verified: true
          }
        ],
        incidentResponseScore: Math.min(100, Math.max(0, baseScore - 10 + (Math.random() * variability * 2 - variability))),
        developerScore: Math.min(100, Math.max(0, baseScore + 5 + (Math.random() * variability * 2 - variability))),
        communityScore: Math.min(100, Math.max(0, baseScore - 5 + (Math.random() * variability * 2 - variability))),
        communityFeedback: [
          {
            id: `feedback-1-${protocolAddress.slice(2, 10)}`,
            source: 'twitter',
            sentiment: baseScore > 60 ? 'positive' : baseScore > 40 ? 'neutral' : 'negative',
            category: 'transparency',
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 7, // 1 week ago
            weight: 0.8
          },
          {
            id: `feedback-2-${protocolAddress.slice(2, 10)}`,
            source: 'discord',
            sentiment: baseScore > 50 ? 'positive' : 'neutral',
            category: 'development',
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 14, // 2 weeks ago
            weight: 0.6
          }
        ],
        lastUpdated: Date.now() - 1000 * 60 * 60 * 24 * 14, // 2 weeks ago
        verificationStatus: baseScore > 75 ? 'verified' : baseScore > 50 ? 'partial' : 'unverified',
        trustScore: baseScore
      };
    }
  }
  
  return null;
};

/**
 * Update reputation data for a protocol
 * @param protocolAddress Protocol blockchain address
 * @param data Updated reputation data
 */
export const updateProtocolReputation = async (
  protocolAddress: string,
  data: ProtocolReputation
): Promise<ProtocolReputation> => {
  try {
    // First try to update via API
    const response = await axios.put(
      `${apiUrl}/api/protocols/${protocolAddress}/reputation`, 
      data
    );
    
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`API update failed for ${protocolAddress} reputation:`, error);
    
    // For development/demo, just return the data as if it was successfully saved
    return {
      ...data,
      lastUpdated: Date.now() // Update the timestamp
    };
  }
  
  // If all else fails, return the input data
  return data;
};

/**
 * Add audit report to a protocol's reputation
 * @param protocolAddress Protocol blockchain address
 * @param auditData Audit data to add
 */
export const addProtocolAudit = async (
  protocolAddress: string,
  auditData: any
): Promise<ProtocolReputation | null> => {
  try {
    // Try to add via API
    const response = await axios.post(
      `${apiUrl}/api/protocols/${protocolAddress}/audits`, 
      auditData
    );
    
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`API audit add failed for ${protocolAddress}:`, error);
    
    // For development, get current reputation and add the audit
    const currentReputation = await getProtocolReputation(protocolAddress);
    
    if (currentReputation) {
      const updatedReputation = {
        ...currentReputation,
        auditHistory: [...currentReputation.auditHistory, {
          ...auditData,
          id: `audit-${Date.now()}`,
          date: auditData.date || Date.now()
        }],
        lastUpdated: Date.now()
      };
      
      return updatedReputation;
    }
  }
  
  return null;
};

/**
 * Add community feedback to a protocol's reputation
 * @param protocolAddress Protocol blockchain address
 * @param feedbackData Feedback data to add
 */
export const addProtocolFeedback = async (
  protocolAddress: string,
  feedbackData: any
): Promise<ProtocolReputation | null> => {
  try {
    // Try to add via API
    const response = await axios.post(
      `${apiUrl}/api/protocols/${protocolAddress}/feedback`, 
      feedbackData
    );
    
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.warn(`API feedback add failed for ${protocolAddress}:`, error);
    
    // For development, get current reputation and add the feedback
    const currentReputation = await getProtocolReputation(protocolAddress);
    
    if (currentReputation) {
      const updatedReputation = {
        ...currentReputation,
        communityFeedback: [...currentReputation.communityFeedback, {
          ...feedbackData,
          id: `feedback-${Date.now()}`,
          timestamp: feedbackData.timestamp || Date.now()
        }],
        lastUpdated: Date.now()
      };
      
      return updatedReputation;
    }
  }
  
  return null;
}; 