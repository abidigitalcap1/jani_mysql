
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient }) => {
  return (
    <div className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-md font-medium text-white/90">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="opacity-70">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
