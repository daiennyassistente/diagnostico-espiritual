import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

async function executeMigration() {
  let connection;
  try {
    console.log('🔄 Conectando ao banco de dados...');
    connection = await mysql.createConnection(DATABASE_URL);
    
    const sql = fs.readFileSync('drizzle/0024_shiny_wrecker.sql', 'utf-8');
    
    console.log('📝 Executando migration...');
    await connection.execute(sql);
    
    console.log('✅ Migration executada com sucesso!');
    console.log('📊 Tabela "visitors" criada');
    
  } catch (error) {
    console.error('❌ Erro durante migration:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

executeMigration();
