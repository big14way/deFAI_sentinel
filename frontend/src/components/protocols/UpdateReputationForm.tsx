import React, { useState } from 'react';
import { ProtocolReputation, ProtocolAudit, CommunityFeedback } from '../../types/protocol';

interface UpdateReputationFormProps {
  protocolId: string;
  currentReputation?: ProtocolReputation;
  onUpdate: (data: ProtocolReputation) => Promise<void>;
  onCancel: () => void;
}

const UpdateReputationForm: React.FC<UpdateReputationFormProps> = ({
  protocolId,
  currentReputation,
  onUpdate,
  onCancel
}) => {
  // Initial state based on current reputation or defaults
  const [formData, setFormData] = useState<ProtocolReputation>(
    currentReputation || {
      transparencyScore: 50,
      auditHistory: [],
      incidentResponseScore: 50,
      developerScore: 50,
      communityScore: 50,
      communityFeedback: [],
      lastUpdated: Date.now(),
      verificationStatus: 'unverified'
    }
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'audit' | 'community'>('basic');
  
  // New audit being added
  const [newAudit, setNewAudit] = useState<Partial<ProtocolAudit>>({
    id: '',
    auditor: '',
    date: Date.now(),
    reportUrl: '',
    severity: 'none',
    score: 75,
    verified: false
  });
  
  // New feedback being added
  const [newFeedback, setNewFeedback] = useState<Partial<CommunityFeedback>>({
    id: '',
    source: 'twitter',
    sentiment: 'neutral',
    category: 'general',
    timestamp: Date.now(),
    weight: 0.5
  });
  
  // Handle basic score changes
  const handleScoreChange = (field: keyof ProtocolReputation, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle verification status change
  const handleStatusChange = (status: 'verified' | 'partial' | 'unverified') => {
    setFormData(prev => ({
      ...prev,
      verificationStatus: status
    }));
  };
  
  // Add a new audit to the history
  const handleAddAudit = () => {
    // Validate audit data
    if (!newAudit.auditor) {
      setError('Auditor name is required');
      return;
    }
    
    const auditToAdd: ProtocolAudit = {
      id: `audit-${Date.now()}`,
      auditor: newAudit.auditor || '',
      date: newAudit.date || Date.now(),
      reportUrl: newAudit.reportUrl,
      severity: newAudit.severity as any,
      score: newAudit.score || 50,
      verified: newAudit.verified || false
    };
    
    setFormData(prev => ({
      ...prev,
      auditHistory: [...prev.auditHistory, auditToAdd]
    }));
    
    // Reset the new audit form
    setNewAudit({
      id: '',
      auditor: '',
      date: Date.now(),
      reportUrl: '',
      severity: 'none',
      score: 75,
      verified: false
    });
  };
  
  // Remove an audit from the history
  const handleRemoveAudit = (auditId: string) => {
    setFormData(prev => ({
      ...prev,
      auditHistory: prev.auditHistory.filter(audit => audit.id !== auditId)
    }));
  };
  
  // Add new community feedback
  const handleAddFeedback = () => {
    // Validate feedback data
    if (!newFeedback.source) {
      setError('Feedback source is required');
      return;
    }
    
    const feedbackToAdd: CommunityFeedback = {
      id: `feedback-${Date.now()}`,
      source: newFeedback.source as any,
      sentiment: newFeedback.sentiment as any,
      category: newFeedback.category as any,
      timestamp: newFeedback.timestamp || Date.now(),
      weight: newFeedback.weight || 0.5
    };
    
    setFormData(prev => ({
      ...prev,
      communityFeedback: [...prev.communityFeedback, feedbackToAdd]
    }));
    
    // Reset the new feedback form
    setNewFeedback({
      id: '',
      source: 'twitter',
      sentiment: 'neutral',
      category: 'general',
      timestamp: Date.now(),
      weight: 0.5
    });
  };
  
  // Remove feedback
  const handleRemoveFeedback = (feedbackId: string) => {
    setFormData(prev => ({
      ...prev,
      communityFeedback: prev.communityFeedback.filter(feedback => feedback.id !== feedbackId)
    }));
  };
  
  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Update lastUpdated timestamp
      const dataToSubmit = {
        ...formData,
        lastUpdated: Date.now()
      };
      
      await onUpdate(dataToSubmit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating reputation data');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to format dates
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toISOString().substring(0, 10);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Update Reputation Data</h3>
        <div className="space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Basic Scores
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'audit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Audit History
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'community'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Community Feedback
          </button>
        </nav>
      </div>
      
      {/* Basic Scores Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Verification Status</h4>
            <div className="flex space-x-4 mb-6">
              {(['verified', 'partial', 'unverified'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleStatusChange(status)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    formData.verificationStatus === status
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {status === 'verified' ? 'Verified' : 
                   status === 'partial' ? 'Partially Verified' : 'Unverified'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="transparency-score" className="block text-sm font-medium text-gray-700 mb-1">
                Transparency Score: {formData.transparencyScore}
              </label>
              <input
                id="transparency-score"
                type="range"
                min="0"
                max="100"
                value={formData.transparencyScore}
                onChange={(e) => handleScoreChange('transparencyScore', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="incident-response-score" className="block text-sm font-medium text-gray-700 mb-1">
                Incident Response Score: {formData.incidentResponseScore}
              </label>
              <input
                id="incident-response-score"
                type="range"
                min="0"
                max="100"
                value={formData.incidentResponseScore}
                onChange={(e) => handleScoreChange('incidentResponseScore', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="developer-score" className="block text-sm font-medium text-gray-700 mb-1">
                Developer Expertise Score: {formData.developerScore}
              </label>
              <input
                id="developer-score"
                type="range"
                min="0"
                max="100"
                value={formData.developerScore}
                onChange={(e) => handleScoreChange('developerScore', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
            
            <div>
              <label htmlFor="community-score" className="block text-sm font-medium text-gray-700 mb-1">
                Community Sentiment Score: {formData.communityScore}
              </label>
              <input
                id="community-score"
                type="range"
                min="0"
                max="100"
                value={formData.communityScore}
                onChange={(e) => handleScoreChange('communityScore', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Audit History Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Current Audit History</h4>
            {formData.auditHistory.length === 0 ? (
              <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">
                No audit history recorded yet
              </div>
            ) : (
              <div className="space-y-2">
                {formData.auditHistory.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{audit.auditor}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(audit.date).toLocaleDateString()}
                        {audit.severity && ` • Severity: ${audit.severity}`}
                        {audit.score !== undefined && ` • Score: ${audit.score}/100`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAudit(audit.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove audit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Audit</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="audit-auditor" className="block text-sm font-medium text-gray-700 mb-1">
                  Auditor*
                </label>
                <input
                  id="audit-auditor"
                  type="text"
                  value={newAudit.auditor || ''}
                  onChange={(e) => setNewAudit({...newAudit, auditor: e.target.value})}
                  placeholder="e.g., OpenZeppelin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="audit-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  id="audit-date"
                  type="date"
                  value={formatDate(newAudit.date || Date.now())}
                  onChange={(e) => setNewAudit({...newAudit, date: new Date(e.target.value).getTime()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="audit-severity" className="block text-sm font-medium text-gray-700 mb-1">
                  Highest Finding Severity
                </label>
                <select
                  id="audit-severity"
                  value={newAudit.severity}
                  onChange={(e) => setNewAudit({...newAudit, severity: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="none">None</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="audit-score" className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Score: {newAudit.score}
                </label>
                <input
                  id="audit-score"
                  type="range"
                  min="0"
                  max="100"
                  value={newAudit.score || 50}
                  onChange={(e) => setNewAudit({...newAudit, score: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="audit-url" className="block text-sm font-medium text-gray-700 mb-1">
                  Report URL
                </label>
                <input
                  id="audit-url"
                  type="url"
                  value={newAudit.reportUrl || ''}
                  onChange={(e) => setNewAudit({...newAudit, reportUrl: e.target.value})}
                  placeholder="https://example.com/audit-report.pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    id="audit-verified"
                    type="checkbox"
                    checked={newAudit.verified || false}
                    onChange={(e) => setNewAudit({...newAudit, verified: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="audit-verified" className="ml-2 block text-sm text-gray-700">
                    Verified (audit report has been manually verified)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddAudit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Audit
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Community Feedback Tab */}
      {activeTab === 'community' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Current Community Feedback</h4>
            {formData.communityFeedback.length === 0 ? (
              <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">
                No community feedback recorded yet
              </div>
            ) : (
              <div className="space-y-2">
                {formData.communityFeedback.map((feedback) => (
                  <div key={feedback.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{feedback.source} • {feedback.sentiment}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(feedback.timestamp).toLocaleDateString()} • 
                        Category: {feedback.category} • 
                        Weight: {feedback.weight}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeedback(feedback.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove feedback"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Feedback</h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="feedback-source" className="block text-sm font-medium text-gray-700 mb-1">
                  Source
                </label>
                <select
                  id="feedback-source"
                  value={newFeedback.source}
                  onChange={(e) => setNewFeedback({...newFeedback, source: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="twitter">Twitter</option>
                  <option value="discord">Discord</option>
                  <option value="forum">Forum</option>
                  <option value="github">GitHub</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="feedback-sentiment" className="block text-sm font-medium text-gray-700 mb-1">
                  Sentiment
                </label>
                <select
                  id="feedback-sentiment"
                  value={newFeedback.sentiment}
                  onChange={(e) => setNewFeedback({...newFeedback, sentiment: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="positive">Positive</option>
                  <option value="neutral">Neutral</option>
                  <option value="negative">Negative</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="feedback-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="feedback-category"
                  value={newFeedback.category}
                  onChange={(e) => setNewFeedback({...newFeedback, category: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="development">Development</option>
                  <option value="communication">Communication</option>
                  <option value="transparency">Transparency</option>
                  <option value="incident">Incident Response</option>
                  <option value="general">General</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="feedback-weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight: {newFeedback.weight}
                </label>
                <input
                  id="feedback-weight"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newFeedback.weight}
                  onChange={(e) => setNewFeedback({...newFeedback, weight: parseFloat(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="feedback-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  id="feedback-date"
                  type="date"
                  value={formatDate(newFeedback.timestamp || Date.now())}
                  onChange={(e) => setNewFeedback({...newFeedback, timestamp: new Date(e.target.value).getTime()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateReputationForm; 