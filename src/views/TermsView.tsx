import { ArrowUpRight, BriefcaseBusiness, Database, FileCheck2, Globe2, Scale, Shield, Sparkles, Workflow } from 'lucide-react';

const sections = [
  {
    icon: FileCheck2,
    title: 'Sobre o projeto',
    text: 'O AinzRoutes é uma plataforma de diagnóstico de rede, monitoramento de serviços e utilitários operacionais voltada para consulta técnica, validação de conectividade e apoio visual a análises de infraestrutura.',
  },
  {
    icon: Shield,
    title: 'Privacidade e dados',
    text: 'O projeto não foi desenvolvido para armazenar contas, documentos pessoais, perfis privados ou histórico sensível de usuários. A aplicação funciona como interface entre navegador e servidor para processar consultas técnicas.',
  },
  {
    icon: Database,
    title: 'Armazenamento',
    text: 'Não existe proposta de banco de dados de usuários ou histórico persistente para consultas comuns do site. O foco da plataforma é processar a requisição e devolver o resultado técnico correspondente.',
  },
  {
    icon: Globe2,
    title: 'Cache local',
    text: 'Algumas informações de conveniência podem ser salvas apenas no navegador do próprio usuário, como últimos IPs pesquisados, histórico recente de verificações e preferências de interface. Esses dados podem ser apagados a qualquer momento pelo próprio usuário.',
  },
  {
    icon: Shield,
    title: 'Logs operacionais',
    text: 'A aplicação pode registrar o user-agent das requisições em logs técnicos de operação. Em ações protegidas por verificação de segurança, o IP de origem também pode ser registrado para prevenção de abuso, proteção da infraestrutura e validação da interação.',
  },
  {
    icon: Scale,
    title: 'Limites do monitoramento',
    text: 'Os resultados dependem de conectividade, resposta de terceiros e disponibilidade dos endpoints monitorados. Quando um item aparece como online, isso indica conectividade técnica e não necessariamente saúde completa do serviço.',
  },
  {
    icon: Shield,
    title: 'Uso adequado',
    text: 'Ao utilizar o AinzRoutes, o usuário concorda em usar a plataforma para fins legítimos de diagnóstico, estudo e observabilidade, sem abuso de infraestrutura, scans não autorizados ou atividades que violem políticas e regras de terceiros.',
  },
];

const professionalLinks = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/brian-lucca-cardozo',
    icon: BriefcaseBusiness,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Brianlucca',
    icon: Workflow,
  },
];

export const TermsView = () => {
  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-10 pb-12">
      <header className="border-b border-emerald-100 pb-10 pt-4">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">Transparência institucional</span>
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Termos de Uso e Privacidade</h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-slate-600">
          Uma visão clara e objetiva sobre o funcionamento da plataforma, nossa abordagem técnica sobre o tráfego de dados e os limites éticos e operacionais do AinzRoutes.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <article
                  key={section.title}
                  className="rounded-2xl border border-emerald-100 bg-white p-6 transition-all hover:border-emerald-300 hover:shadow-[0_18px_40px_rgba(16,185,129,0.08)]"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-emerald-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>
                  </div>
                  <p className="text-[14px] leading-relaxed text-slate-600">{section.text}</p>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:col-span-4">
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
              <Database className="h-4 w-4 text-emerald-600" />
              Fluxo de dados
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Servidor (Back-end)</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">
                    Processa requisições em tempo real. Logs operacionais podem incluir user-agent e, em ações protegidas, o IP de origem.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Navegador (Client)</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">Armazena preferências visuais e históricos recentes apenas na sua máquina.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Desenvolvido por</p>
            <h3 className="mb-5 text-lg font-bold text-slate-900">Brian Lucca</h3>

            <div className="space-y-2">
              {professionalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 transition-all hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-slate-500 transition-colors group-hover:text-emerald-600" />
                      <span className="text-sm font-medium text-slate-700 transition-colors group-hover:text-slate-900">{link.label}</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-emerald-600" />
                  </a>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
