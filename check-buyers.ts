import { getDb, getAdminBuyers } from './server/db';

async function main() {
  const buyers = await getAdminBuyers();
  console.log('Dados dos compradores:');
  console.log(JSON.stringify(buyers, null, 2));
}

main().catch(console.error);
