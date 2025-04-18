import React from 'react';
import { Protocol } from '../../types';
import { Anomaly } from '../../types/anomaly';
import { formatCurrency } from '../../utils/formatters';

interface DashboardStatsProps {
  totalProtocols: number;
  activeProtocols: number;
  highRiskProtocols: number;
  totalTVL: number;
  recentAnomalies: number;
}

const StatsCard: React.FC<{
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: number;
  isPositive?: boolean;
}> = ({ title, value, icon, change, isPositive }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {change !== undefined && (
        <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
          {isPositive ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          <span>{change}%</span>
        </div>
      )}
    </div>
  );
};

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalProtocols,
  activeProtocols,
  highRiskProtocols,
  totalTVL,
  recentAnomalies,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatsCard 
        title="Total Protocols" 
        value={totalProtocols}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
      <StatsCard 
        title="Active Protocols" 
        value={activeProtocols}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        change={Math.round((activeProtocols / totalProtocols) * 100)}
        isPositive={true}
      />
      <StatsCard 
        title="High Risk Protocols" 
        value={highRiskProtocols}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
        change={Math.round((highRiskProtocols / totalProtocols) * 100)}
        isPositive={false}
      />
      <StatsCard 
        title="Total TVL" 
        value={formatCurrency(totalTVL)}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <StatsCard 
        title="Recent Anomalies" 
        value={recentAnomalies}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
};

export default DashboardStats; 