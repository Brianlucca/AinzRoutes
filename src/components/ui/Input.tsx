export const Input = ({ icon: Icon, ...props }: any) => {
  return (
    <div className="flex-1 relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
      )}
      <input
        className={`block w-full ${Icon ? 'pl-10' : 'px-4'} pr-3 py-3 border border-emerald-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm`}
        {...props}
      />
    </div>
  );
};
