export interface SpiritualProfile {
  title: string;
  description: string;
  emoji: string;
  color: string;
  recommendations: string[];
  strengths: string[];
  challenges: string[];
  nextSteps: string[];
}

export interface QuizResponses {
  [key: number]: string;
}

const PROFILES: Record<string, SpiritualProfile> = {
  CORAÇÃO_EM_RECOMEÇO: {
    title: "Coração em Recomeço",
    description: "Você está em um processo de renovação espiritual. Há uma abertura genuína para voltar a conectar com Deus, mesmo que sinta que perdeu tempo ou direção.",
    emoji: "🌱",
    color: "#8B7355",
    recommendations: [
      "Comece com pequenos momentos de oração, sem pressão de perfeição",
      "Leia um versículo curto por dia para reconectar com a Palavra",
      "Encontre um grupo ou comunidade que te acolha nessa fase",
      "Seja gentil consigo mesmo no processo de reconstrução"
    ],
    strengths: [
      "Disposição para mudança",
      "Humildade em reconhecer a necessidade de Deus",
      "Abertura para novas experiências espirituais"
    ],
    challenges: [
      "Consistência e disciplina",
      "Superação de culpa ou arrependimento",
      "Manutenção da motivação inicial"
    ],
    nextSteps: [
      "Defina um horário fixo para sua devoção diária",
      "Escolha um livro da Bíblia curto para estudar",
      "Procure por um mentor ou conselheiro espiritual"
    ]
  },
  FÉ_CANSADA: {
    title: "Fé Cansada",
    description: "Você ama a Deus, mas está exausto. O cansaço pode ser emocional, físico ou espiritual. É hora de descansar e se renovar na presença de Deus.",
    emoji: "😔",
    color: "#A0826D",
    recommendations: [
      "Permita-se descansar sem culpa - Deus também descansa",
      "Simplifique sua rotina espiritual temporariamente",
      "Busque atividades que renovem sua alegria em Deus",
      "Considere falar com um conselheiro ou terapeuta"
    ],
    strengths: [
      "Você já tem uma história com Deus",
      "Consciência de que algo precisa mudar",
      "Potencial para renovação profunda"
    ],
    challenges: [
      "Esgotamento emocional e espiritual",
      "Dificuldade em encontrar motivação",
      "Possível desânimo ou depressão"
    ],
    nextSteps: [
      "Tire um tempo para reflexão e descanso",
      "Busque atividades que te tragam alegria",
      "Considere um retiro ou tempo de silêncio"
    ]
  },
  TRAVADA_ESPIRITUALMENTE: {
    title: "Travada Espiritualmente",
    description: "Você sente que está presa em um ciclo. Há bloqueios que impedem seu crescimento e liberdade espiritual. É tempo de identificar e quebrar essas correntes.",
    emoji: "🔗",
    color: "#8B6F47",
    recommendations: [
      "Identifique os padrões que a mantêm travada",
      "Busque libertação através da oração e confissão",
      "Considere aconselhamento espiritual profundo",
      "Quebre hábitos que a afastam de Deus"
    ],
    strengths: [
      "Consciência do problema",
      "Desejo de mudança",
      "Potencial para transformação radical"
    ],
    challenges: [
      "Padrões repetitivos",
      "Possível falta de direção",
      "Dificuldade em romper ciclos"
    ],
    nextSteps: [
      "Faça uma lista dos bloqueios que identifica",
      "Procure um conselheiro ou pastor experiente",
      "Dedique tempo para oração de libertação"
    ]
  },
  AMADURECENDO: {
    title: "Amadurecendo na Fé",
    description: "Você está em um processo saudável de crescimento espiritual. Há consistência, aprendizado e transformação acontecendo. Continue nesse caminho!",
    emoji: "🌳",
    color: "#6B5344",
    recommendations: [
      "Aprofunde seu conhecimento bíblico com estudos mais desafiadores",
      "Comece a mentorear outros em sua jornada de fé",
      "Busque servir e impactar sua comunidade",
      "Desenvolva uma vida de oração mais profunda"
    ],
    strengths: [
      "Consistência e disciplina",
      "Crescimento contínuo",
      "Capacidade de impactar outros"
    ],
    challenges: [
      "Evitar complacência",
      "Continuar crescendo além do conforto",
      "Manter humildade no progresso"
    ],
    nextSteps: [
      "Escolha uma área de crescimento para aprofundar",
      "Comece a mentorear alguém",
      "Participe de um grupo de estudo bíblico avançado"
    ]
  },
  BUSCANDO_DIREÇÃO: {
    title: "Buscando Direção",
    description: "Você tem fome de Deus, mas está confuso sobre qual caminho seguir. Há sinceridade em seu coração, mas falta clareza na direção.",
    emoji: "🧭",
    color: "#9B8B7E",
    recommendations: [
      "Dedique tempo para ouvir a voz de Deus em silêncio",
      "Estude a Palavra para encontrar princípios de direção",
      "Busque conselho de pessoas sábias e experientes",
      "Confie no timing de Deus, não force decisões"
    ],
    strengths: [
      "Fome genuína de Deus",
      "Disposição para ouvir",
      "Abertura para mudança"
    ],
    challenges: [
      "Confusão e incerteza",
      "Dificuldade em discernir a vontade de Deus",
      "Possível ansiedade sobre o futuro"
    ],
    nextSteps: [
      "Estabeleça um tempo diário de escuta e oração",
      "Procure um mentor ou conselheiro espiritual",
      "Faça um retiro ou tempo de reflexão"
    ]
  },
  INCONSISTENTE: {
    title: "Fé Inconsistente",
    description: "Você ama a Deus, mas sua caminhada é marcada por altos e baixos. Há momentos de proximidade seguidos de distanciamento.",
    emoji: "📈",
    color: "#9D8B7D",
    recommendations: [
      "Identifique os gatilhos que causam seus altos e baixos",
      "Crie estruturas e rotinas que mantenham você consistente",
      "Busque responsabilidade com alguém de confiança",
      "Trabalhe na raiz das causas da inconsistência"
    ],
    strengths: [
      "Desejo de estar próximo de Deus",
      "Consciência dos padrões",
      "Potencial para transformação"
    ],
    challenges: [
      "Falta de consistência",
      "Dificuldade em manter disciplina",
      "Ciclos de aproximação e afastamento"
    ],
    nextSteps: [
      "Estabeleça uma rotina espiritual simples e viável",
      "Encontre um parceiro de responsabilidade",
      "Trabalhe com um conselheiro na raiz do problema"
    ]
  }
};

export function analyzeResponses(responses: QuizResponses): SpiritualProfile {
  // Análise baseada nas respostas do quiz
  const step1 = responses[0]; // Como você se sente espiritualmente
  const step3 = responses[2]; // Como está sua rotina com a Palavra
  const step4 = responses[3]; // Vida de oração
  const step5 = responses[4]; // O que mais sente falta
  const step10 = responses[9]; // Como você se sente hoje

  // Lógica de classificação
  if (
    step10?.includes("recomeço") ||
    step10?.includes("Recomeço") ||
    step1?.includes("voltar")
  ) {
    return PROFILES.CORAÇÃO_EM_RECOMEÇO;
  }

  if (
    step10?.includes("cansada") ||
    step10?.includes("Cansada") ||
    step5?.includes("paz")
  ) {
    return PROFILES.FÉ_CANSADA;
  }

  if (
    step10?.includes("travada") ||
    step10?.includes("Travada") ||
    step3?.includes("parada")
  ) {
    return PROFILES.TRAVADA_ESPIRITUALMENTE;
  }

  if (
    step10?.includes("amadurecendo") ||
    step10?.includes("Amadurecendo") ||
    step3?.includes("frequente e profunda")
  ) {
    return PROFILES.AMADURECENDO;
  }

  if (
    step5?.includes("direção") ||
    step1?.includes("sem direção") ||
    step10?.includes("fome")
  ) {
    return PROFILES.BUSCANDO_DIREÇÃO;
  }

  if (
    step4?.includes("instável") ||
    step4?.includes("pouco constante") ||
    step3?.includes("irregular")
  ) {
    return PROFILES.INCONSISTENTE;
  }

  // Perfil padrão
  return PROFILES.AMADURECENDO;
}
