interface NetworkSummaryPanelProps {
  ipv6Detected: boolean;
  dnsIpv6Success: boolean;
  connectionNote?: string | null;
}

export const NetworkSummaryPanel = ({
  ipv6Detected,
  dnsIpv6Success,
  connectionNote
}: NetworkSummaryPanelProps) => (
  <article className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Resumo</p>
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">
          {ipv6Detected
            ? 'Seu endereço IPv6 público foi detectado nesta sessão.'
            : 'Nenhum endereço IPv6 público foi detectado nesta sessão.'}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {ipv6Detected
            ? 'Como a sessão conseguiu acessar um endpoint IPv6 dedicado, o navegador mostrou compatibilidade funcional com IPv6.'
            : 'Se você tem IPv6 na rede local, mas ele não apareceu aqui, isso normalmente significa que esta sessão específica chegou aos testes por IPv4.'}
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Resolvedor da sessão</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {dnsIpv6Success
            ? 'O resolvedor usado pela sua sessão parece ter acesso a recursos IPv6 na internet.'
            : 'Não houve confirmação de alcance IPv6 no resolvedor da sessão durante este teste.'}
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Conexão com a aplicação</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {connectionNote || 'A API não retornou observações adicionais sobre a sessão.'}
        </p>
      </div>
    </div>
  </article>
);
