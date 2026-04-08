import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Parse the DATABASE_URL
const url = new URL(dbUrl);
const connection = await mysql.createConnection({
  host: url.hostname,
  port: url.port,
  user: url.username,
  password: url.password,
  database: url.pathname.split('/')[1],
  ssl: 'Amazon RDS',
});

try {
  // Check if user exists
  const [rows] = await connection.execute(
    'SELECT * FROM users WHERE name = ?',
    ['Daienny']
  );

  const hashedPassword = await bcrypt.hash('Netflix520@', 10);

  if (rows.length === 0) {
    console.log('Creating admin user...');
    await connection.execute(
      'INSERT INTO users (openId, name, email, passwordHash, role, loginMethod, createdAt, updatedAt, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())',
      [`admin-Daienny-${Date.now()}`, 'Daienny', 'daienny@example.com', hashedPassword, 'admin', 'password']
    );
    console.log('✅ Admin user created successfully!');
  } else {
    console.log('User already exists. Updating password...');
    await connection.execute(
      'UPDATE users SET passwordHash = ? WHERE name = ?',
      [hashedPassword, 'Daienny']
    );
    console.log('✅ Password updated successfully!');
  }
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await connection.end();
}
