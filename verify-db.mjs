import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'diagnostico_espiritual'
});

try {
  const [columns] = await conn.execute('DESCRIBE users');
  const hasPasswordHash = columns.some(col => col.Field === 'passwordHash');
  console.log('✓ passwordHash column exists:', hasPasswordHash);
  
  const [users] = await conn.execute('SELECT id, name, email, role FROM users WHERE name = ?', ['Daienny']);
  if (users.length > 0) {
    console.log('✓ Admin user found:', users[0]);
  } else {
    console.log('✗ Admin user not found');
  }
} catch (err) {
  console.error('Error:', err.message);
} finally {
  await conn.end();
}
