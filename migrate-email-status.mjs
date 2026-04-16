import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

try {
  console.log('Executing migration...');
  
  // Check if columns already exist
  const [columns] = await connection.query(`
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'payments' AND COLUMN_NAME IN ('emailStatus', 'emailSentAt')
  `);
  
  if (columns.length < 2) {
    // Add emailStatus column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE payments ADD COLUMN emailStatus enum('pendente','enviado','falha') DEFAULT 'pendente' NOT NULL
      `);
      console.log('✓ Added emailStatus column');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
      console.log('✓ emailStatus column already exists');
    }
    
    // Add emailSentAt column if it doesn't exist
    try {
      await connection.query(`
        ALTER TABLE payments ADD COLUMN emailSentAt timestamp NULL
      `);
      console.log('✓ Added emailSentAt column');
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
      console.log('✓ emailSentAt column already exists');
    }
  } else {
    console.log('✓ Columns already exist');
  }
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  await connection.end();
}
