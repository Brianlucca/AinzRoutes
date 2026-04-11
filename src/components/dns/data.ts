export const dnsProfiles = [
  {
    title: 'Perfil gamer',
    summary: 'Prioriza menor tempo de resposta e estabilidade para jogos online, voz e matchmaking.',
    recommendation: 'Para jogos, normalmente vale priorizar o DNS que apareceu com menor tempo médio e alta taxa de sucesso neste teste.',
    notes: 'Se dois DNS estiverem muito próximos, o ideal é repetir o teste em horários diferentes antes de decidir.',
  },
  {
    title: 'Perfil privacidade',
    summary: 'Prioriza filtragem e proteção contra domínios maliciosos acima da menor latência possível.',
    recommendation: 'Se o objetivo for mais proteção na navegação, vale considerar um DNS com foco em segurança, mesmo que ele não seja o mais rápido da rodada.',
    notes: 'Esse perfil costuma fazer mais sentido para trabalho, uso corporativo e redes que exigem uma postura mais conservadora.',
  },
  {
    title: 'Perfil corporativo global',
    summary: 'Prioriza previsibilidade operacional e boa distribuição de infraestrutura.',
    recommendation: 'Para ambientes mais amplos, costuma valer mais um DNS equilibrado e consistente do que apenas o menor tempo em um único teste.',
    notes: 'Esse tipo de análise fica ainda mais forte quando comparado com novas coletas ao longo do tempo.',
  },
];
