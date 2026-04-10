import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await connection.execute('SELECT id, username, passwordHash FROM admin LIMIT 5');
console.log('Admins no banco:', rows);
connection.end();
