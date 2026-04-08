import mysql from 'mysql2/promise';

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
  const [rows] = await connection.execute(
    'SELECT id, name, email, passwordHash FROM users WHERE name = ?',
    ['Daienny']
  );

  if (rows.length > 0) {
    console.log('Admin user found:');
    console.log('ID:', rows[0].id);
    console.log('Name:', rows[0].name);
    console.log('Email:', rows[0].email);
    console.log('Has password hash:', !!rows[0].passwordHash);
  } else {
    console.log('No admin user found with name "Daienny"');
  }
} catch (error) {
  console.error('Error:', error.message);
} finally {
  await connection.end();
}
