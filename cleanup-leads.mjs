import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
await connection.execute('DELETE FROM leads');
await connection.end();
console.log('✅ Leads limpados com sucesso');
