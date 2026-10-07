# Gaste 1 Trilhão em 7 Dias — versão 2

Jogo de navegador feito para gravar vídeo. Página estática: funciona no GitHub Pages ou abrindo o `index.html` direto.

## Arquivos
- `index.html`: o jogo (palco de 1920×1080, se ajusta a qualquer janela)
- `admin.html`: painel ADM em outra janela (dá pra abrir também com Ctrl+Shift+A ou `index.html?admin`)
- `data.js`: **catálogo de compras** (preço, tempo, cidade, dicas). Edite aqui.
- `map-data.js`: países e cidades gerados a partir do `mapa_mundi_em_branco.png` (não editar)
- `art.js`: ilustrações de cada tipo de compra (desenhadas em SVG)
- `cube.js`: o trilhão em 3D (cubo de notas de R$ 100) + bonequinho em escala real

## Regras
- Partida no Rio de Janeiro, com R$ 1 trilhão e 7 dias.
- O tempo só anda quando uma compra é confirmada. Ele é o tempo de **fechar o negócio** mais a **viagem**.
- Quase tudo exige ir até o lugar (a Ferrari exige Maranello, na Itália).
- Cada compra só pode ser feita **uma vez**.
- Obras são "começar a obra", pagas 100% adiantado.
- Acima de R$ 600 bi, ou em setor estratégico (Disney, big techs), a compra é impossível porque o governo precisa aprovar.

## Durante a gravação
- Depois de COMPRAR, a sequência roda como slides: viagem → negociação → "VOCÊ GASTOU". Ela para até você **clicar ou apertar espaço/Enter** (ou usar ▸ AVANÇAR no ADM). Dá pra trocar pra automático no ADM.
- Mapa: roda do mouse dá zoom, arrastar move, duplo clique num país aproxima, ↺ volta. O hover mostra a viagem e as dicas do país.
- O canto inferior esquerdo fica livre pra câmera.

## Novidades da versão 2
- **O trilhão em 3D**: R$ 1 trilhão em notas de R$ 100 é um cubo de ~22 m, montado com 1.000 blocos de R$ 1 bilhão. O bonequinho ao lado tem 1,75 m, em escala real (a lupa mostra ele ampliado).
- **Momento da compra**: a parte gasta do cubo fica **vermelha**, sobe e some, e o cubo se reorganiza. Compras abaixo de R$ 1 bi abrem o zoom em 1 bloco.
- **Bonequinho reage**: aponta pro cubo, pula em compras acima de R$ 50 bi, dá de ombros nas pequenas, olha o relógio na reta final, sua no último dia, comemora na vitória e fica cabisbaixo na derrota.
- **Cubo no HUD**: aparece por ~12 s depois de cada compra e some sozinho, deixando só o número. Clicar no painel do dinheiro abre/fecha.
- **Ilustração** de cada compra na confirmação e no momento da compra.
- **Comparações** só em 7 compras grandes (arranha-céu, NBA, Premier League, Ferrari, etc).
- **Marcos**: faixa de 1%, 5%, 10%, 25%, 50%, 75% e 90% do trilhão.
- **Reta final** discreta: leve brilho vermelho nas bordas no último dia.
- **Final**: replay da viagem inteira em ~10 s (clique pra pular) e recibo com todas as compras.
- Salva separado da versão 1 (as duas podem ficar abertas sem misturar).

## Rota de referência (testada: 21 compras, termina com 4h sobrando)
Rio: cobertura, concessionária, relógios, uma Ferrari, jato, helicópteros →
Miami: concessionária, mansões → Bahamas: ilha → Nova York: arranha-céu, time da NBA →
Londres: clube da Premier League, leilão de arte, palacete → Paris: rede de hotéis → Bordeaux: castelo →
Maranello: **A Ferrari** → Gênova: megaiate → Dubai: prédio, hipercarros →
NEOM: **obra da cidade** com "Usar o saldo restante".

## Roteiro do vídeo (alinhado com os marcos)
| # | Digite | Onde | Preço | O que acontece |
|---|---|---|---|---|
| 1 | comprar uma cobertura em ipanema | Rio | R$ 60 mi | zoom em 1 bloco: mal arranha o cubo |
| 2 | comprar uma concessionária | Rio | R$ 80 mi | |
| 3 | comprar relógios de luxo | Rio | R$ 45 mi | |
| 4 | comprar uma ferrari | Rio | R$ 5 mi | a menor compra do jogo |
| 5 | comprar um jatinho | Rio | R$ 420 mi | |
| 6 | comprar helicópteros | Rio | R$ 250 mi | ainda nem 0,1% gasto |
| 7 | comprar uma concessionária em miami | Miami | R$ 450 mi | primeira viagem; o primeiro bloco inteiro some |
| 8 | comprar mansões em miami | Miami | R$ 1,6 bi | |
| 9 | comprar uma ilha nas bahamas | Bahamas | R$ 1,8 bi | |
| 10 | comprar um arranha-céu em nova york | NY | R$ 12 bi | comparação + **MARCO 1%** |
| 11 | comprar um time da nba | NY | R$ 35 bi | comparação + **MARCO 5%** |
| 12 | comprar um clube da premier league | Londres | R$ 25 bi | comparação |
| 13 | comprar arte em leilão | Londres | R$ 4 bi | |
| 14 | comprar uma mansão em londres | Londres | R$ 1 bi | |
| 15 | comprar uma rede de hotéis em paris | Paris | R$ 60 bi | **MARCO 10%** |
| 16 | comprar um castelo na frança | Bordeaux | R$ 800 mi | |
| 17 | comprar a ferrari | Maranello | R$ 480 bi | o cubo perde metade + **MARCO METADE** |
| 18 | comprar um megaiate | Gênova | R$ 3,5 bi | |
| 19 | comprar um prédio em dubai | Dubai | R$ 6 bi | começa a reta final do tempo |
| 20 | comprar hipercarros em dubai | Dubai | R$ 2 bi | |
| 21 | construir uma cidade no deserto → **Usar o saldo restante** | NEOM | ~R$ 366 bi | cubo zera, replay, recibo, vitória com 4h sobrando |
