# Relatório de validação do checkout do Mercado Pago

Durante a validação manual do fluxo de compra do projeto **Diagnóstico Espiritual**, o checkout do Mercado Pago abriu corretamente, aceitou o preenchimento completo do cartão de teste e permitiu avançar até a revisão do pagamento. No entanto, ao confirmar a compra, a transação foi **recusada pelo Mercado Pago** e o retorno da aplicação ocorreu para a rota `/result` com `status=rejected` e `payment_id=153802332637`, o que indica que o aplicativo tratou a resposta de falha conforme as `back_urls` configuradas.[1] [2]

| Item verificado | Resultado observado | Evidência |
|---|---|---|
| Abertura do checkout | Funcionou | O checkout carregou a página de pagamento do Mercado Pago |
| Preenchimento do cartão de teste | Funcionou | Cartão `5031 4332 1540 6351`, nome `APRO`, validade `11/30`, CVV `123`, CPF `12345678909` foram aceitos pelo formulário.[3] |
| Confirmação do pagamento | Falhou | O Mercado Pago retornou página de recusa com a operação `#153802332637` |
| Retorno para a aplicação | Funcionou | A aplicação voltou para `/result` com `status=rejected`, sem erro de navegação |
| Estado do projeto | Saudável | Servidor rodando, sem erros de LSP e sem erros de TypeScript |

A documentação oficial do Mercado Pago informa que, para simular **pagamento aprovado**, não basta apenas usar o cartão de teste e o titular `APRO`; o fluxo também deve ser executado com um **usuário de teste comprador previamente criado** e em **janela anônima**, para evitar conflito de credenciais.[3] Como a tentativa feita terminou em recusa mesmo com os dados do titular de aprovação, o desvio mais provável está entre o contexto da sessão de teste e os dados enviados pelo app ao criar a preferência.

> “Acesse Mercado Pago Developers e faça login como o usuário de teste comprador criado previamente.”[3]

> “Realize as compras de teste em uma janela anônima do seu navegador para evitar erros por duplicidade de credenciais no processo.”[3]

Além disso, a implementação atual do projeto contém dois pontos que podem prejudicar a consistência do teste. No frontend, o checkout está sendo iniciado com o e-mail fixo `user@example.com` em vez do e-mail real do lead.[2] No servidor, a preferência do Mercado Pago é criada com a identificação do pagador fixada como CPF `00000000000`.[1] Esses dados não impediram a abertura do checkout, mas tornam o teste menos fiel ao cenário exigido pela documentação e podem interferir na avaliação de risco ou no pareamento do pagamento com o lead correto.

| Ponto técnico no código | Observação | Impacto provável |
|---|---|---|
| `client/src/pages/Result.tsx` envia `email: "user@example.com"` | O checkout não usa o e-mail real do usuário | Dificulta rastreamento e reduz fidelidade do teste.[2] |
| `server/_core/mercadopago.ts` envia `payer.identification.number: "00000000000"` | A preferência nasce com CPF genérico | Pode gerar inconsistência com o comprador de teste e com os dados finais do pagador.[1] |
| `back_urls.failure` e `pending` apontam para `/result` | O app retorna para a página de resultado quando a compra falha | Comportamento atual está coerente com a configuração.[1] |

Em síntese, **não encontrei evidência de erro de roteamento da aplicação neste teste específico**. O que houve foi uma **recusa do provedor de pagamento**, seguida por um retorno correto do app para a página de resultado. O fluxo pós-falha, portanto, está funcional. O ponto pendente é tornar o cenário de teste mais aderente às exigências do Mercado Pago e reduzir dados artificiais no payload de criação da preferência.[1] [2] [3]

Como próximos passos, a recomendação é ajustar o checkout para usar o e-mail real do lead, substituir o CPF fixo por um valor coerente com o comprador de teste ou não forçar esse campo na criação inicial da preferência, e repetir a compra em aba anônima autenticada com uma conta de teste comprador do Mercado Pago. Se você quiser, eu posso seguir agora com a **correção do payload do checkout** para deixar o teste de aprovação mais confiável.

## Referências

[1]: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-test/test-purchases "Mercado Pago Developers — Realizar compras de teste"
[2]: file:///home/ubuntu/diagnostico-espiritual/client/src/pages/Result.tsx "Arquivo do projeto: client/src/pages/Result.tsx"
[3]: file:///home/ubuntu/diagnostico-espiritual/server/_core/mercadopago.ts "Arquivo do projeto: server/_core/mercadopago.ts"
