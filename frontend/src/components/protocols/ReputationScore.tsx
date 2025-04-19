import React from 'react';
import { ProtocolReputation, ProtocolAudit, CommunityFeedback } from '../../types/protocol';

interface ReputationScoreProps {
  reputation?: ProtocolReputation;
  protocolName: string;
}

export const ReputationScore: React.FC<ReputationScoreProps> = ({ 
  reputation,
  protocolName
}) => {
  // Calculate overall trust score if it doesn't exist
  const calculateTrustScore = () => {
    if (!reputation) return 0;
    
    // Weight each factor based on importance
    const weights = {
      transparency: 0.25,
      audit: 0.3,
      incident: 0.15,
      developer: 0.2,
      community: 0.1
    };
    
    // Calculate weighted score
    let score = 0;
    score += reputation.transparencyScore * weights.transparency;
    
    // Calculate audit score (average of all audits or 0 if none)
    const auditScore = reputation.auditHistory.length 
      ? reputation.auditHistory.reduce((sum, audit) => sum + (audit.score || 0), 0) / reputation.auditHistory.length 
      : 0;
    score += auditScore * weights.audit;
    
    score += reputation.incidentResponseScore * weights.incident;
    score += reputation.developerScore * weights.developer;
    score += reputation.communityScore * weights.community;
    
    return Math.round(score);
  };
  
  // Get the verification status badge
  const getVerificationBadge = () => {
    if (!reputation) return null;
    
    const statusClasses = {
      verified: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      unverified: 'bg-gray-100 text-gray-800'
    };
    
    const statusLabels = {
      verified: 'Verified',
      partial: 'Partially Verified',
      unverified: 'Unverified'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[reputation.verificationStatus]}`}>
        {statusLabels[reputation.verificationStatus]}
      </span>
    );
  };
  
  // Helper to get score color class
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-600';
  };
  
  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If no reputation data is available
  if (!reputation) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Trust & Reputation</h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Available
          </span>
        </div>
        <div className="text-gray-500 text-sm mb-4">
          Reputation data for {protocolName} is not yet available. This includes trust scores based on team transparency, audit history, and community feedback.
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <p className="text-gray-400 font-medium">No Data</p>
          </div>
        </div>
      </div>
    );
  }

  const trustScore = reputation.trustScore || calculateTrustScore();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Trust & Reputation</h3>
        {getVerificationBadge()}
      </div>
      
      {/* Trust Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Trust Score</h4>
            <span className={`text-2xl font-bold ${getScoreColorClass(trustScore)}`}>
              {trustScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getScoreColorClass(trustScore)}`} 
              style={{ width: `${trustScore}%`, backgroundColor: 'currentColor' }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {formatDate(reputation.lastUpdated)}
          </p>
        </div>
        
        {/* Score Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Score Breakdown</h4>
          <div className="space-y-2">
            <ScoreItem label="Transparency" score={reputation.transparencyScore} />
            <ScoreItem 
              label="Audit History" 
              score={reputation.auditHistory.length 
                ? reputation.auditHistory.reduce((sum, audit) => sum + (audit.score || 0), 0) / reputation.auditHistory.length 
                : 0
              } 
            />
            <ScoreItem label="Incident Response" score={reputation.incidentResponseScore} />
            <ScoreItem label="Developer Expertise" score={reputation.developerScore} />
            <ScoreItem label="Community Sentiment" score={reputation.communityScore} />
          </div>
        </div>
      </div>
      
      {/* Audit History */}
      {reputation.auditHistory.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Audit History</h4>
          <div className="space-y-2">
            {reputation.auditHistory.map((audit) => (
              <AuditItem key={audit.id} audit={audit} />
            ))}
          </div>
        </div>
      )}
      
      {/* Community Feedback */}
      {reputation.communityFeedback.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Community Feedback</h4>
          <div className="space-y-2">
            {reputation.communityFeedback.slice(0, 3).map((feedback) => (
              <FeedbackItem key={feedback.id} feedback={feedback} />
            ))}
          </div>
          {reputation.communityFeedback.length > 3 && (
            <div className="mt-2 text-center">
              <button className="text-blue-600 text-sm hover:text-blue-800">
                View all {reputation.communityFeedback.length} feedback items
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper component for score items
const ScoreItem: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    if (score >= 20) return 'text-orange-500';
    return 'text-red-600';
  };
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-600">{label}</span>
      <span className={`text-xs font-medium ${getScoreColorClass(score)}`}>{score}/100</span>
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
        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.012 10.012 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
      </svg>
    ),
    discord: (
      <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
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