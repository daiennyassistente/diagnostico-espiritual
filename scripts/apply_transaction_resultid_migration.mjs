import fs from "node:fs/promises";
import mysql from "mysql2/promise";

const sql = await fs.readFile(new URL("../drizzle/0023_confused_quentin_quire.sql", import.meta.url), "utf8");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está disponível");
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  await connection.query(sql);
  console.log("Migração aplicada com sucesso");
} finally {
  await connection.end();
}
