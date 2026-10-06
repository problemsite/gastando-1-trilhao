// =====================================================================
//  GASTE 1 TRILHÃO — catálogo de ações (edite aqui)
//  Cada ação só pode ser comprada UMA vez.
//  price em reais | hours = tempo pra FECHAR o negócio (sem viagem)
//  tier = tipo de prazo (explica o tempo no card) | remote = sem viagem
//  hint = dica que aparece ao passar o mouse no país (sem revelar o nome)
// =====================================================================
(function () {
  const MI = 1e6, BI = 1e9, TRI = 1e12;

  // Regras de tempo — o card mostra o "porquê"
  const TIERS = {
    prateleira: 'Compra de prateleira: paga à vista e leva na hora.',
    lote: 'Estoque inteiro: conferência, papelada e transporte.',
    imovel: 'Imóvel: escritura no cartório. Pagando com ágio, sai no mesmo dia.',
    gigante: 'Veículo gigante: vistoria, registro e tripulação.',
    clube: 'A liga precisa aprovar o novo dono.',
    empresa: 'Controle de empresa: você fecha pessoalmente com os donos, na sede.',
    remota: 'Encomenda fechada por videochamada. Não precisa viajar.',
    obra: 'Obra paga 100% adiantado. Fica pronta daqui a anos, mas o dinheiro sai hoje.'
  };

  const A = [];
  const add = (o) => A.push(o);

  /* ============================== BRASIL ============================== */
  add({ id: 'rio_cobertura', country: 'BR', city: 'rio', cat: 'house', tier: 'imovel', price: 60 * MI, hours: 2,
    name: 'Cobertura de frente pra Ipanema', short: 'Cobertura em Ipanema', hint: '🏖️ uma cobertura de frente pro mar',
    aliases: ['cobertura', 'uma cobertura', 'apartamento no rio', 'cobertura em ipanema', 'apartamento de luxo', 'um apartamento', 'apartamento na praia'],
    keys: ['cobertura', 'ipanema', 'apartamento'], msg: 'A vista é incrível. O saldo continua praticamente igual.' });
  add({ id: 'rio_concessionaria', country: 'BR', city: 'rio', cat: 'car', tier: 'lote', price: 80 * MI, hours: 2,
    name: 'Todos os carros de uma concessionária', short: 'Concessionária', hint: '🚗 uma concessionária inteira',
    aliases: ['todos os carros', 'comprar todos os carros', 'concessionária inteira', 'todos os carros da concessionária', 'todos os carros dessa concessionária', 'levar todos os carros', 'todos os carros da loja', 'uma concessionária'],
    keys: ['concessionária', 'concessionaria', 'carros'], msg: 'Você acabou de comprar uma concessionária inteira.' });
  add({ id: 'relogios', country: 'BR', city: 'rio', cat: 'watch', tier: 'prateleira', price: 45 * MI, hours: 1,
    name: 'Todos os relógios de uma joalheria', short: 'Relógios', hint: '⌚ a vitrine inteira de uma joalheria',
    aliases: ['relógios', 'todos os relógios', 'rolex', 'joias', 'joalheria', 'todas as joias', 'relógio de luxo'],
    keys: ['relógio', 'relogio', 'rolex', 'joia', 'joalheria'], msg: 'Você agora tem um relógio pra cada minuto do dia.' });
  add({ id: 'uma_ferrari', country: 'BR', city: 'rio', cat: 'car', tier: 'prateleira', price: 5 * MI, hours: 1,
    name: 'Uma Ferrari zero km', short: 'Uma Ferrari', hint: '🏎️ um carro esportivo',
    aliases: ['uma ferrari', 'um carro', 'um carro de luxo', 'um lamborghini', 'uma lamborghini', 'um porsche', 'carro esportivo'],
    keys: ['carro'], msg: 'Parabéns pela Ferrari. Faltam só R$ 999.995.000.000.' });
  add({ id: 'jato', country: 'BR', city: 'rio', cat: 'jet', tier: 'gigante', price: 420 * MI, hours: 3,
    name: 'Um jato particular de longo alcance', short: 'Jato particular', hint: '✈️ um jato particular',
    aliases: ['um jato', 'jatinho', 'avião particular', 'jato particular', 'um avião', 'jet'],
    keys: ['jato', 'jatinho', 'avião', 'aviao'], msg: 'Seu jato está abastecido e com o seu nome na cauda.' });
  add({ id: 'helicopteros', country: 'BR', city: 'rio', cat: 'heli', tier: 'lote', price: 250 * MI, hours: 2,
    name: '10 helicópteros executivos', short: '10 helicópteros', hint: '🚁 uma frota de helicópteros',
    aliases: ['helicópteros', 'um helicóptero', 'frota de helicópteros'],
    keys: ['helicóptero', 'helicoptero'], msg: 'Trânsito? Nunca mais ouviu falar.' });
  add({ id: 'brasileirao', country: 'BR', city: 'rio', cat: 'trophy', tier: 'clube', price: 60 * BI, hours: 14,
    name: 'Os 20 clubes do Brasileirão', short: 'Brasileirão inteiro', hint: '⚽ o campeonato inteiro',
    aliases: ['todos os times do brasileirão', 'brasileirão', 'todos os times', 'todos os clubes', 'times brasileiros', 'o campeonato brasileiro', 'um time de futebol brasileiro', 'o flamengo'],
    keys: ['brasileirão', 'brasileirao', 'serie', 'campeonato', 'flamengo', 'corinthians', 'palmeiras'], msg: 'O campeão brasileiro já está definido: você.' });
  add({ id: 'obra_trem', country: 'BR', city: 'rio', cat: 'train', tier: 'obra',
    flex: { min: 30 * BI, max: 150 * BI, options: [30 * BI, 60 * BI, 100 * BI, 150 * BI], base: 6, k: 0.8 },
    name: 'Começar a obra do trem-bala Rio–São Paulo', short: 'Obra do trem-bala', hint: '🚄 uma obra de trem-bala',
    aliases: ['trem bala', 'trem-bala', 'construir um trem bala', 'linha de trem', 'ferrovia', 'construir uma ferrovia', 'metrô'],
    keys: ['trem', 'ferrovia', 'metrô', 'metro'], msg: 'Rio–São Paulo em 1h30. Fica pronto em 2033. De nada, Brasil.' });
  add({ id: 'mansao_sp', country: 'BR', city: 'sao_paulo', cat: 'house', tier: 'imovel', price: 150 * MI, hours: 3,
    name: 'Mansão no Jardim Europa', short: 'Mansão em SP', hint: '🏠 a maior mansão de São Paulo',
    aliases: ['uma mansão', 'mansão', 'casa gigante', 'uma casa', 'mansão em são paulo', 'casa de luxo', 'a maior casa'],
    keys: ['mansão', 'mansao', 'casa'], msg: 'A mansão é sua. A chave veio num chaveiro de ouro.' });
  add({ id: 'supercarros', country: 'BR', city: 'sao_paulo', cat: 'car', tier: 'lote', price: 300 * MI, hours: 2,
    name: '50 supercarros (Ferrari, Lamborghini, McLaren)', short: '50 supercarros', hint: '🏎️ uma coleção de supercarros',
    aliases: ['monte de ferrari', 'várias ferraris', 'supercarros', 'carros esportivos', 'lamborghinis', 'ferraris', 'coleção de carros', 'todos os supercarros', 'muitos carros'],
    keys: ['supercarro', 'ferraris', 'lamborghini', 'mclaren', 'esportivo', 'bugatti'], msg: 'São 50 supercarros. Você vai precisar de uma garagem maior.' });
  add({ id: 'companhia_aerea', country: 'BR', city: 'sao_paulo', cat: 'plane', tier: 'empresa', price: 30 * BI, hours: 14,
    name: 'Uma companhia aérea brasileira', short: 'Companhia aérea', hint: '🛫 uma companhia aérea',
    aliases: ['companhia aérea', 'uma companhia aérea', 'empresa aérea', 'uma aérea'],
    keys: ['companhia', 'aérea', 'aerea'], msg: 'Você comprou uma companhia aérea. Primeira classe pra todo mundo.' });
  add({ id: 'fazenda', country: 'BR', city: 'cuiaba', cat: 'farm', tier: 'imovel', price: 2 * BI, hours: 4,
    name: 'Fazenda gigante no Mato Grosso', short: 'Fazenda no MT', hint: '🌾 uma fazenda gigante',
    aliases: ['uma fazenda', 'fazenda', 'terras', 'fazenda gigante', 'uma fazenda enorme'],
    keys: ['fazenda', 'terra', 'gado', 'hectare'], msg: 'Você agora é dono de uma área maior que muitas cidades.' });

  /* ============================== EUA ============================== */
  add({ id: 'miami_mansoes', country: 'US', city: 'miami', cat: 'house', tier: 'imovel', price: 1.6 * BI, hours: 4,
    name: '10 mansões à beira-mar em Miami', short: 'Mansões em Miami', hint: '🏝️ mansões à beira-mar',
    aliases: ['mansões em miami', '20 mansões em miami', 'casas em miami', 'mansão em miami', 'várias mansões'],
    keys: ['miami', 'mansões', 'mansoes'], msg: 'Dez mansões em Miami. Você não vai dormir duas noites na mesma.' });
  add({ id: 'miami_concessionaria', country: 'US', city: 'miami', cat: 'car', tier: 'lote', price: 450 * MI, hours: 2,
    name: 'Concessionária de supercarros em Miami', short: 'Concessionária Miami', hint: '🚘 uma concessionária de supercarros',
    aliases: ['concessionária em miami', 'concessionária inteira em miami', 'carros em miami', 'concessionária de supercarros'],
    keys: ['miami', 'concessionária', 'concessionaria'], msg: 'Miami agora tem um novo dono de concessionária.' });
  add({ id: 'la_mansoes', country: 'US', city: 'los_angeles', cat: 'house', tier: 'imovel', price: 2.4 * BI, hours: 4,
    name: 'Uma rua inteira de mansões em Beverly Hills', short: 'Rua em Beverly Hills', hint: '🌴 uma rua de mansões de famosos',
    aliases: ['mansões em los angeles', 'mansões em beverly hills', 'mansões em hollywood', 'uma rua de mansões', 'todas as mansões'],
    keys: ['beverly', 'hollywood', 'angeles'], msg: 'A rua inteira é sua. Os vizinhos famosos agora pagam aluguel.' });
  add({ id: 'estudio', country: 'US', city: 'los_angeles', cat: 'film', tier: 'empresa', price: 45 * BI, hours: 16,
    name: 'Um estúdio de cinema de Hollywood', short: 'Estúdio de Hollywood', hint: '🎬 um estúdio de cinema',
    aliases: ['estúdio de cinema', 'um estúdio', 'estúdio de hollywood', 'produtora de filmes'],
    keys: ['estúdio', 'estudio', 'cinema', 'filme', 'filmes'], msg: 'Todo filme agora tem uma cena com você.' });
  add({ id: 'ny_arranhaceu', country: 'US', city: 'nova_york', cat: 'building', tier: 'imovel', price: 12 * BI, hours: 5,
    name: 'Um arranha-céu inteiro em Manhattan', short: 'Arranha-céu em NY', hint: '🏙️ um arranha-céu inteiro',
    aliases: ['arranha-céu', 'um arranha céu', 'prédio em nova york', 'arranha céu em nova york', 'um prédio', 'torre em manhattan'],
    keys: ['arranha', 'manhattan', 'york', 'prédio', 'predio', 'torre'], msg: 'Seu nome agora está no topo de um arranha-céu em Nova York.' });
  add({ id: 'nba', country: 'US', city: 'nova_york', cat: 'trophy', tier: 'clube', price: 33 * BI, hours: 8,
    name: 'Um time da NBA', short: 'Time da NBA', hint: '🏀 um time da NBA',
    aliases: ['time da nba', 'time de basquete', 'franquia da nba', 'nba', 'knicks', 'lakers'],
    keys: ['nba', 'basquete', 'knicks', 'lakers'], msg: 'Você agora tem um time da NBA. E a camisa 1 é sua.' });
  add({ id: 'vegas', country: 'US', city: 'las_vegas', cat: 'casino', tier: 'empresa', price: 140 * BI, hours: 20,
    name: 'Metade dos cassinos de Las Vegas', short: 'Las Vegas', hint: '🎰 metade de Las Vegas',
    aliases: ['cassinos de las vegas', 'las vegas', 'cassinos', 'um cassino', 'a strip de las vegas', 'resorts de las vegas'],
    keys: ['vegas', 'cassino', 'casino', 'strip'], msg: 'Metade de Las Vegas é sua. A banca sempre ganha — e a banca é você.' });
  add({ id: 'obra_parque', country: 'US', city: 'orlando', cat: 'park', tier: 'obra',
    flex: { min: 10 * BI, max: 120 * BI, options: [10 * BI, 30 * BI, 60 * BI, 120 * BI], base: 5, k: 0.8 },
    name: 'Começar a obra de um parque temático gigante', short: 'Obra do parque', hint: '🎢 a obra de um parque temático',
    aliases: ['parque temático', 'parque de diversões', 'um parque', 'parque gigante', 'construir um parque', 'disneylândia'],
    keys: ['parque', 'diversões', 'diversoes', 'montanha'], msg: 'O maior parque do mundo vai abrir em 2031 — e a fila é só sua.' });
  add({ id: 'jatos_10', country: 'US', city: 'savannah', cat: 'jet', tier: 'gigante', price: 3.2 * BI, hours: 4,
    name: '10 jatos executivos novos', short: '10 jatos', hint: '🛩️ uma fábrica de jatos executivos',
    aliases: ['10 jatos', 'dez jatos', 'vários jatos', 'frota de jatos', 'jatos'],
    keys: ['jatos'], msg: 'Agora você tem um jato pra cada dia da semana — e sobram três.' });
  add({ id: 'todos_jatos', country: 'US', city: 'savannah', cat: 'jet', tier: 'remota', remote: true, price: 28 * BI, hours: 10,
    name: 'Todos os jatos executivos à venda no mundo', short: 'Todos os jatos', hint: '🛩️ todos os jatos à venda',
    aliases: ['todos os jatos', 'todos os jatos disponíveis', 'todos os aviões particulares', 'todos os jatinhos'],
    keys: ['jatos', 'todos'], msg: 'O mercado mundial de jatos acabou de esvaziar.' });
  add({ id: 'nike', country: 'US', city: 'portland', cat: 'company', tier: 'empresa', price: 520 * BI, hours: 30,
    name: 'O controle da Nike', short: 'Nike', hint: '👟 uma marca esportiva gigante',
    aliases: ['a nike', 'nike', 'marca de tênis', 'empresa de tênis'],
    keys: ['nike', 'tênis', 'tenis'], msg: 'Just do it. Você fez.' });
  add({ id: 'mcdonalds', country: 'US', city: 'chicago', cat: 'company', tier: 'empresa', price: 1.15 * TRI, hours: 40,
    name: "O McDonald's", short: "McDonald's", hint: '🍔 a maior rede de fast food',
    aliases: ["o mcdonald's", 'mcdonalds', 'mc donalds', 'o méqui', 'mequi', 'rede de fast food'],
    keys: ['mcdonalds', 'mcdonald', 'mequi', 'méqui', 'fast'], msg: "Batata frita grátis pra sempre." });

  /* ============================== BAHAMAS ============================== */
  add({ id: 'ilha', country: 'BS', city: 'nassau', cat: 'island', tier: 'imovel', price: 1.8 * BI, hours: 5,
    name: 'Uma ilha particular nas Bahamas', short: 'Ilha nas Bahamas', hint: '🏝️ uma ilha particular',
    aliases: ['uma ilha', 'ilha particular', 'ilha nas bahamas', 'ilha privada', 'minha própria ilha'],
    keys: ['ilha', 'bahamas', 'caribe'], msg: 'Você é oficialmente dono de uma ilha.' });
  add({ id: 'resort_bahamas', country: 'BS', city: 'nassau', cat: 'hotel', tier: 'imovel', price: 4 * BI, hours: 5,
    name: 'Um resort inteiro no Caribe', short: 'Resort no Caribe', hint: '🌺 um resort inteiro',
    aliases: ['um resort', 'resort', 'resort no caribe', 'resort nas bahamas', 'hotel no caribe'],
    keys: ['resort'], msg: 'Todos os quartos reservados. Pra você.' });

  /* ============================== REINO UNIDO ============================== */
  add({ id: 'premier', country: 'GB', city: 'londres', cat: 'trophy', tier: 'clube', price: 25 * BI, hours: 8,
    name: 'Um clube gigante da Premier League', short: 'Clube inglês', hint: '⚽ um gigante do futebol inglês',
    aliases: ['time de futebol', 'um time de futebol', 'um clube', 'clube de futebol', 'time da premier league', 'um time inglês', 'clube europeu'],
    keys: ['futebol', 'clube', 'time', 'premier', 'chelsea', 'manchester', 'arsenal', 'liverpool'], msg: 'Você agora é dono de um gigante do futebol europeu.' });
  add({ id: 'f1', country: 'GB', city: 'londres', cat: 'car', tier: 'clube', price: 22 * BI, hours: 8,
    name: 'Uma equipe de Fórmula 1', short: 'Equipe de F1', hint: '🏁 uma equipe de Fórmula 1',
    aliases: ['equipe de f1', 'time de fórmula 1', 'fórmula 1', 'f1', 'equipe de fórmula um'],
    keys: ['f1', 'fórmula', 'formula'], msg: 'Você tem uma equipe de F1. Só falta aprender a dirigir.' });
  add({ id: 'arte', country: 'GB', city: 'londres', cat: 'art', tier: 'lote', price: 4 * BI, hours: 4,
    name: 'Todas as obras de um leilão de arte', short: 'Leilão de arte', hint: '🖼️ um leilão de arte inteiro',
    aliases: ['obras de arte', 'quadros', 'pinturas', 'coleção de arte', 'arte', 'leilão'],
    keys: ['arte', 'quadro', 'pintura', 'leilão', 'leilao', 'picasso'], msg: 'Sua sala agora tem mais quadros que muito museu.' });
  add({ id: 'mansao_londres', country: 'GB', city: 'londres', cat: 'house', tier: 'imovel', price: 1 * BI, hours: 3,
    name: 'Um palacete no centro de Londres', short: 'Palacete em Londres', hint: '🏰 um palacete em Londres',
    aliases: ['mansão em londres', 'palacete', 'casa em londres', 'um palácio'],
    keys: ['palacete', 'londres'], msg: 'Chá das cinco servido no seu próprio palacete.' });

  /* ============================== FRANÇA ============================== */
  add({ id: 'hoteis', country: 'FR', city: 'paris', cat: 'hotel', tier: 'empresa', price: 60 * BI, hours: 12,
    name: 'Uma rede com 40 hotéis de luxo', short: '40 hotéis', hint: '🏨 uma rede de hotéis de luxo',
    aliases: ['rede de hotéis', 'hotéis', 'um hotel', 'todos os hotéis', 'hotel de luxo', 'rede hoteleira'],
    keys: ['hotel', 'hoteis', 'hotéis', 'hoteleira'], msg: 'Você tem 40 hotéis. Dá pra dormir num diferente por noite.' });
  add({ id: 'grife', country: 'FR', city: 'paris', cat: 'bag', tier: 'empresa', price: 90 * BI, hours: 18,
    name: 'Uma grife de luxo francesa', short: 'Grife francesa', hint: '👜 uma grife de moda de luxo',
    aliases: ['uma grife', 'grife de luxo', 'marca de luxo', 'marca de roupa', 'moda'],
    keys: ['grife', 'moda', 'bolsa', 'roupa', 'luxo'], msg: 'Toda bolsa cara do mundo agora rende dinheiro pra você.' });
  add({ id: 'avioes', country: 'FR', city: 'toulouse', cat: 'plane', tier: 'gigante', price: 110 * BI, hours: 12,
    name: 'Encomenda de 150 aviões comerciais', short: '150 aviões', hint: '✈️ uma fábrica de aviões',
    aliases: ['aviões', '150 aviões', 'aviões comerciais', 'frota de aviões', 'muitos aviões', 'todos os aviões', 'encomendar aviões'],
    keys: ['aviões', 'avioes', 'airbus', 'boeing'], msg: 'Um dos maiores pedidos de aviões da história.' });
  add({ id: 'castelo', country: 'FR', city: 'bordeaux', cat: 'castle', tier: 'imovel', price: 800 * MI, hours: 3,
    name: 'Um castelo com vinícola', short: 'Castelo na França', hint: '🏰 um castelo com vinícola',
    aliases: ['um castelo', 'castelo', 'castelo na frança', 'vinícola', 'um château'],
    keys: ['castelo', 'vinícola', 'vinicola', 'vinho'], msg: 'Você agora tem um castelo. E vinho pra vida toda.' });

  /* ============================== ITÁLIA ============================== */
  add({ id: 'ferrari', country: 'IT', city: 'maranello', cat: 'company', tier: 'empresa', price: 480 * BI, hours: 24,
    name: 'A Ferrari (empresa inteira)', short: 'Ferrari (empresa)', hint: '🏎️ uma montadora lendária',
    aliases: ['a ferrari', 'a ferrari inteira', 'empresa ferrari', 'a montadora ferrari', 'a marca ferrari', 'fábrica da ferrari'],
    keys: ['ferrari', 'montadora', 'fabricante'], msg: 'Você não comprou uma Ferrari. Você comprou A Ferrari.' });
  add({ id: 'megaiate', country: 'IT', city: 'genova', cat: 'yacht', tier: 'gigante', price: 3.5 * BI, hours: 6,
    name: 'Um megaiate de 140 metros', short: 'Megaiate', hint: '🛥️ estaleiros de megaiates',
    aliases: ['megaiate', 'iate gigante', 'um iate', 'iate', 'superiate', 'barco gigante', 'o maior iate'],
    keys: ['iate', 'megaiate', 'barco', 'lancha'], msg: 'O megaiate é seu. Ele tem um iate menor dentro.' });
  add({ id: 'serie_a', country: 'IT', city: 'milao', cat: 'trophy', tier: 'clube', price: 15 * BI, hours: 8,
    name: 'Um clube gigante da Série A', short: 'Clube italiano', hint: '⚽ um clube da Série A',
    aliases: ['time italiano', 'clube italiano', 'série a', 'milan', 'inter', 'juventus'],
    keys: ['italiano', 'milan', 'inter', 'juventus'], msg: 'Forza! O clube é seu.' });
  add({ id: 'como', country: 'IT', city: 'milao', cat: 'island', tier: 'imovel', price: 1.2 * BI, hours: 3,
    name: 'Uma ilha no Lago de Como', short: 'Ilha no Lago de Como', hint: '🏞️ uma ilha num lago famoso',
    aliases: ['lago de como', 'ilha no lago', 'casa no lago de como', 'villa italiana'],
    keys: ['como', 'lago', 'villa'], msg: 'Vizinho de astro de cinema. Ou melhor: eles que são seus vizinhos.' });

  /* ============================== SUÍÇA ============================== */
  add({ id: 'relojoaria', country: 'CH', city: 'genebra', cat: 'watch', tier: 'empresa', price: 40 * BI, hours: 12,
    name: 'Uma fábrica de relógios suíça', short: 'Relojoaria suíça', hint: '⌚ uma fábrica de relógios lendária',
    aliases: ['fábrica de relógios', 'relojoaria', 'marca de relógios', 'relojoaria suíça'],
    keys: ['relojoaria', 'suíça', 'suica'], msg: 'Agora o tempo literalmente é seu.' });
  add({ id: 'chocolate', country: 'CH', city: 'zurique', cat: 'company', tier: 'empresa', price: 25 * BI, hours: 10,
    name: 'A maior fábrica de chocolates da Suíça', short: 'Fábrica de chocolate', hint: '🍫 uma fábrica de chocolates',
    aliases: ['fábrica de chocolate', 'chocolate', 'chocolates', 'fábrica de chocolates'],
    keys: ['chocolate', 'chocolates'], msg: 'Willy Wonka quem?' });

  /* ============================== EMIRADOS ============================== */
  add({ id: 'dubai_apts', country: 'AE', city: 'dubai', cat: 'building', tier: 'imovel', price: 6 * BI, hours: 4,
    name: 'Todos os apartamentos de um arranha-céu em Dubai', short: 'Prédio em Dubai', hint: '🏢 um prédio inteiro de luxo',
    aliases: ['todos os apartamentos', 'todos os apartamentos disponíveis', 'apartamentos em dubai', 'um prédio em dubai', 'prédio inteiro'],
    keys: ['apartamentos', 'dubai'], msg: 'Você comprou um prédio inteiro em Dubai. Dá pra ver do avião.' });
  add({ id: 'dubai_carros', country: 'AE', city: 'dubai', cat: 'car', tier: 'lote', price: 2 * BI, hours: 2,
    name: 'Todos os hipercarros de uma loja em Dubai', short: 'Hipercarros em Dubai', hint: '🏎️ uma loja de hipercarros',
    aliases: ['hipercarros', 'carros em dubai', 'bugattis', 'todos os bugattis', 'carros de ouro'],
    keys: ['hipercarro', 'hipercarros', 'bugattis'], msg: 'Um deles é banhado a ouro. Claro.' });
  add({ id: 'obra_ilha', country: 'AE', city: 'dubai', cat: 'island', tier: 'obra',
    flex: { min: 20 * BI, max: 250 * BI, options: [20 * BI, 60 * BI, 120 * BI, 250 * BI], base: 6, k: 0.8 },
    name: 'Começar a obra de uma ilha artificial', short: 'Obra da ilha artificial', hint: '🏗️ a obra de uma ilha artificial',
    aliases: ['ilha artificial', 'construir uma ilha', 'criar uma ilha', 'ilha em dubai', 'construir uma ilha artificial'],
    keys: ['artificial'], msg: 'Uma ilha nova vai aparecer no mapa. Literalmente.' });

  /* ============================== ARÁBIA SAUDITA ============================== */
  add({ id: 'obra_cidade', country: 'SA', city: 'neom', cat: 'city', tier: 'obra',
    flex: { min: 50 * BI, max: 400 * BI, options: [50 * BI, 100 * BI, 200 * BI, 400 * BI], base: 8, k: 0.8 },
    name: 'Começar a obra de uma cidade inteira no deserto', short: 'Obra da cidade', hint: '🏗️ a obra de uma cidade inteira',
    aliases: ['construir uma cidade', 'uma cidade', 'cidade nova', 'fundar uma cidade', 'construir cidade', 'minha própria cidade', 'começar uma cidade'],
    keys: ['cidade', 'construir'], msg: 'Uma cidade inteira começa a nascer no deserto. Com o seu nome.' });
  add({ id: 'clube_saudita', country: 'SA', city: 'riad', cat: 'trophy', tier: 'clube', price: 20 * BI, hours: 8,
    name: 'Um clube saudita cheio de craques', short: 'Clube saudita', hint: '⚽ um clube cheio de craques',
    aliases: ['clube saudita', 'time saudita', 'al nassr', 'al hilal', 'time árabe'],
    keys: ['saudita', 'nassr', 'hilal', 'árabe', 'arabe'], msg: 'Você contratou meia seleção mundial.' });

  /* ============================== JAPÃO ============================== */
  add({ id: 'nintendo', country: 'JP', city: 'kyoto', cat: 'game', tier: 'empresa', price: 440 * BI, hours: 24,
    name: 'A Nintendo', short: 'Nintendo', hint: '🎮 uma empresa de videogame lendária',
    aliases: ['a nintendo', 'nintendo', 'empresa de videogame', 'o mario', 'pokemon'],
    keys: ['nintendo', 'mario', 'pokemon', 'pokémon', 'videogame'], msg: 'Você é o novo dono do Mario. Ele ainda não sabe.' });
  add({ id: 'trens_jp', country: 'JP', city: 'toquio', cat: 'train', tier: 'gigante', price: 30 * BI, hours: 8,
    name: 'Uma frota inteira de trens-bala', short: 'Frota de trens-bala', hint: '🚅 uma frota de trens-bala',
    aliases: ['trens bala', 'frota de trens', 'trens-bala', 'shinkansen', 'trens'],
    keys: ['trens', 'shinkansen'], msg: 'Pontualidade japonesa, agora sob nova direção.' });
  add({ id: 'predio_toquio', country: 'JP', city: 'toquio', cat: 'building', tier: 'imovel', price: 8 * BI, hours: 4,
    name: 'Um prédio inteiro em Shibuya', short: 'Prédio em Tóquio', hint: '🗼 um prédio em Tóquio',
    aliases: ['prédio em tóquio', 'prédio no japão', 'shibuya', 'prédio em shibuya'],
    keys: ['tóquio', 'toquio', 'shibuya'], msg: 'Seu prédio aparece em todo vídeo de Shibuya.' });

  /* ============================== CHINA / COREIA ============================== */
  add({ id: 'obra_distrito', country: 'CN', city: 'xangai', cat: 'building', tier: 'obra',
    flex: { min: 20 * BI, max: 300 * BI, options: [20 * BI, 80 * BI, 150 * BI, 300 * BI], base: 6, k: 0.8 },
    name: 'Começar a obra de um distrito com 50 arranha-céus', short: 'Obra dos arranha-céus', hint: '🏗️ a obra de 50 arranha-céus',
    aliases: ['dezenas de prédios', 'construir prédios', '50 arranha céus', 'vários prédios', 'construir arranha céus', 'distrito', 'construir dezenas de prédios'],
    keys: ['prédios', 'predios', 'distrito'], msg: 'Um skyline inteiro, encomendado de uma vez.' });
  add({ id: 'navios', country: 'KR', city: 'ulsan', cat: 'ship', tier: 'remota', remote: true, price: 55 * BI, hours: 10,
    name: 'Encomenda de 40 navios porta-contêineres', short: '40 navios', hint: '🚢 encomenda de navios gigantes',
    aliases: ['navios cargueiros', 'navios porta contêineres', 'frota de navios', 'muitos navios', 'navios'],
    keys: ['contêiner', 'conteiner', 'cargueiro', 'navios'], msg: 'Você tem 40 navios gigantes. Precisa de algo pra levar neles.' });
  add({ id: 'estaleiro', country: 'KR', city: 'ulsan', cat: 'ship', tier: 'empresa', price: 90 * BI, hours: 16,
    name: 'Um estaleiro inteiro na Coreia do Sul', short: 'Estaleiro coreano', hint: '⚓ um estaleiro gigante',
    aliases: ['estaleiro', 'um estaleiro', 'fábrica de navios'],
    keys: ['estaleiro'], msg: 'Agora quem faz os navios é você.' });
  add({ id: 'navio_cruzeiro', country: 'KR', city: 'ulsan', cat: 'ship', tier: 'gigante', price: 11 * BI, hours: 8,
    name: 'O maior navio de cruzeiro do mundo', short: 'Navio de cruzeiro', hint: '🛳️ o maior navio de cruzeiro',
    aliases: ['navio', 'navio de cruzeiro', 'um navio', 'cruzeiro', 'transatlântico', 'o maior navio'],
    keys: ['navio', 'cruzeiro'], msg: 'Um navio com 20 andares. Ainda não é o bastante.' });

  /* ============================== AUSTRÁLIA ============================== */
  add({ id: 'fazenda_au', country: 'AU', city: 'outback', cat: 'farm', tier: 'imovel', price: 12 * BI, hours: 6,
    name: 'Uma fazenda do tamanho da Bélgica', short: 'Fazenda australiana', hint: '🦘 uma fazenda do tamanho de um país',
    aliases: ['fazenda na austrália', 'fazenda australiana', 'fazenda do tamanho de um país', 'cangurus'],
    keys: ['austrália', 'australia', 'canguru', 'cangurus', 'outback'], msg: 'Você tem mais cangurus que funcionários.' });
  add({ id: 'ilha_au', country: 'AU', city: 'cairns', cat: 'island', tier: 'imovel', price: 3 * BI, hours: 4,
    name: 'Uma ilha na Grande Barreira de Corais', short: 'Ilha na Austrália', hint: '🪸 uma ilha num recife famoso',
    aliases: ['ilha na austrália', 'grande barreira', 'barreira de corais', 'ilha de corais'],
    keys: ['barreira', 'corais', 'recife'], msg: 'O mar mais bonito do mundo agora tem dono.' });

  /* ============================== IMPOSSÍVEIS ============================== */
  const blk = (o) => add(Object.assign({ cat: 'block' }, o));
  const PUB = 'Este bem não pode ser adquirido como propriedade privada.';
  blk({ id: 'x_planet', name: 'O planeta Terra', aliases: ['o planeta terra', 'o planeta', 'a terra', 'o mundo', 'o mundo inteiro', 'a lua', 'marte', 'o sol', 'o universo', 'tudo', 'tudo que existe'],
    keys: ['planeta', 'lua', 'marte', 'universo', 'mundo', 'sol', 'galáxia', 'tudo'], block: { type: 'venda', title: 'NÃO ESTÁ À VENDA.', msg: 'Nem com um trilhão. Ninguém tem a escritura disso.' } });
  blk({ id: 'x_br', country: 'BR', name: 'Patrimônio brasileiro', aliases: ['cristo redentor', 'o cristo', 'o maracanã', 'pão de açúcar', 'a amazônia', 'o palácio do planalto', 'a petrobras', 'os correios'],
    keys: ['cristo', 'maracanã', 'maracana', 'açúcar', 'amazônia', 'amazonia', 'planalto', 'petrobras', 'correios'], block: { type: 'publico', title: 'NÃO PODE SER COMPRADO.', msg: PUB } });
  blk({ id: 'x_us', country: 'US', name: 'Patrimônio americano', aliases: ['estátua da liberdade', 'a casa branca', 'o pentágono', 'a nasa', 'o grand canyon'],
    keys: ['estátua', 'estatua', 'branca', 'pentágono', 'pentagono', 'nasa', 'canyon'], block: { type: 'publico', title: 'NÃO PODE SER COMPRADO.', msg: PUB } });
  blk({ id: 'x_eu', name: 'Patrimônio europeu', aliases: ['torre eiffel', 'o louvre', 'a mona lisa', 'big ben', 'o coliseu', 'o vaticano', 'a coroa', 'palácio de buckingham', 'os alpes'],
    keys: ['eiffel', 'louvre', 'mona', 'ben', 'coliseu', 'vaticano', 'coroa', 'buckingham', 'alpes', 'papa'], block: { type: 'publico', title: 'NÃO PODE SER COMPRADO.', msg: PUB } });
  blk({ id: 'x_world', name: 'Patrimônio mundial', aliases: ['as pirâmides', 'a muralha da china', 'o burj khalifa', 'o monte fuji', 'o taj mahal', 'a ópera de sydney', 'o monte everest'],
    keys: ['pirâmide', 'piramide', 'pirâmides', 'muralha', 'burj', 'khalifa', 'fuji', 'taj', 'ópera', 'opera', 'everest'], block: { type: 'publico', title: 'NÃO PODE SER COMPRADO.', msg: PUB } });
  blk({ id: 'x_russia', name: 'Rússia', aliases: ['algo na rússia', 'comprar em moscou', 'empresa russa', 'o kremlin', 'gazprom'],
    keys: ['rússia', 'russia', 'moscou', 'kremlin', 'russa', 'russo', 'gazprom'], block: { type: 'invalido', title: 'SANÇÕES INTERNACIONAIS.', msg: 'Seu banco bloqueou a transferência. Nada de compras na Rússia.' } });
  blk({ id: 'x_transfer', name: 'Transferência de dinheiro', aliases: ['dar dinheiro', 'doar dinheiro', 'dar um trilhão', 'fazer um pix', 'transferir dinheiro', 'mandar dinheiro', 'dar para minha mãe', 'doar tudo', 'dar para alguém', 'distribuir dinheiro', 'dar para os inscritos'],
    keys: ['dar', 'doar', 'doação', 'doacao', 'pix', 'transferir', 'transferência', 'mandar', 'presentear', 'distribuir', 'caridade', 'emprestar'], block: { type: 'invalido', title: 'NÃO É UMA COMPRA VÁLIDA.', msg: 'Transferências diretas não contam como gasto válido.' } });
  blk({ id: 'x_finance', name: 'Investimento financeiro', aliases: ['bitcoin', 'criptomoedas', 'ações', 'comprar ações', 'títulos', 'tesouro direto', 'dólar', 'converter para dólar', 'ouro', 'barras de ouro', 'apostar', 'apostar tudo', 'loteria', 'bets', 'fundos de investimento', 'trocar de conta'],
    keys: ['bitcoin', 'cripto', 'criptomoeda', 'acoes', 'ações', 'título', 'titulo', 'tesouro', 'dólar', 'dolar', 'euro', 'ouro', 'apostar', 'aposta', 'loteria', 'bet', 'investimento', 'investir', 'bolsa', 'poupança'], block: { type: 'invalido', title: 'NÃO É UMA COMPRA VÁLIDA.', msg: 'Investimentos, moedas e apostas só estacionam o dinheiro. Ele precisa virar uma aquisição real.' } });
  blk({ id: 'x_shortcut', name: 'Atalho artificial', aliases: ['criar minha própria empresa', 'abrir uma empresa', 'criar uma empresa', 'comprar algo do meu amigo', 'comprar de um amigo', 'pagar 500 bilhões numa caneta', 'item de um real', 'superfaturar', 'pagar a mais'],
    keys: ['amigo', 'abrir', 'superfaturado', 'superfaturar', 'caneta', 'chiclete'], block: { type: 'invalido', title: 'NÃO É UMA COMPRA VÁLIDA.', msg: 'Compras com valor artificial ou dinheiro movido pra uma empresa sua não contam.' } });
  const BIG = 'Acima de R$ 600 bilhões, ou em setor estratégico, o governo precisa aprovar. Isso leva semanas.';
  blk({ id: 'x_disney', country: 'US', name: 'A Disney', aliases: ['a disney', 'disney', 'a marvel', 'o mickey'], keys: ['disney', 'marvel', 'mickey', 'pixar'],
    block: { type: 'tempo', title: 'GRANDE DEMAIS PRO SEU PRAZO.', msg: BIG, price: 1.1 * TRI, days: 42 } });
  blk({ id: 'x_apple', country: 'US', name: 'A Apple', aliases: ['a apple', 'apple', 'o iphone'], keys: ['apple', 'iphone'],
    block: { type: 'tempo', title: 'GRANDE DEMAIS PRO SEU PRAZO.', msg: BIG, price: 19 * TRI, days: 120 } });
  blk({ id: 'x_bigtech', country: 'US', name: 'Uma big tech', aliases: ['o google', 'a amazon', 'a microsoft', 'a nvidia', 'a tesla', 'o facebook', 'a meta', 'o youtube', 'o instagram', 'a netflix', 'o tiktok'],
    keys: ['google', 'amazon', 'microsoft', 'nvidia', 'tesla', 'facebook', 'meta', 'youtube', 'instagram', 'netflix', 'tiktok', 'whatsapp'],
    block: { type: 'tempo', title: 'GRANDE DEMAIS PRO SEU PRAZO.', msg: BIG, price: 9 * TRI, days: 90 } });
  blk({ id: 'x_cocacola', country: 'US', name: 'A Coca-Cola', aliases: ['a coca cola', 'coca-cola', 'a coca'], keys: ['coca', 'refrigerante'],
    block: { type: 'tempo', title: 'GRANDE DEMAIS PRO SEU PRAZO.', msg: BIG, price: 1.6 * TRI, days: 38 } });

  // dicas de bloqueios por país (aparecem no hover, riscadas)
  const BLOCK_HINTS = { BR: '🚫 Cristo e Maracanã (não vendem)', US: '🚫 Disney e big techs (grandes demais)', FR: '🚫 Torre Eiffel', IT: '🚫 Coliseu', RU: '🚫 sanções: nada à venda', EG: '🚫 Pirâmides', GB: '🚫 a Coroa' };

  window.GAMEDATA = {
    ACTIONS: A, TIERS, BLOCK_HINTS,
    START_BALANCE: 1e12,
    START_MINUTES: 7 * 24 * 60,
    START_CITY: 'rio',
    WIN_THRESHOLD: 100 * MI,
    BIG_LIMIT: 600 * BI
  };
})();
