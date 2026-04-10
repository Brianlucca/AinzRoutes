import { ArrowUpRight, BriefcaseBusiness, Database, FileCheck2, Globe2, Scale, Shield, Sparkles, Workflow } from 'lucide-react';

const sections = [
  {
    icon: FileCheck2,
    title: 'Sobre o projeto',
    text: 'O AinzRoutes é uma plataforma de diagnóstico de rede, monitoramento de serviços e utilitários operacionais voltada para consulta técnica, validação de conectividade e apoio visual a análises de infraestrutura.'
  },
  {
    icon: Shield,
    title: 'Privacidade e dados',
    text: 'O projeto não foi desenvolvido para armazenar contas, documentos pessoais, perfis privados ou histórico sensível de usuários. A aplicação funciona como interface entre navegador, frontend e servidor para processar consultas técnicas.'
  },
  {
    icon: Database,
    title: 'Armazenamento',
    text: 'Não existe proposta de banco de dados de usuários ou histórico persistente no servidor para consultas comuns do site. O foco da plataforma é processar a requisição e devolver o resultado técnico correspondente.'
  },
  {
    icon: Globe2,
    title: 'Cache local',
    text: 'Algumas informações de conveniência podem ser salvas apenas no navegador do próprio usuário, como últimos IPs pesquisados, histórico recente de verificações e preferências de interface. Esses dados podem ser apagados a qualquer momento pelo próprio usuário.'
  },
  {
    icon: Scale,
    title: 'Limites do monitoramento',
    text: 'Os resultados dependem de conectividade, resposta de terceiros e disponibilidade dos endpoints monitorados. Quando um item aparece como online, isso indica conectividade técnica e não necessariamente saúde completa do serviço.'
  },
  {
    icon: Shield,
    title: 'Uso adequado',
    text: 'Ao utilizar o AinzRoutes, o usuário concorda em usar a plataforma para fins legítimos de diagnóstico, estudo e observabilidade, sem abuso de infraestrutura, scans não autorizados ou atividades que violem políticas e regras de terceiros.'
  }
];

const professionalLinks = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/brian-lucca/',
    icon: BriefcaseBusiness
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Brianlucca',
    icon: Workflow
  }
];

export const TermsView = () => {
  return (
    <div className="w-full max-w-[1100px] mx-auto space-y-10 pb-12">
      <header className="border-b border-emerald-100 pb-10 pt-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-600">
            Transparência Institucional
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
          Termos de Uso e Privacidade
        </h1>
        <p className="text-[15px] text-slate-600 max-w-2xl leading-relaxed">
          Uma visão clara e objetiva sobre o funcionamento da plataforma, nossa abordagem técnica sobre o tráfego de dados e os limites éticos e operacionais do AinzRoutes.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <article
                  key={section.title}
                  className="bg-white border border-emerald-100 rounded-2xl p-6 hover:border-emerald-300 hover:shadow-[0_18px_40px_rgba(16,185,129,0.08)] transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900">{section.title}</h2>
                  </div>
                  <p className="text-[14px] text-slate-600 leading-relaxed">{section.text}</p>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              Fluxo de Dados
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Servidor (Back-end)</p>
                  <p className="text-[13px] text-slate-600 mt-0.5 leading-relaxed">Processa requisições em tempo real. Sem retenção de logs de pesquisa.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Navegador (Client)</p>
                  <p className="text-[13px] text-slate-600 mt-0.5 leading-relaxed">Armazena preferências visuais e históricos recentes apenas na sua máquina.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">Desenvolvido por</p>
            <h3 className="text-lg font-bold text-slate-900 mb-5">Brian Lucca</h3>

            <div className="space-y-2">
              {professionalLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl bg-emerald-50/50 border border-emerald-100 p-3 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 transition-colors" />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{link.label}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
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
