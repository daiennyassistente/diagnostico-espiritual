import mysql from 'mysql2/promise';
import crypto from 'crypto';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const url = new URL(dbUrl);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: url.port,
  user: url.username,
  password: url.password,
  database: url.pathname.split('/')[1],
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  const passwordHash = hashPassword('Netflix520@');
  console.log('Updating admin password with PBKDF2...');
  
  await connection.execute(
    'UPDATE users SET passwordHash = ? WHERE email = ?',
    [passwordHash, 'daienny@example.com']
  );
  
  console.log('✅ Password updated successfully!');
  console.log('New hash:', passwordHash);
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await connection.end();
}
