# Arquitetura — Kurio Marketplace

Este documento registra as principais decisões técnicas da implementação do Kurio Marketplace, incluindo integração REST, sessão, carrinho, cache, tempo real, mocks, recuperação de falhas e limitações conhecidas.

O objetivo é deixar explícito como os fluxos do desafio foram estruturados e quais responsabilidades pertencem a cada camada.

---

## 1. Visão geral

A aplicação foi construída como uma SPA em React + TypeScript utilizando Vite.

A arquitetura é organizada principalmente por domínio/feature:

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

Responsabilidades principais:

- `app/`: providers e infraestrutura global;
- `components/`: componentes compartilhados;
- `features/`: regras e componentes organizados por domínio;
- `mocks/`: banco simulado, handlers MSW, cenários e integração realtime do ambiente mock;
- `routes/`: páginas e composição de rotas;
- `services/`: serviços compartilhados, incluindo Socket.IO;
- `tests/e2e/`: testes funcionais e cenários Playwright;
- `vite/`: integração do servidor Socket.IO com o servidor HTTP do Vite.

A interface não conhece diretamente os dados internos dos mocks. Os componentes consomem APIs e serviços normalmente, enquanto o MSW intercepta as requisições na camada de rede.

---

## 2. Stack e responsabilidades

### React

Responsável pela composição da interface e estado local de apresentação.

### TypeScript

Utilizado para tipagem dos contratos entre transporte, estado e interface.

### TanStack Router

Responsável por:

- rotas;
- parâmetros de busca;
- navegação;
- preservação do estado do catálogo pela URL;
- acesso direto às telas previstas.

### TanStack Query

Responsável por:

- consultas assíncronas;
- cache remoto;
- mutations;
- invalidação;
- refetch;
- sincronização após alterações;
- recuperação após eventos realtime.

### Axios

Cliente HTTP utilizado pelas chamadas REST da aplicação.

### MSW

Responsável pela simulação da camada de API no navegador.

Os handlers representam o backend simulado e concentram regras de resposta, falhas, latência e cenários de teste.

### Socket.IO

Responsável pelos eventos em tempo real:

- `nft.updated`;
- `order.updated`.

### Playwright

Responsável pelos testes E2E em Chromium desktop e mobile, incluindo cenários funcionais, falhas e recuperação.

---

## 3. Fluxo de dados

O fluxo principal de dados segue esta direção:

```text
UI
↓
Hooks / TanStack Query
↓
Cliente Axios
↓
REST
↓
MSW
↓
Banco simulado / cenários
```

Para atualizações realtime:

```text
Mock backend
↓
socket.io-client publisher
↓
Servidor Socket.IO
↓
socket.io-client da aplicação
↓
RealtimeProvider
↓
TanStack Query / estado da interface
```

O Socket.IO não substitui a API REST como fonte de reconciliação.

Após reconnect ou recuperação de conexão, os recursos relevantes são novamente consultados pela API para garantir consistência.

---

## 4. Contratos REST

Os contratos REST são tipados no projeto e implementados pelos handlers MSW.

As rotas concretas ficam centralizadas nos handlers em:

```text
src/mocks/handlers/
```

Os clientes e contratos de cada domínio ficam próximos às respectivas features.

### Sessão e conta

Operações cobertas:

- cadastro;
- login;
- consulta/restauração da sessão;
- logout;
- expiração de sessão.

Comportamentos relevantes:

- normalização de e-mail;
- validação de credenciais;
- persistência local da simulação;
- limpeza de dados privados ao trocar de usuário;
- tratamento de sessão expirada;
- senha armazenada como hash com `bcryptjs`.

### NFTs

Operações cobertas:

- listagem;
- busca;
- filtros;
- ordenação;
- paginação;
- detalhe por identificador.

Parâmetros do catálogo são refletidos na URL e enviados à API simulada.

A listagem também suporta estados de:

- loading;
- vazio;
- erro;
- sucesso;
- nova tentativa.

### Favoritos

Operações cobertas:

- consulta;
- inclusão;
- remoção.

A interface utiliza atualização otimista e rollback quando a mutation falha.

### Carrinho

O estado do carrinho é mantido no cliente e persistido localmente para sustentar refresh e transição visitante → usuário autenticado.

Operações disponíveis:

- adicionar item;
- alterar quantidade;
- remover item;
- preservar itens após autenticação;
- aplicar/remover cupom;
- recalcular resumo.

O resumo considera:

- subtotal;
- desconto;
- taxa de rede;
- total.

Alterações realtime de preço e disponibilidade são refletidas no carrinho aberto.

> Observação: a aderência final do carrinho ao requisito de contrato REST dedicado será revisada na auditoria final da entrega.

### Cotação

A cotação da API simulada é a referência para a finalização do pedido.

Ela valida:

- itens;
- preço;
- disponibilidade;
- cupom;
- descontos;
- taxas;
- total.

Uma cotação desatualizada não pode ser confirmada.

Mudanças detectadas durante o checkout exigem revalidação antes da compra.

### Pedidos

Operações cobertas:

- criação;
- consulta;
- recuperação;
- recibo.

Estados principais:

```text
pending
confirmed
refused
```

Pedidos confirmados ou recusados são terminais.

A criação utiliza chave de idempotência para evitar duplicação em:

- clique repetido;
- reenvio;
- timeout;
- resposta HTTP ambígua.

Quando uma tentativa já criou um pedido e a resposta expira, a repetição com a mesma chave recupera o mesmo pedido.

### Perfil

Operações cobertas:

- consulta;
- atualização de dados;
- avatar;
- alteração de senha.

As alterações confirmadas permanecem após refresh dentro da simulação local.

### Carteiras

Operações cobertas:

- consulta;
- cadastro;
- edição;
- definição dos dados usados no checkout.

---

## 5. Política de sessão

A autenticação é totalmente simulada.

A sessão precisa sobreviver a refresh e pode expirar durante a navegação ou checkout.

Princípios adotados:

- dados privados pertencem ao usuário autenticado;
- troca de usuário não reutiliza dados privados da sessão anterior;
- logout limpa o estado privado relevante;
- eventos realtime de outro usuário não devem atualizar a sessão atual;
- listeners são associados ao ciclo de vida da sessão.

Ao autenticar, o cliente também associa a conexão Socket.IO à sala:

```text
user:<userId>
```

Isso permite direcionar `order.updated` apenas ao usuário correto.

---

## 6. Armazenamento de usuários

Os usuários criados no ambiente mock são persistidos localmente.

As senhas não permanecem armazenadas em texto puro.

O mock utiliza `bcryptjs` para gerar e comparar hashes.

Também existe compatibilidade com registros antigos: caso um usuário legado ainda possua senha em texto puro, ele é migrado para o formato com hash.

---

## 7. Estado do carrinho

O carrinho possui comportamento persistente para suportar:

- refresh;
- visitante não autenticado;
- autenticação posterior;
- merge dos itens do visitante com a sessão autenticada.

O carrinho respeita disponibilidade e limites de quantidade.

Durante eventos realtime, alterações de preço ou disponibilidade são aplicadas ao estado exibido.

No checkout, o carrinho não é suficiente para confirmar uma compra: a cotação precisa ser válida e atual.

Em falhas de pagamento, os itens são preservados.

Após uma confirmação efetiva, somente os itens e quantidades comprados são removidos.

---

## 8. Precisão de valores

Valores monetários em ETH são tratados como strings decimais na camada de transporte.

Os cálculos utilizam `decimal.js` para evitar erros comuns de ponto flutuante.

Quantidades são inteiras.

A cotação da API simulada é considerada a referência do valor final do pedido.

---

## 9. Estratégia de cache

O cache remoto é gerenciado pelo TanStack Query.

Configuração global relevante:

```ts
queries: {
  retry: 1,
  refetchOnWindowFocus: false,
}
```

### Retry

Consultas possuem uma tentativa automática adicional em caso de falha.

Esse comportamento é utilizado, por exemplo, no cenário de indisponibilidade temporária do catálogo.

### Refetch ao focar a janela

Está desativado para evitar alterações não determinísticas durante os testes e durante fluxos sensíveis.

### Invalidação

O cache é invalidado após mutations e eventos que podem tornar os dados atuais obsoletos.

Exemplos:

- alteração de pedido;
- reconnect;
- mudança de recurso via Socket.IO;
- mutations de dados da conta.

### Atualização otimista

Favoritos utilizam atualização otimista.

Em falha da mutation:

1. o estado anterior é restaurado;
2. a interface apresenta feedback de erro;
3. o recurso não permanece incorretamente alterado.

---

## 10. Respostas obsoletas e versionamento

Recursos realtime possuem controle de versão.

Eventos com versão igual ou inferior à versão conhecida são ignorados.

Isso evita:

- reaplicar eventos duplicados;
- regredir para estado antigo;
- sobrescrever dados mais recentes.

O mesmo princípio é aplicado a pedidos.

Pedidos em estado terminal não podem ser alterados por um evento posterior incompatível.

---

## 11. Socket.IO

O cliente realtime utiliza:

```ts
io(window.location.origin, {
  path: '/socket.io/',
  transports: ['websocket'],
})
```

O mesmo origin é utilizado pela aplicação e pelo servidor realtime.

O servidor é integrado ao Vite por meio de:

```text
vite/socket-io-plugin.ts
```

O plugin atende:

- desenvolvimento (`configureServer`);
- preview do build (`configurePreviewServer`).

---

## 12. Eventos realtime

### `nft.updated`

Responsabilidade:

- atualizar preço;
- atualizar disponibilidade;
- propagar a versão mais recente do NFT.

Esse evento pode afetar:

- catálogo;
- detalhe;
- carrinho;
- checkout.

Payload conceitual:

```ts
type NftUpdatedEvent = {
  nft: {
    id: string
    version: number
    // demais dados atualizados
  }
}
```

### `order.updated`

Responsabilidade:

- atualizar o estado do pedido;
- informar confirmação ou recusa;
- permitir recuperação de um pedido pendente.

Payload conceitual:

```ts
type OrderUpdatedEvent = {
  order: {
    id: string
    userId: string
    version: number
    status: 'pending' | 'confirmed' | 'refused'
    // snapshot do pedido
  }
}
```

O servidor direciona eventos de pedido para:

```text
user:<userId>
```

---

## 13. Transporte realtime no ambiente mock

O backend simulado utiliza um segundo cliente `socket.io-client` como publisher.

Ele publica eventos internos:

```text
__mock.nft.updated
__mock.order.updated
```

O servidor Socket.IO recebe esses eventos e os transforma nos eventos públicos consumidos pela aplicação:

```text
nft.updated
order.updated
```

Dessa forma, os cenários realtime atravessam o protocolo Socket.IO e não chamam setters, callbacks ou cache diretamente.

---

## 14. Reconciliação REST + Socket.IO

Eventos realtime melhoram a atualização imediata da interface, mas não são tratados como única fonte de verdade.

Depois de uma reconexão, o cliente invalida/refaz consultas relevantes para reconciliar o estado com a API REST.

Esse comportamento é especialmente importante para pedidos pendentes.

Fluxo esperado:

```text
pedido pending
↓
conexão interrompida
↓
estado muda no backend mock
↓
cliente reconecta
↓
queries relevantes são invalidadas
↓
REST retorna o estado atual
↓
mesmo pedido é recuperado
```

Nenhuma nova compra é criada durante essa recuperação.

---

## 15. Idempotência

A criação de pedido possui uma chave de idempotência associada à tentativa.

Enquanto o resultado da tentativa for ambíguo, a chave é preservada.

Exemplo de timeout:

```text
POST /orders
↓
backend mock cria o pedido
↓
pedido fica pending
↓
resposta HTTP é atrasada
↓
Axios atinge timeout
↓
UI informa falha
↓
usuário tenta novamente
↓
mesma chave de idempotência
↓
mesmo pedido é retornado
```

A chave só pode representar o mesmo conteúdo de compra.

A reutilização incompatível deve ser tratada como conflito.

---

## 16. Recibo

O recibo representa um snapshot do pedido confirmado.

Depois da confirmação, alterações posteriores no catálogo não devem alterar:

- itens;
- quantidades;
- preços;
- taxas;
- total;
- referências simuladas da transação.

---

## 17. Cenários MSW

O estado ativo dos cenários é controlado no ambiente mock.

Cenários atuais:

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

Os cenários são reutilizados entre desenvolvimento e testes.

O reset retorna o ambiente ao cenário conhecido `default`.

---

## 18. Loading e recuperação de erro

Componentes dependentes de dados possuem estados explícitos.

Catálogo, detalhe e resumo do carrinho utilizam skeletons com shimmer.

Os skeletons:

- preservam espaço visual;
- possuem feedback acessível;
- respeitam `prefers-reduced-motion`.

O catálogo possui cenário determinístico de carregamento lento e cenário de erro temporário.

A recuperação após falha ocorre por nova tentativa explícita.

---

## 19. Acessibilidade

Decisões implementadas:

- navegação por teclado;
- foco visível;
- focus trap em diálogo;
- restauração do elemento anteriormente focado;
- fechamento por Escape;
- Tab e Shift+Tab;
- labels associados aos campos;
- `aria-invalid`;
- `aria-describedby`;
- mensagens de erro acessíveis;
- feedback por regiões `alert`/`status` quando apropriado;
- `aria-busy` nos estados de carregamento;
- reduced motion nos skeletons.

O fluxo de autenticação recebeu tratamento específico de foco para manter comportamento consistente em desktop e mobile.

---

## 20. Responsividade

A interface foi construída para suportar desktop e mobile conforme os frames do desafio.

Os fluxos principais possuem cobertura Playwright em:

- Chromium desktop;
- Chromium mobile.

A revisão final também considera a largura intermediária de 768 px exigida pelo enunciado.

---

## 21. Testes

Os testes E2E ficam em:

```text
tests/e2e/
```

A cobertura funcional inclui:

1. catálogo e histórico;
2. detalhe e NFT inexistente;
3. autenticação e sessão;
4. favoritos e rollback;
5. carrinho e persistência;
6. compra confirmada;
7. falha, clique repetido e timeout;
8. perfil e carteiras;
9. mudanças realtime durante checkout;
10. eventos antigos/duplicados e reconexão;
11. teclado, foco e formulários;
12. loading lento, erro e retry.

Os testes REST passam pelos handlers MSW.

Os testes realtime utilizam o cliente Socket.IO.

---

## 22. Regressão visual

A regressão visual prevista na entrega cobre:

- início;
- detalhe do NFT;
- carrinho;
- pagamento.

As baselines precisam ser mantidas no repositório e executadas com dados determinísticos.

Esta etapa será consolidada na validação final.

---

## 23. Lighthouse

As auditorias finais serão executadas sobre build otimizado para:

- início desktop;
- início mobile;
- detalhe desktop;
- detalhe mobile.

Cada combinação será executada três vezes.

A entrega registrará:

- mediana de Performance;
- mediana de Accessibility;
- mediana de Best Practices;
- mediana de SEO;
- LCP;
- CLS;
- TBT.

Os relatórios HTML/JSON serão versionados junto da configuração da auditoria.

---

## 24. Decisões de UX

### Cotação desatualizada

Quando preço ou disponibilidade muda durante o checkout, a aplicação não atualiza silenciosamente a cotação e não confirma automaticamente.

O usuário recebe a indicação da mudança e precisa revalidar a cotação.

Essa escolha evita confirmar uma compra em condições diferentes das revisadas pelo usuário.

### Falha ambígua de pagamento

Em timeout, o checkout não assume que a compra falhou definitivamente.

A tentativa mantém a chave de idempotência para permitir recuperação segura.

### Feedback de realtime

Mudanças recebidas em tempo real atualizam a interface sem depender apenas de cor para indicar estado.

### Recuperação de sessão

Quando possível, o contexto anterior é preservado para permitir continuidade após autenticação ou recuperação.

---

## 25. Desvios e adaptações em relação ao Figma

O Figma é utilizado como referência de identidade visual e composição.

Alguns estados funcionais não possuem frame específico e foram desenhados seguindo a mesma linguagem visual da interface, incluindo:

- loading;
- erro;
- retry;
- sessão expirada;
- cotação desatualizada;
- pagamento recusado;
- pedido pendente;
- feedback realtime;
- validações.

Também foram adicionados comportamentos de acessibilidade que podem não estar visualmente representados no arquivo original, como:

- foco visível;
- mensagens auxiliares;
- regiões acessíveis;
- controle de foco;
- reduced motion.

Essas adaptações priorizam os requisitos funcionais e de acessibilidade do desafio sem alterar intencionalmente a identidade principal das telas.

---

## 26. Limitações conhecidas

### Backend

Não existe backend de produção.

Toda a camada de dados utilizada no desafio é simulada no navegador com MSW e persistência local.

### Persistência

A persistência é local ao navegador.

Não existe sincronização real entre dispositivos ou navegadores diferentes.

### Blockchain e carteiras

Não há blockchain real, extensão de carteira ou transação financeira real.

Conexões, redes, hashes e referências de exploração são simulados.

### Socket.IO

O servidor realtime é integrado ao servidor HTTP do Vite.

O ambiente de publicação precisa permitir um processo Node/WebSocket compatível para manter os fluxos realtime da mesma forma que no desenvolvimento e preview.

### Regressão visual e Lighthouse

Os artefatos finais de regressão visual e as medições Lighthouse são consolidados na etapa final da entrega.

### Carrinho

A aderência final do carrinho ao contrato REST mínimo solicitado no enunciado ainda será revisada antes da submissão final.

---

## 27. Execução

Instalação:

```bash
npm install
```

Desenvolvimento:

```bash
npm run dev
```

Verificação de tipos:

```bash
npx tsc -b
```

Lint:

```bash
npm run lint
```

Build:

```bash
npm run build
```

Preview:

```bash
npm run preview
```

Playwright:

```bash
npx playwright test
```

Relatório Playwright:

```bash
npx playwright show-report
```

---
