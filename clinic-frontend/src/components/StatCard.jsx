import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, trend }) => {
  return (
    <div className="card group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
          <Icon size={20} className="text-neutral-700" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{trend > 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-neutral-500 font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-neutral-900 tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="text-xs text-neutral-400 mt-2 font-medium">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
