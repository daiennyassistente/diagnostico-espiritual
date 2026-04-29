import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

try {
  console.log("Executando migração: DROP COLUMN emotionalMessage");
  await connection.execute("ALTER TABLE `diagnostic_history` DROP COLUMN `emotionalMessage`");
  console.log("✓ Migração aplicada com sucesso!");
} catch (error) {
  if (error.code === "ER_CANT_DROP_FIELD_OR_KEY") {
    console.log("⚠ Coluna já foi removida anteriormente");
  } else {
    console.error("Erro ao executar migração:", error.message);
    process.exit(1);
  }
}

await connection.end();
