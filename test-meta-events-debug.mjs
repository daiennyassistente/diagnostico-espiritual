#!/usr/bin/env node

/**
 * Script para disparar eventos Meta com debug detalhado
 */

const API_BASE_URL = 'http://localhost:3000/api/trpc';

const testLead = {
  name: 'Teste Debug User',
  email: 'debug@test.com',
  phone: '5511988888888',
  leadId: Math.floor(Math.random() * 1000000),
};

async function callTrpc(procedurePath, input) {
  try {
    console.log(`\n📤 Enviando para ${procedurePath}:`);
    console.log('Input:', JSON.stringify(input, null, 2));

    const response = await fetch(`${API_BASE_URL}/${procedurePath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: input,
      }),
    });

    const responseText = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, responseText);

    try {
      const data = JSON.parse(responseText);
      console.log('Parsed:', JSON.stringify(data, null, 2));
      return data;
    } catch (e) {
      console.log('Could not parse as JSON');
      return responseText;
    }
  } catch (error) {
    console.error(`❌ Erro:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Teste de eventos Meta com debug...\n');
  console.log('Lead ID:', testLead.leadId);
  console.log('Email:', testLead.email);
  console.log('Phone:', testLead.phone);

  try {
    // 1. QuizStarted
    console.log('\n\n=== 1️⃣ QUIZSTARTED ===');
    await callTrpc('quiz.sendMetaEvent', {
      eventName: 'QuizStarted',
      leadId: testLead.leadId,
      email: testLead.email,
      phone: testLead.phone,
      firstName: testLead.name,
      sourceUrl: 'https://diagnosticoespiritual.manus.space/quiz',
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Lead
    console.log('\n\n=== 2️⃣ LEAD ===');
    await callTrpc('quiz.sendMetaEvent', {
      eventName: 'Lead',
      leadId: testLead.leadId,
      email: testLead.email,
      phone: testLead.phone,
      firstName: testLead.name,
      sourceUrl: 'https://diagnosticoespiritual.manus.space/quiz',
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. QuizCompleted
    console.log('\n\n=== 3️⃣ QUIZCOMPLETED ===');
    await callTrpc('quiz.sendMetaEvent', {
      eventName: 'QuizCompleted',
      leadId: testLead.leadId,
      email: testLead.email,
      phone: testLead.phone,
      firstName: testLead.name,
      sourceUrl: 'https://diagnosticoespiritual.manus.space/quiz',
    });

    console.log('\n\n✅ Teste concluído!');

  } catch (error) {
    console.error('\n❌ Erro:', error);
    process.exit(1);
  }
}

main();
