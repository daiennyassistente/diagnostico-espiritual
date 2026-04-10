import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute('SELECT id, username FROM admin');
console.log('Admins no banco:', rows);
connection.end();
