import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'diagnostico_espiritual'
});

try {
  console.log('Applying migration...');
  await conn.execute('ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255) DEFAULT NULL');
  console.log('✓ Migration applied successfully');
  
  // Create admin user
  const hashedPassword = require('crypto').createHash('sha256').update('daivitoria23').digest('hex');
  await conn.execute(
    'INSERT INTO `users` (name, email, passwordHash, role, loginMethod) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE passwordHash = ?, role = ?',
    ['Daienny', 'admin@diagnostico.com', hashedPassword, 'admin', 'password', hashedPassword, 'admin']
  );
  console.log('✓ Admin user created/updated');
} catch (err) {
  if (err.code === 'ER_DUP_FIELDNAME') {
    console.log('✓ Column already exists');
  } else {
    console.error('Error:', err.message);
  }
} finally {
  await conn.end();
}
