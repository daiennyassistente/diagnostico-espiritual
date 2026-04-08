import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

try {
  await connection.execute('ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255)');
  console.log('✓ Migration applied: passwordHash column added to users table');
} catch (error) {
  if (error.code === 'ER_DUP_FIELDNAME') {
    console.log('✓ Column passwordHash already exists');
  } else {
    console.error('✗ Migration failed:', error.message);
  }
}

await connection.end();
