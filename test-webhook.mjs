import fetch from 'node-fetch';

// Simular um webhook do Mercado Pago com um pagamento aprovado
const webhookData = {
  id: '123456789',
  type: 'payment',
  external_reference: '1620015', // leadId do primeiro diagnóstico
};

console.log('Enviando webhook simulado para:', 'http://localhost:3000/api/mercadopago/webhook');
console.log('Dados:', webhookData);

try {
  const response = await fetch('http://localhost:3000/api/mercadopago/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(webhookData),
  });

  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Resposta:', data);
} catch (error) {
  console.error('Erro:', error.message);
}
