export const ResultBox = ({ title, icon: Icon, iconColor = 'text-emerald-600', children }: any) => {
  return (
    <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`w-6 h-6 ${iconColor}`} />
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="text-sm text-slate-600">{children}</div>
    </div>
  );
};
