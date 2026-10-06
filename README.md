# Gaste 1 Trilhão em 7 Dias

Jogo de navegador feito para gravar vídeo. Página estática: funciona no GitHub Pages ou abrindo o `index.html` direto.

## Arquivos
- `index.html`: o jogo (palco de 1920×1080, se ajusta a qualquer janela)
- `admin.html`: painel ADM em outra janela (dá pra abrir também com Ctrl+Shift+A ou `index.html?admin`)
- `data.js`: **catálogo de compras** (preço, tempo, cidade, dicas). Edite aqui.
- `map-data.js`: países e cidades gerados a partir do `mapa_mundi_em_branco.png` (não editar)

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

## Rota de referência (testada: 21 compras, termina com 4h sobrando)
Rio: cobertura, concessionária, relógios, uma Ferrari, jato, helicópteros →
Miami: concessionária, mansões → Bahamas: ilha → Nova York: arranha-céu, time da NBA →
Londres: clube da Premier League, leilão de arte, palacete → Paris: rede de hotéis → Bordeaux: castelo →
Maranello: **A Ferrari** → Gênova: megaiate → Dubai: prédio, hipercarros →
NEOM: **obra da cidade** com "Usar o saldo restante".
