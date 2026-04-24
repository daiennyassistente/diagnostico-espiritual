import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute('SELECT COUNT(*) as count FROM leads');
console.log('Total de leads:', rows[0].count);
await connection.end();
