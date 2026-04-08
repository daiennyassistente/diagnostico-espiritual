import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

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
  // Test 1: Query by email
  console.log('Test 1: Query by email');
  const [rows1] = await connection.execute(
    'SELECT id, name, email, passwordHash FROM users WHERE email = ?',
    ['daienny@example.com']
  );
  console.log('Found:', rows1.length > 0 ? 'YES' : 'NO');
  if (rows1.length > 0) {
    console.log('User:', rows1[0]);
  }

  // Test 2: Verify password
  console.log('\nTest 2: Verify password');
  if (rows1.length > 0) {
    const user = rows1[0];
    const isValid = await bcrypt.compare('Netflix520@', user.passwordHash);
    console.log('Password valid:', isValid ? 'YES' : 'NO');
  }
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await connection.end();
}
