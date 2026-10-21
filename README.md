# Aondê — Museus de Curitiba

Aplicativo web para **descobrir, salvar, visitar e avaliar museus de Curitiba**. A pessoa explora os museus num mapa, vê recomendações, salva os que quer conhecer e avalia os que visitou. A equipe gerencia o conteúdo num painel administrativo (`/admin`).

O projeto nasceu no Figma Make e foi convertido para rodar de forma independente: localmente com SQLite e em produção na Vercel com Postgres.

---

## Sumário

- [Tecnologias](#tecnologias)
- [Como rodar localmente](#como-rodar-localmente)
- [Scripts](#scripts)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Telas do app](#telas-do-app)
- [Painel administrativo (/admin)](#painel-administrativo-admin)
- [Coleções (dados)](#coleções-dados)
- [Como os dados chegam às telas](#como-os-dados-chegam-às-telas)
- [Mapa](#mapa)
- [Banco de dados e migrations](#banco-de-dados-e-migrations)
- [Deploy na Vercel](#deploy-na-vercel)
- [Pendências e limitações conhecidas](#pendências-e-limitações-conhecidas)

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) + React 19 |
| CMS, banco e login | [Payload 4](https://payloadcms.com) (**versão beta 4.0.0-beta.3**) |
| Banco local | SQLite (arquivo `aonde.db`) |
| Banco em produção | Postgres (Neon, pela integração da Vercel) |
| Arquivos em produção | Vercel Blob |
| Estilo | Tailwind CSS v4 |
| Animações | Motion |
| Ícones | Lucide |
| Mapa | Leaflet + react-leaflet, com mapa de fundo do OpenStreetMap |

---

## Como rodar localmente

**Requisitos:** Node.js 24 e pnpm 10.

```bash
# 1. Instalar o pnpm (se ainda não tiver)
npm install -g pnpm@10

# 2. Instalar as dependências
pnpm install

# 3. Criar o arquivo de variáveis de ambiente
cp .env.example .env
#    e trocar PAYLOAD_SECRET por um texto aleatório e longo

# 4. Subir o servidor de desenvolvimento
pnpm dev
```

Abra **http://localhost:3000**.

**Primeira vez:**

1. Acesse **http://localhost:3000/admin** e crie o primeiro usuário administrador.
2. Rode `pnpm seed` para cadastrar os 67 museus da lista da equipe, com fotos de cada um (e os créditos que as licenças pedem).

> O banco local é criado automaticamente no arquivo `aonde.db`, e as imagens enviadas ficam na pasta `media/`. Para recomeçar do zero: pare o servidor, apague `aonde.db` e `media/` e rode `pnpm seed`.

---

## Scripts

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento em `http://localhost:3000` |
| `pnpm build` | Build de produção (gera o import map do admin, os tipos e o `next build`) |
| `pnpm start` | Roda o build de produção |
| `pnpm seed` | Cadastra os museus de `src/seed-museums.ts`. Pode rodar várias vezes: não duplica e só completa coordenadas que estiverem vazias |
| `pnpm migrate:create <nome>` | Cria uma migration do Postgres (veja [Banco de dados e migrations](#banco-de-dados-e-migrations)) |
| `pnpm vercel-build` | Usado pela Vercel: roda as migrations e depois o build |
| `pnpm generate:types` | Regenera `src/payload-types.ts` a partir das coleções |
| `pnpm generate:importmap` | Regenera o import map do painel admin (raramente necessário) |
| `pnpm payload <comando>` | Acesso direto à CLI do Payload |

Os scripts usam `cross-env` para funcionar também no Windows.

---

## Variáveis de ambiente

Veja [.env.example](.env.example). O arquivo `.env` **não vai para o Git**.

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PAYLOAD_SECRET` | Sim | Texto aleatório e longo usado para assinar os logins. Use um valor **diferente** em produção. |
| `DATABASE_URL` | Não | `file:./aonde.db` (padrão) usa SQLite. Um endereço `postgres://…` usa Postgres. |
| `BLOB_READ_WRITE_TOKEN` | Só em produção | Chave do Vercel Blob. Sem ela, os uploads ficam na pasta `media/`. |
| `NEXT_PUBLIC_SITE_URL` | Não | Domínio público, usado nas prévias de link. Na Vercel, o padrão é o domínio de produção. |

> **Atenção:** variáveis que começam com `NEXT_PUBLIC_` ficam visíveis no navegador. Nunca coloque senhas ou chaves secretas nelas.

---

## Estrutura de pastas

```
├── public/aonde/            Imagens estáticas (logo, mapa antigo, fotos do MON)
├── src/
│   ├── app/
│   │   ├── (frontend)/      Páginas do app (layout, telas, estilos globais)
│   │   └── (payload)/       Painel admin e API do Payload (gerado; não editar)
│   ├── collections/         Definição das coleções do Payload (Museums, Reviews…)
│   ├── components/aonde/    Componentes do app
│   │   ├── AondeApp.tsx       Todas as telas do app (navegação por URL)
│   │   ├── MapExplorer.tsx    Mapa real + lista de museus abaixo dele
│   │   ├── WelcomeIntro.tsx   Tela de boas-vindas animada
│   │   └── Typography.tsx     Componentes de texto (títulos, legendas…)
│   ├── lib/
│   │   ├── aonde.ts           Busca os museus para as páginas (servidor)
│   │   ├── aonde-actions.ts   Server Actions: login, cadastro, favoritos, avaliações, estatísticas
│   │   ├── accessibility.ts   Lista de recursos de acessibilidade (admin + app)
│   │   └── revalidate.ts      Atualiza as páginas quando o conteúdo muda
│   ├── migrations/          Migrations do Postgres (usadas no deploy)
│   ├── seed.ts              Cadastra os museus no banco (pnpm seed)
│   ├── seed-museums.ts      Dados dos 67 museus (endereço, horário, fotos, créditos)
│   ├── seed-photos/         Fotos usadas pelo seed e a capa padrão sem-foto.jpg
│   └── payload.config.ts    Configuração do Payload (banco, coleções, uploads)
├── .env.example             Modelo das variáveis de ambiente
└── next.config.ts           Configuração do Next.js
```

> `AGENTS.md`, `CLAUDE.md` e a pasta `.figma/` são da época do Figma Make e descrevem aquele ambiente. Não valem mais para este projeto.

---

## Telas do app

Cada tela tem a sua URL. Telas de um museu específico usam `?museu=<slug>`, então dá para recarregar ou compartilhar o link.

| URL | Tela |
|---|---|
| `/` ou `/welcome` | Boas-vindas, com animação da coruja |
| `/home` | Início: atalhos (Arte, História, Matriz, Mais opções) logo abaixo da pergunta, abas **Recomendação do app**, **Recomendação dos usuários** e **Mais visitados** e carrossel |
| `/map` | Explorar no modo **Mapa**: museus no mapa, lista abaixo do mapa e "Perto de mim" |
| `/results` | Explorar no modo **Todos os museus**: grade de fotos com os mesmos filtros (tipo, regional, acessível) |
| `/search` | Busca por nome e por regional |
| `/details?museu=…` | Detalhes do museu: ações rápidas, informações, acessibilidade, localização |
| `/reviews?museu=…` | Avaliações do museu |
| `/rate?museu=…` | Avaliar o museu (4 critérios de 1 a 5) |
| `/profile` | Perfil e progresso cultural (regionais visitadas e totais de visitados, "quero ir" e avaliações, que abrem a lista correspondente) |
| `/saved` | Lista "Desejo ir" |
| `/signup`, `/login` | Criar conta e entrar |
| `/accessibility` | Preferências: tamanho do texto, tema claro/escuro, texto alternativo |
| `/verify`, `/reset` | Código de verificação e nova senha (**ainda não funcionais**, veja as pendências) |

**Comportamentos de interface que valem saber:**

- **Cabeçalho:** logo à esquerda, como na tela de boas-vindas, e o botão de menu à direita (perfil, "Desejo ir", acessibilidade, ajuda e entrar/sair). No Início, Mapa e Todos os museus, ele some ao rolar para baixo e volta ao rolar para cima.
- **Início:** as abas grudam no topo ao rolar, como no Pinterest.
- **Explorar:** o seletor **Mapa / Todos os museus** troca o modo de ver sem perder a busca e os filtros.
- **Detalhes:** as fotos ocupam a largura toda e passam com o dedo, como no carrossel do Instagram; o nome do museu fica parado por cima. No celular não há setas (os pontinhos abaixo mostram a posição); no computador aparecem setas.
- **Visitantes:** dá para explorar sem conta. Salvar, avaliar e editar o perfil pedem cadastro.
- **Preferências** de tamanho de texto, tema e texto alternativo ficam salvas no navegador.

---

## Painel administrativo (/admin)

Em `/admin` a equipe gerencia o conteúdo. O painel está em português, mas os nomes dos campos aparecem em inglês.

**Tarefas comuns:**

- **Cadastrar um museu:** *Museums → Criar novo*. A capa (*Cover*) é obrigatória. Para o pino aparecer no mapa, preencha *Latitude* e *Longitude*: no Google Maps, clique com o botão direito no local e copie as coordenadas.
- **Destacar na tela inicial:** marque **"Recomendado pelo Aondê"** na lateral do museu. Ele passa a aparecer na aba "Recomendação do app". Se nenhum estiver marcado, a aba mostra todos.
- **Acessibilidade:** em *Accessibility Features*, marque **apenas recursos confirmados** com o museu.
- **Moderar avaliações:** em *Reviews*, mude o *Status* de `pending` para `approved`. Só avaliações aprovadas contam para a nota e para a aba "Recomendação dos usuários".

**Duas contas diferentes:**

- **Admins:** quem entra no `/admin`. O primeiro é criado em `/admin/create-first-user`; depois, só admins criam outros admins.
- **Users:** quem cria conta no app. Essa coleção fica escondida do menu do admin, e uma conta não dá acesso à outra.

---

## Coleções (dados)

| Coleção | Para que serve | Quem acessa |
|---|---|---|
| `museums` | Museus: nome, slug, tipo, regional, descrição, capa, galeria, horário, entrada, endereço, site, Instagram, coordenadas, acessibilidade, recomendado | Leitura pública; edição só admins |
| `media` | Fotos enviadas | Leitura pública; edição só admins |
| `reviews` | Avaliações (4 notas de 1 a 5, comentário, status de moderação) | Público vê só aprovadas; o autor vê as suas; admins moderam |
| `users` | Contas do app | Cada pessoa vê e edita só a própria conta |
| `favorites` | Museus salvos em "Desejo ir" | Só o dono |
| `visits` | Visitas registradas (criadas ao avaliar) | Só o dono |
| `admins` | Contas do painel | Só admins |
| `posts`, `folders`, `tags` | Sobras do modelo do Figma, não usadas pelo app | Só admins |

**Tipos e regras:**

- **IDs:** são texto (UUID), tanto no SQLite quanto no Postgres. O app depende disso.
- **Tipos TypeScript:** ficam em `src/payload-types.ts`, gerados automaticamente. Não edite à mão.
- **Lista de acessibilidade:** as opções ficam em [src/lib/accessibility.ts](src/lib/accessibility.ts). Ali dá para adicionar opções novas, mas isso muda o banco: veja [migrations](#banco-de-dados-e-migrations).

---

## Como os dados chegam às telas

1. **Museus:** são lidos no servidor ([src/lib/aonde.ts](src/lib/aonde.ts)) e entram nas páginas, que são **estáticas** (geradas no build).
2. **Atualização das páginas:** quando um museu ou uma foto é salvo ou apagado no `/admin`, os hooks das coleções chamam `revalidateSite()` ([src/lib/revalidate.ts](src/lib/revalidate.ts)), e as páginas são regeneradas na próxima visita. **Não é preciso fazer novo deploy** para o conteúdo aparecer.
3. **Notas e visitas:** mudam o tempo todo, então são buscadas **na hora**, pelo navegador, com a Server Action `getMuseumStats()`. Ela devolve só os totais por museu, sem expor dados individuais.
4. **Sessão e ações do usuário** (login, cadastro, favoritos, avaliações, apelido) são Server Actions em [src/lib/aonde-actions.ts](src/lib/aonde-actions.ts). A sessão fica num cookie `httpOnly`.

---

## Mapa

O mapa ([src/components/aonde/MapExplorer.tsx](src/components/aonde/MapExplorer.tsx)) usa **Leaflet**:

- **Mapa de fundo:** vem do **OpenStreetMap** e não precisa de chave de API. Um filtro em `styles.css` deixa as cores no tom do app, e no tema escuro o mapa fica escuro.
- **Pinos:** usam a latitude e a longitude cadastradas no museu. Museus sem coordenadas aparecem na lista com "Localização não cadastrada". Com o mapa afastado, os pinos viram pontos menores para o Centro não virar um bolo. Museus no mesmo prédio (como o MAC-PR dentro do MON) têm os pinos afastados alguns metros só no desenho, para dar para tocar em cada um com zoom.
- **Lista:** fica num bloco abaixo do mapa. Tocar num pino mostra o cartão do museu logo abaixo do mapa; tocar num museu da lista volta ao mapa e centraliza o pino.
- **"Perto de mim":** usa a localização do navegador, que pede permissão, e ordena os museus por distância.
- **"Como chegar":** abre a rota no Google Maps por um link. Não usa API.

> O OpenStreetMap libera os mapas para uso leve. Se o app tiver muito acesso, troque o `url` do `TileLayer` por um provedor com plano próprio, como MapTiler ou Stadia Maps (com chave em `NEXT_PUBLIC_…`, restrita ao domínio).

---

## Banco de dados e migrations

| Ambiente | Banco | Como o esquema é criado |
|---|---|---|
| Local (`DATABASE_URL=file:./aonde.db`) | SQLite | Automaticamente, ao rodar `pnpm dev` |
| Produção (`DATABASE_URL=postgres://…`) | Postgres (Neon) | Pelas **migrations** em `src/migrations/`, que rodam no deploy (`pnpm vercel-build`) |

### Ao mudar uma coleção (adicionar campo, trocar tipo…)

1. **Edite a coleção** em `src/collections/`.
2. **Aplique no SQLite local:** basta acessar o app com `pnpm dev` rodando. Se o terminal perguntar `…created or renamed from another table?`, leia com atenção. Para campo ou tabela **novos**, escolha *create*. Escolher *rename* errado pode misturar dados.
3. **Gere a migration do Postgres** para o deploy. Ela **não precisa** de um banco Postgres rodando:

   ```bash
   # Linux/macOS/Git Bash
   DATABASE_URL="postgres://x:x@localhost:5432/x" pnpm migrate:create nome-da-mudanca

   # PowerShell
   $env:DATABASE_URL="postgres://x:x@localhost:5432/x"; pnpm migrate:create nome-da-mudanca
   ```

4. **Revise o arquivo gerado** em `src/migrations/` e envie junto com o código.

> **Nunca apague nem edite** migrations que já rodaram em produção. Para corrigir algo, crie uma migration nova.

---

## Deploy na Vercel

O código já está preparado. Para o primeiro deploy:

1. **Envie o código para o GitHub.** O `.env`, o `aonde.db` e a pasta `media/` ficam de fora pelo `.gitignore`.
2. **Na Vercel, crie um projeto** importando o repositório. O framework é detectado como Next.js, e o build usa automaticamente o script `vercel-build`, que roda as migrations e depois o build.
3. **Na aba *Storage* do projeto:**
   - crie um banco **Neon (Postgres)** e conecte ao projeto. Isso cria a `DATABASE_URL`;
   - crie um **Blob** e conecte ao projeto. Isso cria o `BLOB_READ_WRITE_TOKEN`.
4. **Em *Settings → Environment Variables***, adicione `PAYLOAD_SECRET` com um valor novo, longo e aleatório.
5. **Faça o deploy.**
6. **Crie o primeiro admin** em `https://<seu-dominio>/admin`.
7. **Opcional:** para enviar os museus de exemplo ao banco de produção, rode `pnpm seed` localmente com `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` e `PAYLOAD_SECRET` de produção (por exemplo, com `vercel env pull`).

---

## Pendências e limitações conhecidas

- **Origem das fotos:** quase todas são do Wikimedia Commons, com licença livre e crédito exibido no app. Algumas mostram o prédio onde o museu funciona (por exemplo, o Colégio Estadual ou a Santa Casa). As fotos do Museu do Saneamento e do Espaço Energia são de divulgação (Sanepar e Copel, publicadas pela Agência Estadual de Notícias), com crédito. As do MON vieram do modelo do Figma, sem autor ou licença conhecidos.
- **Museus sem foto:** 22 museus não têm foto livre e usam a capa padrão (`sem-foto.jpg`). Para trocar, envie uma foto no `/admin` (*Museums → museu → Cover*) com o crédito. Fotos tiradas pela equipe ou cedidas pelo museu são o caminho mais seguro; imagens achadas no Google costumam ter direitos autorais.
- **Dados dos museus:** vêm da planilha da equipe (*Comunicação museus – Dados Museus*), com correções conferidas na web (endereços trocados, horários novos). Ficaram de fora: Casa João Turin, Museu do Futebol do Paraná, Museu do Som Independente e Museu do Cartaz (fechados; o acervo do Cartaz está na Casa da Memória); Museu da Lava-Jato (só virtual); Museu da Papiloscopia, Umbigo Casa de Cultura e Sala do Artista Popular (sem endereço ou funcionamento confirmados). As 3 linhas do Museu/Memorial Ucraniano viraram um só museu, e o Acervo Histórico do Sistema Penitenciário virou o Museu Penitenciário. Horários e preços mudam; confira antes de divulgar. Acessibilidade só está marcada no MON (rampas), a única informação com fonte; preencha o resto com dados confirmados, por exemplo com o Guia de Acessibilidade da Prefeitura de Curitiba.
- **"Aberto agora":** o selo na tela do museu ainda não lê o horário cadastrado; ele considera todos abertos de terça a domingo, das 10h às 18h. Para ficar certo, os horários precisariam de um formato estruturado (dias e horas), não só texto.
- **E-mail:** não há serviço de e-mail configurado. Recuperação de senha e código de verificação (`/reset`, `/verify`) ainda não funcionam; as telas avisam isso.
- **Fotos da avaliação e foto de perfil:** ficam só no navegador da pessoa (pré-visualização e `localStorage`) e não são enviadas ao servidor.
- **Payload beta:** o projeto usa o **Payload 4.0.0-beta.3**, herdado do Figma Make. Pode haver bugs e mudanças até a versão estável.
- **Mapa:** o OpenStreetMap tem limite de uso. Veja a seção [Mapa](#mapa).
- **Tipos no build:** `next.config.ts` está com `typescript.ignoreBuildErrors: true`. Rode `npx tsc --noEmit` para conferir os tipos.
