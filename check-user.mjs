import { getDb } from './server/db.js';
import { users } from './drizzle/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

const db = await getDb();
if (!db) {
  console.log('Database not available');
  process.exit(1);
}

// Check if user exists
const existingUser = await db.select().from(users).where(eq(users.name, 'Daienny')).limit(1);
console.log('Existing user:', existingUser);

if (existingUser.length === 0) {
  console.log('User not found, creating...');
  
  // Hash the password
  const hashedPassword = await bcrypt.hash('Netflix520@', 10);
  
  // Create the user
  await db.insert(users).values({
    name: 'Daienny',
    email: 'daienny@example.com',
    passwordHash: hashedPassword,
    role: 'admin',
    openId: null,
    loginMethod: 'password',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  console.log('User created successfully');
} else {
  console.log('User already exists');
  
  // Verify password
  const user = existingUser[0];
  const passwordMatch = await bcrypt.compare('Netflix520@', user.passwordHash || '');
  console.log('Password match:', passwordMatch);
  
  if (!passwordMatch) {
    console.log('Updating password...');
    const hashedPassword = await bcrypt.hash('Netflix520@', 10);
    await db.update(users).set({ passwordHash: hashedPassword }).where(eq(users.id, user.id));
    console.log('Password updated');
  }
}

process.exit(0);
