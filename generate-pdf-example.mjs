import { generatePremiumDevotionalPDF } from "./server/pdf-generator-premium.ts";
import fs from "fs";

const testData = {
  userName: "Maria Silva",
  profileName: "Buscadora de Intimidade com Deus",
  profileDescription: "Você é alguém que anseia por uma conexão profunda e autêntica com Deus. Sua jornada espiritual é marcada por um desejo sincero de conhecer a vontade divina e viver de acordo com os princípios cristãos.",
  strengths: [
    "Coração sensível e receptivo à voz de Deus",
    "Desejo genuíno de crescimento espiritual",
    "Capacidade de reconhecer suas limitações"
  ],
  challenges: [
    "Dificuldade em manter consistência na oração",
    "Sentimento de distância de Deus em momentos de crise",
    "Luta contra a ansiedade e a falta de confiança"
  ],
  recommendations: [
    "Estabeleça um tempo fixo diário para oração",
    "Busque comunhão com outros cristãos",
    "Pratique a meditação nas Escrituras"
  ],
  nextSteps: [
    "Comece com 15 minutos de oração matinal",
    "Leia um capítulo da Bíblia diariamente",
    "Participe de um grupo de estudo bíblico"
  ],
  days: [
    {
      day: 1,
      title: "Encontrando Você no Silêncio",
      verse: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.",
      verseReference: "Mateus 11:28",
      reflection: "Maria, o silêncio que você sente às vezes não é abandono. É um convite. Um convite de Jesus para você se aproximar, para você descansar nEle. Você respondeu este quiz porque seu coração clama por algo mais profundo, algo real, algo que transcenda as palavras vazias do mundo.",
      prayer: "Senhor Jesus, mesmo quando minhas palavras faltam e meu coração está pesado, eu me achego a Ti. Peço que encontres em mim um coração aberto para a Tua presença e Tua voz.",
      application: "Hoje, reserve 5 minutos em um lugar tranquilo para simplesmente estar na presença de Deus. Não precisa de palavras perfeitas."
    },
    {
      day: 2,
      title: "A Verdade Que Nos Sustém",
      verse: "Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção, para a educação na justiça.",
      verseReference: "2 Timóteo 3:16",
      reflection: "A Bíblia, única e fiel Palavra de Deus, permanece como fundamento e fonte segura de consolo e ensino. Não importa o quanto o seu caminho pareça incerto, as Escrituras estão disponíveis para guiar, repreender e conduzir à justiça.",
      prayer: "Pai Soberano, obrigado pela Tua Palavra que é viva e eficaz. Ajuda-me a valorizar cada ensinamento, mesmo quando meu coração está confuso ou distante.",
      application: "Hoje, comprometa-se a ler um versículo ou trecho bíblico simples e refita nele durante o dia."
    },
    {
      day: 3,
      title: "Arrependimento: O Caminho de Volta",
      verse: "Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados e nos purificar de toda injustiça.",
      verseReference: "1 João 1:9",
      reflection: "O arrependimento não é apenas um ato pontual, mas uma postura contínua de reconhecer nossas falhas diante do Senhor que, em Sua fidelidade, oferece perdão e restauração.",
      prayer: "Senhor Deus, reconheço que muitas vezes me afasto de Ti. Peço perdão por meus pecados. Agradeço pela Tua fidelidade que limpa minha alma.",
      application: "Hoje, faça uma oração simples de arrependimento, reconhecendo uma área difícil mesmo que só para você."
    },
    {
      day: 4,
      title: "Graça Suficiente",
      verse: "A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.",
      verseReference: "2 Coríntios 12:9",
      reflection: "Sua fraqueza não é uma disqualificação. É um convite para experimentar a graça de Deus de forma mais profunda. Jesus não vem para os fortes, mas para os que reconhecem sua necessidade.",
      prayer: "Senhor, reconheço minha fraqueza e minha limitação. Peço que Tua graça seja suficiente para mim neste dia.",
      application: "Identifique uma área de fraqueza em sua vida espiritual e confie que a graça de Deus é suficiente para transformá-la."
    },
    {
      day: 5,
      title: "Comunhão Restaurada",
      verse: "Se andarmos na luz, como ele está na luz, temos comunhão uns com os outros, e o sangue de Jesus, seu Filho, nos purifica de todo pecado.",
      verseReference: "1 João 1:7",
      reflection: "A comunhão com Deus não é um luxo espiritual, é uma necessidade. Quando você se afasta, sinta a falta. Quando você volta, experimente a restauração.",
      prayer: "Jesus, eu desejo caminhar na Tua luz. Restaura minha comunhão contigo e com Teus filhos.",
      application: "Busque comunhão com outro cristão hoje. Compartilhe sua jornada e ore junto."
    },
    {
      day: 6,
      title: "Transformação Contínua",
      verse: "Portanto, se alguém está em Cristo, é nova criação. As coisas antigas já passaram; eis que surgiram coisas novas!",
      verseReference: "2 Coríntios 5:17",
      reflection: "Você não é definido por seus fracassos passados. Em Cristo, você é uma nova criação. Sua história não termina em seus erros, mas em Sua redenção.",
      prayer: "Senhor, obrigado por me fazer nova em Cristo. Ajuda-me a viver como uma pessoa transformada.",
      application: "Reflita sobre uma área de sua vida que precisa de transformação e confie que Deus já começou essa obra em você."
    },
    {
      day: 7,
      title: "Renovação e Compromisso",
      verse: "Portanto, apresentem os seus corpos como sacrifício vivo, santo e agradável a Deus; este é o culto racional de vocês.",
      verseReference: "Romanos 12:1",
      reflection: "Estes 7 dias foram um encontro com Deus. Agora, o desafio é manter essa intimidade. Não é sobre perfeição, é sobre compromisso contínuo.",
      prayer: "Pai, eu me entrego a Ti completamente. Que minha vida seja um sacrifício vivo de adoração a Ti.",
      application: "Estabeleça um compromisso concreto para manter sua jornada espiritual. Pode ser um tempo diário de oração, leitura bíblica ou comunhão com outros cristãos."
    }
  ]
};

async function generateExample() {
  try {
    console.log("Gerando PDF de exemplo...");
    const pdfBuffer = await generatePremiumDevotionalPDF(testData);
    fs.writeFileSync("/home/ubuntu/Devocional-Exemplo-Atualizado.pdf", pdfBuffer);
    console.log("✅ PDF gerado com sucesso: /home/ubuntu/Devocional-Exemplo-Atualizado.pdf");
  } catch (error) {
    console.error("❌ Erro ao gerar PDF:", error);
  }
}

generateExample();
