import { getDb } from './server/db.js';
import { users } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const db = await getDb();
const user = await db.select().from(users).where(eq(users.name, 'Daienny')).limit(1);

console.log('User in DB:', user[0].name);
console.log('Hash:', user[0].passwordHash);
console.log('Updated At:', user[0].updatedAt);

// Test both passwords
const test1 = await bcrypt.compare('Netflix520@', user[0].passwordHash || '');
const test2 = await bcrypt.compare('daivitoria23', user[0].passwordHash || '');

console.log('Netflix520@ matches:', test1);
console.log('daivitoria23 matches:', test2);

if (test2) {
  console.log('The correct password is: daivitoria23');
} else if (test1) {
  console.log('The correct password is: Netflix520@');
} else {
  console.log('Neither password matches!');
}

process.exit(0);
