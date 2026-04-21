import { generateDevotionalContent } from './server/devotional-pdf-service.ts';

const testData = {
  userName: "João Silva",
  email: "joao@test.com",
  whatsapp: "5585984463738",
  profileName: "Espiritualmente em Reconstrução",
  profileDescription: "Você está em uma fase de reconstrução espiritual, buscando reestabelecer sua intimidade com Deus após um período de distância.",
  strengths: ["Consciência da necessidade de Deus", "Disposição para mudança", "Fé resiliente mesmo em dificuldades"],
  challenges: ["Constância na vida de oração", "Rotina irregular com a Palavra", "Dificuldade em manter disciplina espiritual"],
  quizResponses: {
    q1: "Distante e querendo voltar",
    q2: "Cansaço",
    q3: "Irregular",
    q4: "Sincera, mas instável",
    q5: "Sim, frequentemente",
    q6: "Sim, mas preciso retomar",
    q7: "Sim, mas preciso de direção",
    q8: "Sim, mas preciso de força",
    q9: "Sim, mas preciso de paz",
    q10: "Sim, mas preciso de comunhão",
    q11: "Sim, mas preciso de esperança",
    q12: "Sim, mas preciso de transformação"
  }
};

try {
  const content = await generateDevotionalContent(testData);
  console.log(`Total de dias: ${content.days.length}`);
  content.days.forEach((day, i) => {
    console.log(`\nDia ${i+1}: ${day.title}`);
    console.log(`  Reflexão: ${day.reflection.length} caracteres`);
    console.log(`  Oração: ${day.prayer.length} caracteres`);
    console.log(`  Aplicação: ${day.application.length} caracteres`);
  });
} catch (error) {
  console.error('Erro:', error.message);
}
