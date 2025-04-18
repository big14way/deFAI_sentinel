import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
  change?: number;
  isPositive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading = false, change, isPositive }) => {
  // Define color classes
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  
  const iconColorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  const valueColorClass = `text-${color}-600`;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColorClass}`}>
          {icon}
        </span>
      </div>
      {loading ? (
        <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mt-1"></div>
      ) : (
        <>
          <p className={`mt-1 text-3xl font-semibold ${valueColorClass}`}>{value}</p>
          
          {change !== undefined && (
            <div className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center mt-2`}>
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
        </>
      )}
    </div>
  );
};

export default StatCard; 