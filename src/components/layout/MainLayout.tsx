import { Sidebar } from './Sidebar';

export const MainLayout = ({ children, activeTab, setActiveTab }: any) => {
  return (
    <div className="flex h-screen overflow-hidden bg-white text-slate-900 font-sans selection:bg-emerald-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 h-screen overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_32%),linear-gradient(180deg,#ffffff_0%,#f3fbf6_100%)]">
        <div className="p-8 xl:p-10 max-w-[1440px] mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
