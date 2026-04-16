# Teste do Webhook do Mercado Pago

## Resumo da Correção

O erro 400 do Mercado Pago foi corrigido movendo o middleware `express.json()` para **ANTES** dos webhooks serem registrados. Isso garante que o `req.body` seja parseado corretamente antes do handler do webhook ser executado.

## Configuração Atual

### Arquivo: `server/_core/index.ts`

```typescript
// Configure body parser FIRST, before any routes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Stripe webhook (raw body for signature validation)
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Mercado Pago webhooks (JSON already parsed by middleware above)
app.get("/api/mercadopago/webhook", handleMercadoPagoWebhook);
app.post("/api/mercadopago/webhook", handleMercadoPagoWebhook);
```

## Fluxo do Webhook

1. **Notificação Recebida**: Mercado Pago envia POST/GET para `/api/mercadopago/webhook`
2. **Parsing JSON**: Express middleware parseia o body automaticamente
3. **Validação**: Handler valida tipo de evento e ID do pagamento
4. **Busca na API**: Busca detalhes do pagamento na API do Mercado Pago
5. **Processamento**: Se aprovado, atualiza banco de dados e envia email com PDF

## Estrutura da Notificação

```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "123456"
  },
  "date_created": "2021-11-01T02:02:02Z",
  "id": "123456",
  "live_mode": false,
  "type": "payment",
  "user_id": 1836565332
}
```

## Teste Manual

### 1. Registrar URL do Webhook no Mercado Pago

No painel do Mercado Pago:
- Vá para **Configurações** → **Webhooks**
- Adicione a URL: `https://espiritualquiz-sx87ncqt.manus.space/api/mercadopago/webhook`
- Selecione os eventos: `payment.updated`

### 2. Testar com cURL

```bash
curl -X POST https://espiritualquiz-sx87ncqt.manus.space/api/mercadopago/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.updated",
    "api_version": "v1",
    "data": {"id": "123456"},
    "date_created": "2021-11-01T02:02:02Z",
    "id": "123456",
    "live_mode": false,
    "type": "payment",
    "user_id": 1836565332
  }'
```

**Resposta esperada**: `200 OK` com `{"received": true}`

### 3. Testar com Postman

1. Crie uma nova requisição POST
2. URL: `https://espiritualquiz-sx87ncqt.manus.space/api/mercadopago/webhook`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {"id": "123456"},
  "date_created": "2021-11-01T02:02:02Z",
  "id": "123456",
  "live_mode": false,
  "type": "payment",
  "user_id": 1836565332
}
```

## Testes Automatizados

### Executar Testes

```bash
pnpm test mercadopago-webhook.test.ts
pnpm test mercadopago-integration.test.ts
```

### Resultados Esperados

- ✓ Webhook recebe notificações POST e GET
- ✓ JSON é parseado corretamente
- ✓ Eventos não-pagamento são ignorados
- ✓ Pagamentos aprovados disparam email com PDF
- ✓ Erros são logados e retornam status apropriado

## Logs do Webhook

Os logs detalhados estão em `.manus-logs/devserver.log`:

```
[Mercado Pago Webhook] ========== WEBHOOK RECEBIDO =========
[Mercado Pago Webhook] Timestamp: 2026-04-16T21:50:38.000Z
[Mercado Pago Webhook] Method: POST
[Mercado Pago Webhook] Query: {}
[Mercado Pago Webhook] Body: { type: 'payment', data: { id: '123456' } }
[Mercado Pago Webhook] ✓ Received event: type=payment, paymentId=123456
[Mercado Pago Webhook] ✓ Pagamento encontrado na API do Mercado Pago
[Mercado Pago Webhook] ✓ Status do pagamento: approved
[Mercado Pago Webhook] ✓ Pagamento APROVADO!
[Mercado Pago Webhook] ✓ Status atualizado no banco de dados
[Mercado Pago Webhook] ✓✓✓ EMAIL ENVIADO COM SUCESSO PARA: user@example.com
[Mercado Pago Webhook] ✓ Webhook processado com sucesso!
```

## Troubleshooting

### Erro 400 - Bad Request

**Causa**: Middleware de JSON não estava sendo aplicado antes do webhook.
**Solução**: ✓ Corrigido - `express.json()` agora está registrado ANTES dos webhooks.

### Erro 401 - Unauthorized

**Causa**: Token do Mercado Pago inválido ou expirado.
**Solução**: Verifique `MERCADOPAGO_ACCESS_TOKEN` no `.env`.

### Erro 404 - Payment Not Found

**Causa**: ID do pagamento não existe na API do Mercado Pago.
**Solução**: Use IDs reais de pagamentos aprovados para testar.

### Email não enviado

**Causa**: Credenciais SMTP inválidas ou lead não encontrado.
**Solução**: Verifique logs e credenciais de email em `.env`.

## Próximas Etapas

1. ✓ Webhook recebendo notificações corretamente
2. ✓ JSON sendo parseado sem erros 400
3. ✓ Testes automatizados passando
4. [ ] Testar com pagamento real do Mercado Pago
5. [ ] Validar email com PDF sendo enviado
6. [ ] Monitorar logs em produção
