# Achados da documentação do Mercado Pago

## Cartão com CardForm e Secure Fields

A documentação oficial indica que o pagamento com cartão em checkout transparente deve usar `MercadoPago.js` v2 com `mp.cardForm(...)`, incluindo `iframe: true` para os campos seguros. O frontend precisa coletar `token`, `payment_method_id`, `issuer_id`, `installments`, `payer.email` e identificação do pagador via `cardForm.getCardFormData()` e enviar esses dados ao backend para criação do pagamento em `/v1/payments`.

Também é obrigatório enviar `X-Idempotency-Key` no backend ao criar o pagamento. O token do cartão é de uso único e expira em até 7 dias.

## PIX

Para PIX, a criação do pagamento ocorre no backend via `/v1/payments` com `payment_method_id: "pix"`. A resposta esperada retorna status `pending` e os dados em `point_of_interaction.transaction_data`, incluindo `qr_code`, `qr_code_base64` e possivelmente `ticket_url`. Esses dados devem ser exibidos ao usuário diretamente na interface.

## Implicações para o projeto

1. O fluxo de cartão não deve redirecionar para Checkout Pro se quisermos aderência ao pedido do Mercado Pago sobre Secure Fields.
2. O fluxo de PIX pode continuar sendo transparente, mas precisa usar a resposta oficial da API e manter o webhook funcional para aprovação posterior.
3. O backend precisa separar claramente a criação de pagamento de cartão e a criação de pagamento PIX.
4. O frontend deve carregar o SDK oficial e renderizar o formulário seguro apenas no modal ou bloco de pagamento, sem alterar o restante do design.
