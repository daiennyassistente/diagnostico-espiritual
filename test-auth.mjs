import { authenticateUser } from './server/db.js';

console.log('Testing authenticateUser...');
const result = await authenticateUser('Daienny', 'Netflix520@');
console.log('Result:', result);

if (result) {
  console.log('Login successful!');
  console.log('User:', result.name, result.email);
} else {
  console.log('Login failed!');
}

process.exit(0);
