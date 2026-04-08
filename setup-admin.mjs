import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'diagnostico_espiritual',
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
  console.error('Error:', error);
} finally {
  await connection.end();
}
