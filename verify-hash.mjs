import { getDb } from './server/db.js';
import { users } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const db = await getDb();
const user = await db.select().from(users).where(eq(users.name, 'Daienny')).limit(1);

console.log('User:', user[0].name);
console.log('Hash:', user[0].passwordHash);
console.log('Hash length:', user[0].passwordHash?.length);
console.log('Hash starts with $2b$:', user[0].passwordHash?.startsWith('$2b$'));

// Test password verification
const passwordMatch = await bcrypt.compare('Netflix520@', user[0].passwordHash || '');
console.log('Password match:', passwordMatch);

process.exit(0);
