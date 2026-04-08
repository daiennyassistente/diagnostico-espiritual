import { getDb } from './server/db.js';
import { users } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const db = await getDb();

// Hash the password with bcrypt
const hashedPassword = await bcrypt.hash('Netflix520@', 10);

// Update the user
await db.update(users).set({
  passwordHash: hashedPassword,
  updatedAt: new Date(),
}).where(eq(users.name, 'Daienny'));

console.log('Password updated successfully!');
console.log('New hash:', hashedPassword);

// Verify
const user = await db.select().from(users).where(eq(users.name, 'Daienny')).limit(1);
const matches = await bcrypt.compare('Netflix520@', user[0].passwordHash || '');
console.log('Verification:', matches ? 'SUCCESS' : 'FAILED');

process.exit(0);
