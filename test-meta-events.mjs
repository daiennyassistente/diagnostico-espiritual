#!/usr/bin/env node

/**
 * Script para disparar todos os eventos Meta (QuizStarted, Lead, QuizCompleted)
 * para teste no Meta Events Manager
 */

// Usar fetch nativo do Node.js 18+

const API_BASE_URL = 'http://localhost:3000/api/trpc';

// Dados de teste
const testLead = {
  name: 'Teste User',
  email: 'teste@example.com',
  phone: '5511999999999',
  leadId: Math.floor(Math.random() * 100000),
};

async function callTrpc(procedurePath, input) {
  try {
    const response = await fetch(`${API_BASE_URL}/${procedurePath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: input,
      }),
    });

    const data = await response.json();
    console.log(`✅ ${procedurePath}:`, data);
    return data;
  } catch (error) {
    console.error(`❌ ${procedurePath}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Iniciando teste de eventos Meta...\n');

  try {
    // 1. Disparar QuizStarted
    console.log('1️⃣ Disparando evento QuizStarted...');
    await callTrpc('quiz.sendMetaEvent', {
      eventName: 'QuizStarted',
      leadId: testLead.leadId,
      email: testLead.email,
      phone: testLead.phone,
      firstName: testLead.name,
      sourceUrl: 'https://diagnosticoespiritual.manus.space/quiz',
    });
    console.log('✅ QuizStarted disparado!\n');

    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Disparar Lead
    console.log('2️⃣ Disparando evento Lead...');
    await callTrpc('quiz.sendMetaEvent', {
      eventName: 'Lead',
      leadId: testLead.leadId,
      email: testLead.email,
      phone: testLead.phone,
      firstName: testLead.name,
      sourceUrl: 'https://diagnosticoespiritual.manus.space/quiz',
    });
    console.log('✅ Lead disparado!\n');

    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Disparar QuizCompleted
    console.log('3️⃣ Disparando evento QuizCompleted...');
    await callTrpc('quiz.sendMetaEvent', {
      eventName: 'QuizCompleted',
      leadId: testLead.leadId,
      email: testLead.email,
      phone: testLead.phone,
      firstName: testLead.name,
      sourceUrl: 'https://diagnosticoespiritual.manus.space/quiz',
    });
    console.log('✅ QuizCompleted disparado!\n');

    console.log('🎉 Todos os eventos foram disparados com sucesso!');
    console.log('\n📊 Verifique no Meta Events Manager:');
    console.log('   - QuizStarted');
    console.log('   - Lead');
    console.log('   - QuizCompleted');
    console.log(`\n📝 Lead ID usado: ${testLead.leadId}`);
    console.log(`📧 Email: ${testLead.email}`);
    console.log(`📱 Phone: ${testLead.phone}`);

  } catch (error) {
    console.error('❌ Erro ao disparar eventos:', error);
    process.exit(1);
  }
}

main();
