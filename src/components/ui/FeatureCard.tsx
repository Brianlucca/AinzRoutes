import { ArrowRight } from 'lucide-react';

export const FeatureCard = ({ item, onClick }: any) => {
  const Icon = item.icon;

  return (
    <div
      className="bg-white border border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-[0_18px_40px_rgba(16,185,129,0.10)] transition-all cursor-pointer group"
      onClick={() => onClick(item.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors border border-emerald-100">
            <Icon className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">{item.label}</h3>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
      </div>
    </div>
  );
};
