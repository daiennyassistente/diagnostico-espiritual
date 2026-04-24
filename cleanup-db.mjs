import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

async function cleanup() {
  let connection;
  try {
    console.log('🔄 Conectando ao banco de dados...');
    connection = await mysql.createConnection(DATABASE_URL);
    
    console.log('🗑️  Iniciando limpeza de dados...\n');
    
    // Executar cada DELETE em sequência
    const queries = [
      'DELETE FROM transaction_control',
      'DELETE FROM devotional_deliveries',
      'DELETE FROM diagnostic_history',
      'DELETE FROM quiz_responses',
      'DELETE FROM payments',
      'DELETE FROM buyers',
      'DELETE FROM leads',
      'ALTER TABLE leads AUTO_INCREMENT = 1',
      'ALTER TABLE payments AUTO_INCREMENT = 1',
      'ALTER TABLE buyers AUTO_INCREMENT = 1',
      'ALTER TABLE quiz_responses AUTO_INCREMENT = 1',
      'ALTER TABLE diagnostic_history AUTO_INCREMENT = 1',
      'ALTER TABLE devotional_deliveries AUTO_INCREMENT = 1',
      'ALTER TABLE transaction_control AUTO_INCREMENT = 1',
    ];
    
    for (const query of queries) {
      console.log(`⏳ Executando: ${query}`);
      await connection.execute(query);
      console.log(`✅ Concluído\n`);
    }
    
    console.log('✨ Limpeza de dados concluída com sucesso!');
    console.log('\n📊 Tabelas limpas:');
    console.log('  ✓ leads');
    console.log('  ✓ buyers');
    console.log('  ✓ payments');
    console.log('  ✓ quiz_responses');
    console.log('  ✓ diagnostic_history');
    console.log('  ✓ devotional_deliveries');
    console.log('  ✓ transaction_control');
    console.log('\n🔒 Tabelas mantidas intactas:');
    console.log('  ✓ users');
    console.log('  ✓ admins');
    console.log('  ✓ quiz_questions');
    
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

cleanup();
