import { getDb } from './server/db.ts';
import { diagnosticHistory, leads } from './drizzle/schema.ts';
import { eq, desc } from 'drizzle-orm';

const db = await getDb();
if (!db) {
  console.error('DB indisponível');
  process.exit(1);
}

const rows = await db
  .select({
    leadId: leads.id,
    email: leads.email,
    whatsapp: leads.whatsapp,
    name: leads.name,
    diagnosticId: diagnosticHistory.id,
    profileName: diagnosticHistory.profileName,
  })
  .from(diagnosticHistory)
  .innerJoin(leads, eq(diagnosticHistory.leadId, leads.id))
  .orderBy(desc(diagnosticHistory.id))
  .limit(1);

console.log(JSON.stringify(rows[0] ?? null));
