import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);

try {
  console.log("Aplicando migração: CREATE TABLE quiz_events");
  const sqlFile = path.join(__dirname, "drizzle/0029_jittery_kree.sql");
  const sql = fs.readFileSync(sqlFile, "utf-8");
  
  // Split by semicolon and execute each statement
  const statements = sql.split(";").filter(s => s.trim());
  for (const statement of statements) {
    await connection.execute(statement);
  }
  
  console.log("✓ Migração aplicada com sucesso!");
} catch (error) {
  if (error.code === "ER_TABLE_EXISTS_ERROR") {
    console.log("⚠ Tabela quiz_events já existe");
  } else {
    console.error("Erro ao executar migração:", error.message);
    process.exit(1);
  }
}

await connection.end();
