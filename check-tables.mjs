import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const tables = ['leads', 'buyers', 'quiz_responses', 'diagnostic_history', 'devotional_deliveries', 'transaction_control', 'payments'];

for (const table of tables) {
  try {
    const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
    console.log(`${table}: ${rows[0].count}`);
  } catch (e) {
    console.log(`${table}: erro ao contar`);
  }
}

await connection.end();
