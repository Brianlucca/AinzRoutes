interface DnsHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
}

export const DnsHero = ({ eyebrow, title, description, accent }: DnsHeroProps) => {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#f5fff8_56%,#ecfdf5_100%)] p-7 shadow-sm">
      <div className={`absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl ${accent}`} />
      <div className="relative max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 xl:text-4xl">{title}</h1>
        <p className="mt-3 leading-relaxed text-slate-600">{description}</p>
      </div>
    </section>
  );
};
