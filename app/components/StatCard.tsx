import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
}

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl">
          {icon}
        </div>
        <p className="text-base font-medium text-gray-600 dark:text-gray-300">{title}</p>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
} 