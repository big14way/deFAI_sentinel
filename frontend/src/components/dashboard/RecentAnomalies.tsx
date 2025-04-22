import React from 'react';
import { Anomaly } from '../../types';

interface RecentAnomaliesProps {
  anomalies: Anomaly[];
  onViewDetails: (id: string) => void;
}

const RecentAnomalies: React.FC<RecentAnomaliesProps> = ({ anomalies, onViewDetails }) => {
  // Helper for formatting date
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };
  
  // Helper for severity class
  const getSeverityClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (anomalies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No anomalies detected.</p>
        <p className="text-sm text-gray-400 mt-1">
          Anomalies will appear here when unusual patterns are detected.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {anomalies.map((anomaly) => (
          <div
            key={anomaly.id}
            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onViewDetails(anomaly.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getSeverityClass(anomaly.severity)}`}>
                  {anomaly.severity}
                </span>
                <h3 className="font-medium text-gray-900">
                  {anomaly.protocol ? anomaly.protocol.name : 'Unknown Protocol'}
                </h3>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(anomaly.timestamp)}
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              {anomaly.description || 'No description provided'}
            </p>
            
            {anomaly.metrics && (
              <div className="mt-2 text-xs text-gray-500">
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(anomaly.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span>{typeof value === 'number' ? value.toFixed(2) : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAnomalies; 