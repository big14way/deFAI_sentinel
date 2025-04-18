import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, loading = false }) => {
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
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColorClass}`}>
          {icon}
        </span>
      </div>
      {loading ? (
        <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mt-1"></div>
      ) : (
        <p className={`mt-1 text-3xl font-semibold ${valueColorClass}`}>{value}</p>
      )}
    </div>
  );
};

export default StatCard; 