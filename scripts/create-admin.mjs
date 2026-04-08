import mysql from 'mysql2/promise';
import crypto from 'crypto';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

try {
  const passwordHash = hashPassword('daivitoria23');
  const openId = `admin-daienny-${Date.now()}`;
  
  await connection.execute(
    'INSERT INTO users (openId, name, passwordHash, role, loginMethod, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW()) ON DUPLICATE KEY UPDATE passwordHash = ?, role = ?',
    [openId, 'Daienny', passwordHash, 'admin', 'password', passwordHash, 'admin']
  );
  
  console.log('✓ Admin user created: Daienny / daivitoria23');
} catch (error) {
  console.error('✗ Failed to create admin user:', error.message);
}

await connection.end();
