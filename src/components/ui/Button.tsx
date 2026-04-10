export const Button = ({ children, icon: Icon, variant = 'primary', ...props }: any) => {
  const baseClass = 'flex items-center px-6 py-3 font-medium rounded-xl transition-colors';
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    secondary: 'bg-white hover:bg-emerald-50 text-slate-700 border border-emerald-200'
  };

  return (
    <button className={`${baseClass} ${variants[variant as keyof typeof variants]}`} {...props}>
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};
