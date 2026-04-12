import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL não está definida.");
  process.exit(1);
}

const connection = await mysql.createConnection(databaseUrl);

async function safeQuery(label, sql) {
  try {
    const [rows] = await connection.query(sql);
    console.log(`\n=== ${label} ===`);
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.log(`\n=== ${label} (ERRO) ===`);
    console.log(error?.message || error);
  }
}

await safeQuery(
  "Tabelas relevantes",
  `SHOW TABLES LIKE 'diagnostic_history'`,
);

await safeQuery(
  "Colunas de diagnostic_history",
  `SHOW COLUMNS FROM diagnostic_history`,
);

await safeQuery(
  "Colunas de leads",
  `SHOW COLUMNS FROM leads`,
);

await safeQuery(
  "Amostra de diagnostic_history",
  `SELECT * FROM diagnostic_history ORDER BY id DESC LIMIT 3`,
);

await safeQuery(
  "Query semelhante ao admin",
  `SELECT diagnostic_history.id, diagnostic_history.leadId, leads.email, leads.whatsapp, diagnostic_history.profileName, diagnostic_history.profileDescription, diagnostic_history.strengths, diagnostic_history.challenges, diagnostic_history.recommendations, diagnostic_history.nextSteps, diagnostic_history.createdAt FROM diagnostic_history INNER JOIN leads ON diagnostic_history.leadId = leads.id ORDER BY diagnostic_history.createdAt DESC LIMIT 5`,
);

await connection.end();
