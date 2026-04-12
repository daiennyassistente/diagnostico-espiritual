/**
 * Funções de copywriting otimizado para conversão
 * Totalmente personalizado por perfil espiritual
 * Foco em identificação emocional e urgência
 */

export interface ConversionCopy {
  headline: string;
  identification: string;
  painEscalation: string;
  hope: string;
  productTitle: string;
  productDescription: string;
  benefits: string[];
  socialProof: string;
  urgencyMessage: string;
  ctaPrimary: string;
  ctaSecondary: string;
  closingStatement: string;
}

/**
 * Detecta o tipo de perfil espiritual
 */
const getProfileType = (profileName: string): string => {
  const lower = profileName.toLowerCase();
  
  if (lower.includes("sobrecarregado") || lower.includes("cansado") || lower.includes("esgotado")) {
    return "overwhelmed";
  } else if (lower.includes("distante") || lower.includes("afastado") || lower.includes("longe")) {
    return "distant";
  } else if (lower.includes("confuso") || lower.includes("dúvida") || lower.includes("incerto")) {
    return "confused";
  } else if (lower.includes("fraco") || lower.includes("fraqueza") || lower.includes("sem força")) {
    return "weak";
  } else if (lower.includes("perdido") || lower.includes("sem rumo") || lower.includes("desorientado")) {
    return "lost";
  } else if (lower.includes("seco") || lower.includes("vazio") || lower.includes("árido")) {
    return "dry";
  }
  
  return "general";
};

/**
 * Headlines personalizadas por perfil
 * Objetivo: Gerar identificação imediata
 */
const getHeadline = (profileType: string, profileName: string): string => {
  const headlines: Record<string, string> = {
    overwhelmed: "Você está tão cansado que não consegue nem orar mais?",
    distant: "Sente que Deus está em silêncio na sua vida?",
    confused: "Não sabe mais qual caminho seguir com Deus?",
    weak: "Perdeu aquela força que tinha para enfrentar a vida?",
    lost: "Se sente completamente perdido espiritualmente?",
    dry: "Seu coração está seco e vazio de fé?",
    general: "Seu espírito está pedindo por algo que você não consegue nomear?",
  };
  
  return headlines[profileType] || headlines.general;
};

/**
 * Mensagens de identificação
 * Objetivo: Validar o sentimento e criar conexão
 */
const getIdentification = (profileType: string, userName: string): string => {
  const identifications: Record<string, string> = {
    overwhelmed: `${userName}, você não está sozinho nesse cansaço. Milhares de cristãos carregam esse peso todos os dias. Mas aqui está a verdade: Deus nunca pediu para você carregar tudo sozinho.`,
    distant: `${userName}, essa distância que você sente? Muitos cristãos sinceros passam por isso. E o pior é que quanto mais distante você fica, mais difícil parece voltar. Mas não é.`,
    confused: `${userName}, essa confusão espiritual que você sente? Não é fraqueza. É um sinal de que você está buscando verdadeiramente. E Deus honra quem busca.`,
    weak: `${userName}, essa fraqueza que você sente? Não é porque você não é digno. É porque você esqueceu da fonte de força real: Deus.`,
    lost: `${userName}, estar perdido espiritualmente é mais comum do que você pensa. Mas a boa notícia é que Deus nunca perde ninguém. Ele está aqui, esperando você encontrar o caminho.`,
    dry: `${userName}, esse vazio que você sente? Não é porque Deus se afastou. É porque você precisa se reconectar com a fonte de vida real.`,
    general: `${userName}, você não está sozinho nesse sentimento. Muitos cristãos sinceros passam por exatamente o que você está vivendo agora.`,
  };
  
  return identifications[profileType] || identifications.general;
};

/**
 * Escalação de dor
 * Objetivo: Criar urgência sem parecer exagerado
 */
const getPainEscalation = (profileType: string): string => {
  const pains: Record<string, string> = {
    overwhelmed: `Sem um plano claro, esse cansaço vai piorar. Você vai acordar em 3 meses e perceber que está ainda mais esgotado. Que aquela alegria de servir a Deus desapareceu. Que você virou apenas um robô cumprindo obrigações.`,
    distant: `Sem um caminho de volta, essa distância vai aumentar. Os meses passam. Você se afasta mais. E de repente, você percebe que Deus virou um estranho na sua vida.`,
    confused: `Sem clareza, essa confusão vai aumentar. Você fica preso em dúvidas. Sem saber qual caminho seguir. E cada dia que passa, mais difícil fica voltar.`,
    weak: `Sem força espiritual, essa fraqueza vai aumentar. Você vai acordar em poucos meses e perceber que perdeu a fé que tinha. Que aquela força para enfrentar a vida desapareceu.`,
    lost: `Sem um caminho claro, você vai ficar ainda mais perdido. Os meses passam. A distância de Deus aumenta. E de repente você percebe que se afastou demais.`,
    dry: `Sem água viva, esse vazio vai aumentar. Você vai ficar cada vez mais seco. Cada vez mais distante. Até que um dia você não consegue nem lembrar por que acreditava em Deus.`,
    general: `Sem direcionamento, essa situação espiritual tende a piorar. Você pode acordar em 6 meses e perceber que se afastou ainda mais de Deus.`,
  };
  
  return pains[profileType] || pains.general;
};

/**
 * Mensagem de esperança
 * Objetivo: Virada emocional (de dor para solução)
 */
const getHope = (profileType: string): string => {
  const hopes: Record<string, string> = {
    overwhelmed: "Mas aqui está a verdade: você não precisa fazer isso sozinho. Existe um caminho simples, prático e que realmente funciona.",
    distant: "Mas aqui está a boa notícia: Deus nunca se afastou de você. Ele está esperando você voltar. E o caminho é mais simples do que você pensa.",
    confused: "Mas aqui está a verdade: Deus não quer deixar você confuso. Ele quer guiar seus passos. E Ele tem um plano claro para você.",
    weak: "Mas aqui está a verdade: sua fraqueza não é o fim. É o começo. Porque quando você reconhece sua fraqueza, Deus pode mostrar Sua força.",
    lost: "Mas aqui está a verdade: você não está tão perdido quanto pensa. Deus sabe exatamente onde você está. E Ele tem um caminho marcado para você voltar.",
    dry: "Mas aqui está a verdade: aquela água viva que você sente falta? Ela ainda está disponível. Você só precisa saber como beber dela novamente.",
    general: "Mas aqui está a boa notícia: isso tem solução. E a solução é mais simples do que você pensa.",
  };
  
  return hopes[profileType] || hopes.general;
};

/**
 * Benefícios personalizados
 * Objetivo: Mostrar exatamente o que a pessoa vai ganhar
 */
const getBenefits = (profileType: string): string[] => {
  const benefitsByProfile: Record<string, string[]> = {
    overwhelmed: [
      "✨ Saber exatamente o que fazer cada dia — sem culpa, sem pressão",
      "💎 Sentir aquele descanso em Deus que você tanto precisa",
      "🙏 Recuperar a alegria de servir a Deus",
      "📖 Versículos que falam direto com seu cansaço",
      "⚡ Voltar a ter energia espiritual em 7 dias",
    ],
    distant: [
      "✨ Saber exatamente como voltar para Deus",
      "💎 Sentir a presença de Deus novamente",
      "🙏 Recuperar aquela intimidade que você sente falta",
      "📖 Versículos que trazem Deus perto de você",
      "⚡ Transformação real em 7 dias",
    ],
    confused: [
      "✨ Ter clareza sobre qual caminho seguir",
      "💎 Entender a vontade de Deus para sua vida",
      "🙏 Ter segurança nas suas decisões espirituais",
      "📖 Versículos que trazem luz à sua confusão",
      "⚡ Sair da confusão em 7 dias",
    ],
    weak: [
      "✨ Recuperar a força espiritual que você tinha",
      "💎 Sentir o poder de Deus operando em você",
      "🙏 Ter coragem para enfrentar a vida",
      "📖 Versículos que renovam sua força",
      "⚡ Voltar a ser forte em 7 dias",
    ],
    lost: [
      "✨ Encontrar o caminho de volta para Deus",
      "💎 Ter direção clara para sua vida",
      "🙏 Recuperar o propósito que você perdeu",
      "📖 Versículos que apontam o caminho",
      "⚡ Sair da perdição em 7 dias",
    ],
    dry: [
      "✨ Beber da água viva novamente",
      "💎 Sentir o coração cheio de fé",
      "🙏 Recuperar a vida espiritual que você tinha",
      "📖 Versículos que hidratam sua alma",
      "⚡ Voltar a ter vida em 7 dias",
    ],
    general: [
      "✨ Saber exatamente o que fazer cada dia",
      "💎 Sinta a presença de Deus voltando",
      "🙏 Tenha uma rotina espiritual que funciona",
      "📖 Versículos que falam direto com seu coração",
      "⚡ Transformação real em 7 dias",
    ],
  };
  
  return benefitsByProfile[profileType] || benefitsByProfile.general;
};

/**
 * Prova social dinâmica
 * Objetivo: Criar confiança
 */
const getSocialProof = (profileType: string): string => {
  const proofs: Record<string, string> = {
    overwhelmed: "Milhares de cristãos cansados já recuperaram sua paz com esse plano.",
    distant: "Milhares de cristãos distantes já encontraram o caminho de volta.",
    confused: "Milhares de cristãos confusos já encontraram clareza.",
    weak: "Milhares de cristãos fracos já recuperaram sua força.",
    lost: "Milhares de cristãos perdidos já encontraram seu caminho.",
    dry: "Milhares de cristãos secos já beberam da água viva novamente.",
    general: "Milhares de pessoas já fizeram esse diagnóstico e transformaram sua vida espiritual.",
  };
  
  return proofs[profileType] || proofs.general;
};

/**
 * Mensagem de urgência personalizada
 * Objetivo: Criar senso de perda sem parecer manipulador
 */
const getUrgency = (profileType: string): string => {
  const urgencies: Record<string, string> = {
    overwhelmed: "Esse plano foi criado especialmente para você. Se você sair agora, pode perder essa chance de descansar em Deus.",
    distant: "Esse caminho de volta foi mapeado especialmente para você. Se você sair agora, pode ficar ainda mais distante.",
    confused: "Essa clareza foi gerada especialmente para você. Se você sair agora, pode ficar preso na confusão.",
    weak: "Essa força foi preparada especialmente para você. Se você sair agora, pode ficar ainda mais fraco.",
    lost: "Esse caminho foi marcado especialmente para você. Se você sair agora, pode se perder ainda mais.",
    dry: "Essa água viva foi oferecida especialmente para você. Se você sair agora, pode continuar seco.",
    general: "Esse direcionamento foi criado especialmente para você. Se você sair agora, pode perder essa chance.",
  };
  
  return urgencies[profileType] || urgencies.general;
};

/**
 * CTA primário (botão principal)
 * Objetivo: Ação clara e emocional
 */
const getCtaPrimary = (profileType: string): string => {
  const ctas: Record<string, string> = {
    overwhelmed: "Quero descansar em Deus agora",
    distant: "Quero voltar para Deus agora",
    confused: "Quero ter clareza agora",
    weak: "Quero recuperar minha força agora",
    lost: "Quero encontrar meu caminho agora",
    dry: "Quero beber da água viva agora",
    general: "Quero me reconectar com Deus agora",
  };
  
  return ctas[profileType] || ctas.general;
};

/**
 * Declaração de encerramento
 * Objetivo: Inspirar confiança e ação
 */
const getClosing = (profileType: string): string => {
  const closings: Record<string, string> = {
    overwhelmed: "Imagine como seria acordar amanhã sem esse peso. Sentir o descanso em Deus. Ter paz de novo. Isso pode começar hoje.",
    distant: "Imagine como seria sentir Deus perto de você novamente. Aquela intimidade que você sente falta. Isso pode começar hoje.",
    confused: "Imagine como seria ter clareza. Saber exatamente qual caminho seguir. Ter segurança nas suas decisões. Isso pode começar hoje.",
    weak: "Imagine como seria ter força de novo. Coragem para enfrentar a vida. Poder em Deus. Isso pode começar hoje.",
    lost: "Imagine como seria encontrar seu caminho. Ter direção. Ter propósito de novo. Isso pode começar hoje.",
    dry: "Imagine como seria ter vida de novo. Sentir o coração cheio. Beber da água viva. Isso pode começar hoje.",
    general: "Imagine como seria acordar amanhã com clareza. Sentir Deus perto de você novamente. Ter uma direção, um propósito, uma paz que você não sente há tempo. Isso pode começar hoje.",
  };
  
  return closings[profileType] || closings.general;
};

/**
 * Função principal que gera todo o copywriting
 */
export const generateConversionCopy = (
  profileName: string,
  profileDescription: string,
  challenges: string[],
  userName: string
): ConversionCopy => {
  const profileType = getProfileType(profileName);
  
  return {
    headline: getHeadline(profileType, profileName),
    identification: getIdentification(profileType, userName),
    painEscalation: getPainEscalation(profileType),
    hope: getHope(profileType),
    productTitle: "Um Plano Espiritual Guiado de 7 Dias",
    productDescription: `Este não é um devocional comum. É um plano criado especialmente para VOCÊ, baseado no seu diagnóstico espiritual. Cada dia foi pensado para levar você de volta à presença de Deus, passo a passo, sem pressa, sem julgamento.`,
    benefits: getBenefits(profileType),
    socialProof: getSocialProof(profileType),
    urgencyMessage: getUrgency(profileType),
    ctaPrimary: getCtaPrimary(profileType),
    ctaSecondary: "Quero meu plano espiritual agora",
    closingStatement: getClosing(profileType),
  };
};
