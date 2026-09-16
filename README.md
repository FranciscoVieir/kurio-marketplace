# Kurio Marketplace

Marketplace de NFTs desenvolvido em React e TypeScript como solução para o desafio Frontend da Jungle.

A aplicação cobre os principais fluxos de descoberta, autenticação, favoritos, carrinho, checkout, conta do colecionador, mocking de APIs e atualizações em tempo real.

O projeto utiliza dados simulados e pode ser executado localmente sem backend de produção, integração real com blockchain, extensão de carteira ou gateway de pagamento.

## Repositório

https://github.com/FranciscoVieir/kurio-marketplace

## Deploy

https://kurio-marketplace-a47t.vercel.app/

---

## Stack

- React 19
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Axios
- REST APIs
- Socket.IO
- Tailwind CSS
- shadcn/ui
- MSW
- Playwright
- Decimal.js
- bcryptjs
- Oxlint

---

## Funcionalidades

### Catálogo

- busca por NFTs;
- filtros combináveis;
- ordenação;
- paginação;
- estado refletido nos parâmetros da URL;
- restauração após refresh e navegação pelo histórico;
- tratamento de loading, vazio e erro;
- recuperação após falha;
- skeletons com shimmer.

### Detalhes do NFT

- acesso direto pela URL;
- tratamento de NFT inexistente;
- seleção de quantidade;
- controle de disponibilidade;
- favoritos;
- compra;
- atualização de preço e disponibilidade em tempo real;
- skeleton durante carregamento.

### Autenticação

- cadastro;
- login;
- logout;
- persistência de sessão;
- expiração de sessão;
- troca de usuário;
- limpeza de dados privados da sessão anterior;
- retorno ao fluxo anterior após autenticação.

As senhas utilizadas pelos mocks são armazenadas localmente como hash com `bcryptjs`, e não em texto puro.

### Favoritos

- persistência por usuário;
- atualização otimista;
- rollback em caso de falha da mutation;
- feedback acessível.

### Carrinho

- inclusão de NFTs;
- alteração de quantidade;
- remoção;
- persistência após refresh;
- preservação dos itens do visitante após autenticação;
- aplicação de cupom;
- subtotal;
- desconto;
- taxa de rede;
- total;
- atualização de preço e disponibilidade enquanto o carrinho está aberto;
- skeleton no resumo durante hidratação do estado.

### Checkout

- dados do colecionador;
- seleção de carteira;
- seleção de rede;
- cotação;
- revalidação de preço e disponibilidade;
- proteção contra confirmação com cotação desatualizada;
- criação idempotente de pedidos;
- proteção contra clique repetido;
- recuperação após timeout;
- pagamento confirmado;
- pagamento recusado;
- pedido pendente;
- recuperação após refresh ou reconexão.

### Perfil e carteiras

- edição dos dados do perfil;
- avatar;
- alteração de senha;
- cadastro e edição de carteiras;
- validações de formulário;
- tratamento de erros retornados pela API simulada;
- persistência após refresh.

### Tempo real

A aplicação utiliza `socket.io-client` no frontend e um servidor Socket.IO integrado ao ambiente Vite.

Eventos implementados:

- `nft.updated`
- `order.updated`

A implementação cobre:

- atualização de preço;
- atualização de disponibilidade;
- atualização do estado do pedido;
- identidade e versionamento dos eventos;
- descarte de eventos antigos;
- descarte de eventos duplicados;
- isolamento dos eventos por sessão de usuário;
- reconexão;
- reconciliação com a API REST;
- recuperação de pedido pendente;
- proteção contra regressão de estados terminais.

---

## Requisitos

Recomendado:

- Node.js 20 ou superior
- npm

---

## Instalação

Clone o repositório:

```bash
git clone https://github.com/FranciscoVieir/kurio-marketplace.git
cd kurio-marketplace
```

Instale as dependências:

```bash
npm install
```

---

## Variáveis de ambiente

A aplicação não depende de variáveis de ambiente personalizadas para execução local.

O projeto utiliza informações fornecidas pelo próprio Vite, como:

```ts
import.meta.env.MODE
```

Não é necessário criar um arquivo `.env` para executar a aplicação atualmente.

---

## Desenvolvimento

Execute:

```bash
npm run dev
```

Durante o desenvolvimento:

- o MSW intercepta as APIs REST no navegador;
- o servidor Socket.IO é iniciado junto ao servidor Vite;
- nenhum backend externo é necessário.

---

## Build

```bash
npm run build
```

O comando executa a verificação TypeScript por meio de `tsc -b` e gera o build otimizado da aplicação.

---

## Preview do build

```bash
npm run preview
```

O ambiente de preview mantém:

- aplicação compilada;
- mocks MSW;
- APIs simuladas;
- autenticação;
- Socket.IO;
- fluxos em tempo real.

O Socket.IO utiliza o mesmo origin da aplicação e o path:

```text
/socket.io/
```

---

## Verificação de tipos

A verificação TypeScript pode ser executada diretamente com:

```bash
npx tsc -b
```

Ela também faz parte do comando:

```bash
npm run build
```

---

## Lint

```bash
npm run lint
```

O projeto utiliza Oxlint.

---

## Mocking com MSW

As APIs são simuladas com MSW.

Os mocks ficam na camada de rede. Componentes, hooks e cliente Axios continuam consumindo as APIs normalmente, sem respostas fictícias embutidas diretamente na interface.

A camada mock cobre os recursos usados pela aplicação, incluindo:

- autenticação e sessão;
- NFTs;
- favoritos;
- cotação;
- pedidos;
- perfil;
- carteiras;
- cenários de falha;
- atualizações em tempo real.

O Service Worker do MSW fica em:

```text
public/mockServiceWorker.js
```

---

## Cenários de mock

Os cenários determinísticos disponíveis atualmente são:

```text
default
quote-expired
insufficient-stock
nft-price-changed
nft-version-changed
session-expired
favorite-mutation-error
payment-refused
payment-timeout
catalog-slow
catalog-error
```

O cenário padrão é:

```text
default
```

O cenário ativo é controlado pelo ambiente mock e utilizado pelos testes E2E para reproduzir falhas de forma determinística.

---

## Seleção manual de cenário

A rota de controle de cenários é interceptada pelo MSW no navegador.

Para ativar um cenário manualmente durante a execução da aplicação, abra o DevTools do navegador e execute:

```js
await fetch('/api/__mock/scenario', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    scenario: 'payment-refused',
  }),
})
```

Depois execute o fluxo que deseja validar.

Para trocar o cenário, envie novamente a requisição com outro valor.

---

## Reset dos cenários

Para retornar ao cenário padrão, execute no console do navegador:

```js
await fetch('/api/__mock/scenario', {
  method: 'DELETE',
})
```

O reset retorna o ambiente para:

```text
default
```

Nos testes Playwright, seleção e reset são encapsulados pelo helper:

```text
tests/e2e/helpers/mock-scenario.ts
```

---

## Principais cenários de falha

### Sessão expirada

```text
session-expired
```

Simula a invalidação da sessão durante a utilização da aplicação.

### Falha em favoritos

```text
favorite-mutation-error
```

Simula uma falha durante a mutation de favorito e permite validar o rollback do estado otimista.

### Pagamento recusado

```text
payment-refused
```

Mantém o pedido no fluxo esperado e finaliza a operação como recusada.

### Timeout de pagamento

```text
payment-timeout
```

O mock cria o pedido, mas atrasa a resposta HTTP além do timeout do cliente.

Ao repetir a operação com a mesma chave de idempotência, a tentativa recupera o mesmo pedido em vez de criar uma segunda compra.

### Preço alterado

```text
nft-price-changed
```

Simula alteração de preço durante o fluxo de compra.

A cotação anterior deixa de ser válida e precisa ser revalidada antes da confirmação.

### Versão alterada

```text
nft-version-changed
```

Permite exercitar o controle de versões de eventos e recursos.

### Estoque insuficiente

```text
insufficient-stock
```

Simula conflito de disponibilidade durante a compra.

### Cotação expirada

```text
quote-expired
```

Simula uma cotação que não pode mais ser utilizada para finalizar a compra.

### Catálogo lento

```text
catalog-slow
```

Adiciona latência ao carregamento do catálogo para validar skeletons e o estado de carregamento.

### Falha temporária do catálogo

```text
catalog-error
```

As primeiras requisições retornam erro HTTP temporário.

Após o feedback de falha, uma nova tentativa permite recuperar o catálogo.

---

## Credenciais fictícias

Não existe usuário pré-cadastrado no estado inicial dos mocks.

Para testar os fluxos autenticados, crie uma conta pela própria interface de cadastro.

Exemplo de dados fictícios:

```text
Usuário: avaliador
E-mail: avaliador@kurio.local
Senha: Kurio123!
```

Os valores acima são apenas um exemplo de preenchimento. Eles não representam uma conta previamente existente.

Após o cadastro, os dados necessários para sustentar a simulação ficam persistidos localmente no navegador.

---

## Socket.IO

O cliente utiliza o mesmo origin da aplicação:

```ts
io(window.location.origin, {
  path: '/socket.io/',
  transports: ['websocket'],
})
```

O servidor Socket.IO é acoplado ao servidor HTTP do Vite tanto em desenvolvimento quanto no preview do build.

### `nft.updated`

Atualiza dados do NFT, incluindo preço, disponibilidade e versão.

Pode afetar:

- catálogo;
- detalhe;
- carrinho;
- checkout.

### `order.updated`

Atualiza o estado de um pedido.

Os eventos de pedido são direcionados à sala correspondente ao usuário autenticado.

---

## Reconciliação REST e Socket.IO

Socket.IO é utilizado para comunicação em tempo real, enquanto a API REST permanece responsável pela reconciliação do estado após eventos como:

- reconexão;
- refresh;
- interrupção enquanto um pedido está pendente.

Eventos com versão igual ou inferior à versão já conhecida são descartados.

Pedidos em estado terminal não podem regredir para estados anteriores.

---

## Idempotência de pedidos

A criação de pedidos utiliza chave de idempotência.

Esse mecanismo protege contra:

- clique repetido;
- reenvio;
- timeout após criação do pedido;
- respostas HTTP ambíguas;
- criação duplicada durante recuperação.

A mesma tentativa reutilizando a mesma chave recupera o mesmo pedido.

---

## Testes E2E

Os testes são executados com Playwright.

Para executar toda a suíte:

```bash
npx playwright test
```

Para executar um arquivo específico:

```bash
npx playwright test tests/e2e/catalog-filters.spec.ts
```

Exemplo:

```bash
npx playwright test tests/e2e/loading-recovery.spec.ts
```

A suíte cobre os grupos funcionais exigidos pelo desafio:

1. busca, filtros combinados, ordenação, paginação e restauração pelo histórico;
2. acesso direto ao detalhe e NFT inexistente;
3. cadastro, login, expiração de sessão, logout e troca de usuário;
4. favoritos com falha de mutation e recuperação;
5. carrinho, quantidades, remoção, cupom e persistência;
6. compra completa até o recibo confirmado;
7. falha de pagamento, clique repetido e timeout;
8. perfil, avatar, senha e carteiras;
9. alteração de preço e disponibilidade via Socket.IO durante o checkout;
10. eventos duplicados ou antigos, desconexão e recuperação de pedido pendente;
11. navegação por teclado, foco de diálogos e validação de formulários;
12. skeletons durante carregamento lento, feedback de falha e recuperação por nova tentativa.

Os principais fluxos são executados em Chromium nos projetos desktop e mobile definidos pelo Playwright.

---

## Relatório Playwright

Após uma execução da suíte, o relatório HTML pode ser aberto com:

```bash
npx playwright show-report
```

Screenshots, vídeos e traces de falha são gerados de acordo com a configuração do Playwright do projeto.

---

## Regressão visual

A regressão visual da entrega cobre as telas exigidas pelo desafio:

- início;
- detalhe do NFT;
- carrinho;
- pagamento.

As baselines devem utilizar dados determinísticos dos mocks e permanecer versionadas no repositório.

### Status

A configuração e as baselines finais de regressão visual serão consolidadas na etapa final de validação da entrega.

---

## Lighthouse

A auditoria final será executada sobre build otimizado, utilizando o cenário padrão dos mocks.

Páginas e perfis previstos:

- início — desktop;
- início — mobile;
- detalhe do NFT — desktop;
- detalhe do NFT — mobile.

Cada combinação será medida três vezes, utilizando a mediana dos resultados.

Metas do desafio:

| Categoria | Meta |
| --- | ---: |
| Performance | >= 90 |
| Accessibility | >= 95 |
| Best Practices | >= 95 |
| SEO | >= 90 |

Também serão registrados:

- LCP;
- CLS;
- TBT.

### Status

Os relatórios HTML/JSON, configuração da auditoria e medianas serão adicionados na etapa final de validação.

---

## Acessibilidade

Entre os comportamentos implementados estão:

- navegação por teclado;
- foco visível;
- controle de foco em diálogos;
- restauração de foco;
- navegação com Tab e Shift+Tab;
- fechamento de diálogo por Escape;
- labels semânticos;
- associação entre campos e mensagens de erro;
- `aria-invalid`;
- `aria-describedby`;
- feedback com regiões acessíveis;
- skeletons com `aria-busy`;
- respeito a `prefers-reduced-motion`.

---

## Persistência

Como o projeto não utiliza backend real, parte do estado da simulação é persistida localmente no navegador.

Essa persistência sustenta comportamentos como:

- sessão após refresh;
- usuários cadastrados;
- carrinho;
- pedidos;
- recuperação de operações;
- estado dos mocks.

---

## Estrutura do projeto

```text
src/
├── app/
├── components/
├── features/
├── mocks/
├── routes/
└── services/

tests/
└── e2e/

vite/
└── socket-io-plugin.ts
```

A aplicação é organizada principalmente por domínio e feature.

---

## Arquitetura

As decisões técnicas, contratos, políticas de sessão, cache, carrinho, realtime, limitações e desvios de implementação são documentados em:

```text
ARCHITECTURE.md
```

---

## Execução a partir de um checkout limpo

```bash
git clone https://github.com/FranciscoVieir/kurio-marketplace.git
cd kurio-marketplace
npm install
npm run build
npm run preview
```

Nenhum backend privado ou serviço de produção é necessário para executar a versão local da aplicação.

---
