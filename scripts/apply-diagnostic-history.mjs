import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL não está definida.");
  process.exit(1);
}

const sql = `
CREATE TABLE IF NOT EXISTS diagnostic_history (
  id int AUTO_INCREMENT NOT NULL,
  leadId int NOT NULL,
  profileName varchar(255) NOT NULL,
  profileDescription text NOT NULL,
  strengths text NOT NULL,
  challenges text NOT NULL,
  recommendations text NOT NULL,
  nextSteps text NOT NULL,
  createdAt timestamp NOT NULL DEFAULT (now()),
  updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT diagnostic_history_id PRIMARY KEY (id)
);
`;

const connection = await mysql.createConnection(databaseUrl);

try {
  await connection.query(sql);
  console.log("Tabela diagnostic_history aplicada com sucesso.");
} finally {
  await connection.end();
}
