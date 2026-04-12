import mysql from 'mysql2/promise';
import crypto from 'crypto';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Verificar se existe admin
const [existing] = await connection.execute('SELECT id, username FROM admin WHERE username = ?', ['admin']);
console.log('Admin existente:', existing);

if (existing.length === 0) {
  // Criar admin padrão com senha "admin123"
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync('admin123', salt, 1000, 64, 'sha256').toString('hex');
  const passwordHash = `${salt}:${hash}`;
  
  await connection.execute(
    'INSERT INTO admin (username, passwordHash) VALUES (?, ?)',
    ['admin', passwordHash]
  );
  console.log('✅ Admin criado: username=admin, password=admin123');
} else {
  console.log('✅ Admin já existe:', existing[0].username);
}

connection.end();
