import React, { useMemo } from 'react';
import { ProtocolReputation, ProtocolAudit, CommunityFeedback } from '../../types/protocol';

interface ReputationScoreProps {
  reputation?: ProtocolReputation | null;
  protocolName: string;
}

const ReputationScore: React.FC<ReputationScoreProps> = ({ 
  reputation,
  protocolName
}) => {
  // Calculate the trust score based on various factors - memoized to avoid recalculating on every render
  const trustScore = useMemo(() => {
    if (!reputation) return 0;
    
    // Use existing trust score if available
    if (reputation.trustScore !== undefined) {
      return reputation.trustScore;
    }
    
    // Otherwise calculate from component scores
    const transparencyWeight = 0.3;
    const developerWeight = 0.25;
    const communityWeight = 0.25;
    const incidentResponseWeight = 0.2;
    
    const transparencyScore = reputation.transparencyScore || 0;
    const developerScore = reputation.developerScore || 0;
    const communityScore = reputation.communityScore || 0;
    const incidentResponseScore = reputation.incidentResponseScore || 0;
    
    const weightedScore = 
      (transparencyScore * transparencyWeight) +
      (developerScore * developerWeight) +
      (communityScore * communityWeight) +
      (incidentResponseScore * incidentResponseWeight);
    
    return Math.round(weightedScore);
  }, [reputation]);
  
  // Get color class based on score - memoized
  const getScoreColorClass = useMemo(() => {
    if (trustScore >= 80) return 'text-green-600';
    if (trustScore >= 60) return 'text-blue-600';
    if (trustScore >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }, [trustScore]);
  
  // Get trust level text - memoized
  const trustLevelText = useMemo(() => {
    if (trustScore >= 80) return 'High Trust';
    if (trustScore >= 60) return 'Good Trust';
    if (trustScore >= 40) return 'Medium Trust';
    return 'Low Trust';
  }, [trustScore]);

  // Get the verification badge based on status
  const getVerificationBadge = () => {
    if (!reputation) return null;
    
    const status = reputation.verificationStatus || 'unverified';
    
    switch (status) {
      case 'verified':
        return (
          <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </div>
        );
      case 'partial':
        return (
          <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center">
            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd" />
            </svg>
            Partially Verified
          </div>
        );
      default:
        return (
          <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium flex items-center">
            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Not Verified
          </div>
        );
    }
  };
  
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) { // 30 days
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // Handle case where reputation data is not available
  if (!reputation) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Reputation Score</h2>
          <p className="text-sm text-gray-600 mt-1">
            Trust metrics for {protocolName}
          </p>
        </div>
        <div className="p-6 text-center">
          <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">Reputation data not available</p>
          <p className="text-gray-500 max-w-md mx-auto">
            No reputation data is available for this protocol. Add protocol details or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Reputation Score</h2>
            <p className="text-sm text-gray-600 mt-1">
              Trust metrics for {protocolName}
            </p>
          </div>
          {getVerificationBadge()}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center">
            <div className="relative mb-2">
              <svg className="w-24 h-24" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="2"
                />
                <circle
                  cx="18" cy="18" r="16"
                  fill="none"
                  stroke={trustScore >= 80 ? "#10b981" : trustScore >= 60 ? "#3b82f6" : trustScore >= 40 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="2"
                  strokeDasharray={`${trustScore} 100`}
                  strokeLinecap="round"
                  transform="rotate(-90 18 18)"
                />
                <text
                  x="18" y="18.5"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#374151"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {trustScore}%
                </text>
              </svg>
            </div>
            <div className={`text-lg font-semibold ${getScoreColorClass}`}>
              {trustLevelText}
            </div>
          </div>
          
          <div className="flex-1 ml-8">
            <h3 className="text-lg font-semibold mb-3">Score Breakdown</h3>
            <div className="space-y-2">
              <ScoreItem 
                label="Transparency" 
                score={reputation.transparencyScore || 0} 
              />
              <ScoreItem 
                label="Developer Activity" 
                score={reputation.developerScore || 0} 
              />
              <ScoreItem 
                label="Community Engagement" 
                score={reputation.communityScore || 0} 
              />
              <ScoreItem 
                label="Incident Response" 
                score={reputation.incidentResponseScore || 0} 
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Audit History</h3>
            {reputation.auditHistory && reputation.auditHistory.length > 0 ? (
              <div className="space-y-3">
                {reputation.auditHistory.map((audit) => (
                  <AuditItem key={audit.id} audit={audit} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
                No audit history available for this protocol.
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Community Feedback</h3>
            {reputation.communityFeedback && reputation.communityFeedback.length > 0 ? (
              <div className="space-y-2">
                {reputation.communityFeedback.map((feedback) => (
                  <FeedbackItem key={feedback.id} feedback={feedback} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
                No community feedback available for this protocol.
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <div>
            <span className="font-medium">Last updated:</span>{' '}
            <span className={reputation.lastUpdated ? '' : 'italic'}>
              {formatDate(reputation.lastUpdated)}
            </span>
          </div>
          <div className={`px-2 py-1 text-xs rounded-full ${
            !reputation.lastUpdated ? 'bg-gray-100' :
            (Date.now() - reputation.lastUpdated < 1000 * 60 * 60 * 24 * 7) ? 'bg-green-100 text-green-800' : 
            (Date.now() - reputation.lastUpdated < 1000 * 60 * 60 * 24 * 30) ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {!reputation.lastUpdated ? 'No update history' :
             (Date.now() - reputation.lastUpdated < 1000 * 60 * 60 * 24 * 7) ? 'Recently updated' : 
             (Date.now() - reputation.lastUpdated < 1000 * 60 * 60 * 24 * 30) ? 'Update needed soon' : 
             'Update overdue'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for score items
const ScoreItem: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getBarColorClass = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{label}</span>
        <span className={`text-xs font-medium ${getScoreColorClass(score)}`}>{score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${getBarColorClass(score)}`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

// Helper component for audit items
const AuditItem: React.FC<{ audit: ProtocolAudit }> = ({ audit }) => {
  const severityClasses = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
    none: 'bg-gray-100 text-gray-800'
  };
  
  return (
    <div className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-lg">
      <div className="flex items-center">
        <div className="mr-3">
          {audit.verified ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <div>
          <div className="font-medium text-sm">{audit.auditor}</div>
          <div className="text-xs text-gray-500">
            {new Date(audit.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short'
            })}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {audit.score !== undefined && (
          <span className="text-sm font-medium">{audit.score}/100</span>
        )}
        {audit.severity && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityClasses[audit.severity]}`}>
            {audit.severity.charAt(0).toUpperCase() + audit.severity.slice(1)}
          </span>
        )}
        {audit.reportUrl && (
          <a 
            href={audit.reportUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

// Helper component for feedback items
const FeedbackItem: React.FC<{ feedback: CommunityFeedback }> = ({ feedback }) => {
  const sentimentClasses = {
    positive: 'bg-green-100 text-green-800',
    neutral: 'bg-gray-100 text-gray-800',
    negative: 'bg-red-100 text-red-800'
  };
  
  const sourceIcons = {
    twitter: (
      <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.028 10.028 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.902 4.902 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
      </svg>
    ),
    discord: (
      <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.084.084 0 0 0-.09.05c-.24.42-.508.999-.693 1.444a16.978 16.978 0 0 0-5.09 0 12.552 12.552 0 0 0-.693-1.445.09.09 0 0 0-.09-.05 18.308 18.308 0 0 0-4.884 1.491.08.08 0 0 0-.039.035C1.227 8.956.76 13.306 1.3 17.595c.003.01.01.02.02.025a18.152 18.152 0 0 0 5.476 2.766c.028.01.056 0 .073-.026.407-.554.774-1.139 1.08-1.754a.084.084 0 0 0-.046-.117 12.016 12.016 0 0 1-1.706-.817.084.084 0 0 1-.009-.141c.114-.086.229-.173.338-.262a.069.069 0 0 1 .073-.01c3.67 1.676 7.65 1.676 11.282 0a.069.069 0 0 1 .072.01c.11.089.225.176.339.262a.084.084 0 0 1-.006.14c-.544.329-1.116.605-1.71.82a.084.084 0 0 0-.047.115c.313.616.68 1.2 1.079 1.753.016.026.045.036.073.026a18.086 18.086 0 0 0 5.483-2.766.083.083 0 0 0 .021-.025c.649-4.97-.999-9.29-4.217-13.068a.064.064 0 0 0-.034-.035Z" />
      </svg>
    ),
    forum: (
      <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    github: (
      <svg className="h-4 w-4 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
    other: (
      <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };
  
  return (
    <div className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-lg">
      <div className="flex items-center">
        <div className="mr-3">
          {sourceIcons[feedback.source]}
        </div>
        <div>
          <div className="text-xs text-gray-500">
            {new Date(feedback.timestamp).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="text-xs font-medium text-gray-700 mt-0.5">
            {feedback.category.charAt(0).toUpperCase() + feedback.category.slice(1)}
          </div>
        </div>
      </div>
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${sentimentClasses[feedback.sentiment]}`}>
        {feedback.sentiment.charAt(0).toUpperCase() + feedback.sentiment.slice(1)}
      </span>
    </div>
  );
};

export default ReputationScore; 