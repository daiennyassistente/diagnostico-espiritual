import mysql from "mysql2/promise";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não está disponível");
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const createTableSql = `
CREATE TABLE IF NOT EXISTS transaction_control (
  id int AUTO_INCREMENT NOT NULL,
  transactionId varchar(255) NOT NULL,
  resultId int NOT NULL,
  quizId varchar(36) NOT NULL,
  leadId int NOT NULL,
  status enum('pending','approved','failed','cancelled') NOT NULL DEFAULT 'pending',
  processed int NOT NULL DEFAULT 0,
  emailSent int NOT NULL DEFAULT 0,
  productReleased int NOT NULL DEFAULT 0,
  createdAt timestamp NOT NULL DEFAULT (now()),
  updatedAt timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT transaction_control_id PRIMARY KEY(id),
  CONSTRAINT transaction_control_transactionId_unique UNIQUE(transactionId)
);
`;

try {
  await connection.query(createTableSql);
  console.log("Tabela transaction_control garantida com sucesso");
} finally {
  await connection.end();
}
