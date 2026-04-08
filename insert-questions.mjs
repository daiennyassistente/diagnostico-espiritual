import { getDb } from './server/db.js';
import { quizQuestions } from './drizzle/schema.js';

const db = await getDb();

// Create the table
await db.execute(`CREATE TABLE IF NOT EXISTS quiz_questions (
  id int AUTO_INCREMENT NOT NULL,
  step int NOT NULL,
  question text NOT NULL,
  options text NOT NULL,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT quiz_questions_id PRIMARY KEY(id)
)`);

console.log('Table created successfully!');

// Insert default questions
const defaultQuestions = [
  { step: 1, question: 'Como você se sente espiritualmente hoje?', options: JSON.stringify(['Fortalecido', 'Confuso', 'Fraco', 'Esperançoso']) },
  { step: 2, question: 'O que mais tem dificultado sua constância com Deus?', options: JSON.stringify(['Falta de tempo', 'Distrações', 'Dúvidas', 'Cansaço']) },
  { step: 3, question: 'Como está sua rotina com a Palavra?', options: JSON.stringify(['Diária', 'Semanal', 'Ocasional', 'Nenhuma']) },
  { step: 4, question: 'Como você descreveria sua vida de oração hoje?', options: JSON.stringify(['Ativa', 'Superficial', 'Distante', 'Transformadora']) },
  { step: 5, question: 'O que você mais sente falta hoje na sua vida com Deus?', options: JSON.stringify(['Intimidade', 'Direção', 'Paz', 'Força']) },
  { step: 6, question: 'O que você sente que mais tem sido tratado em você nessa fase?', options: JSON.stringify(['Medo', 'Orgulho', 'Falta de fé', 'Egoísmo']) },
  { step: 7, question: 'O que você mais deseja viver com Deus agora?', options: JSON.stringify(['Libertação', 'Propósito', 'Cura', 'Comunhão']) },
  { step: 8, question: 'Quanto tempo por dia você consegue dedicar com intencionalidade?', options: JSON.stringify(['Menos de 5min', '5-15min', '15-30min', 'Mais de 30min']) },
  { step: 9, question: 'Qual é sua maior dificuldade?', options: JSON.stringify(['Consistência', 'Compreensão', 'Aplicação', 'Motivação']) },
  { step: 10, question: 'Como você se descreve espiritualmente neste momento?', options: JSON.stringify(['Iniciante', 'Em crescimento', 'Maduro', 'Mentor']) }
];

for (const q of defaultQuestions) {
  await db.insert(quizQuestions).values(q);
}

console.log('Default questions inserted!');
process.exit(0);
