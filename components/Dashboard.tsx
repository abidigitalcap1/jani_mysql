import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { DASHBOARD_STATS } from '../constants';
import { StatCardData } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatCardData[]>(DASHBOARD_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api.php?action=getDashboardStats');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dashboard stats');
        }
        
        const newStats = [
          { ...DASHBOARD_STATS[0], value: (data.ordersCount || 0).toString() },
          { ...DASHBOARD_STATS[1], value: `PKR ${Number(data.todaysSales).toLocaleString()}` },
          { ...DASHBOARD_STATS[2], value: `PKR ${Number(data.pendingAmount).toLocaleString()}` },
          { ...DASHBOARD_STATS[3], value: `PKR ${Number(data.todaysExpenses).toLocaleString()}` }
        ];

        setStats(newStats);

      } catch (error: any) {
        console.error("Error fetching stats:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={loading ? '...' : stat.value}
            icon={stat.icon}
            gradient={stat.gradient}
          />
        ))}
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="h-64 flex items-center justify-center">
            <p className="text-slate-400 text-lg">Main content area for tables or charts.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;