import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: string;
    label: string;
    positive?: boolean;
  };
}

export function StatsCard({ 
  title, 
  value, 
  icon: IconComponent, 
  iconBgColor, 
  iconColor, 
  trend 
}: StatsCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</p>
        </div>
        <div className={`w-14 h-14 ${iconBgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <IconComponent className={`w-7 h-7 ${iconColor}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span 
            className={`text-sm font-medium flex items-center space-x-1 space-x-reverse ${
              trend.positive !== false ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <span>{trend.value}</span>
            {trend.positive !== false ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
          <span className="text-sm text-gray-500 mr-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
