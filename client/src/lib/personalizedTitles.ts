/**
 * Sistema de Títulos 100% Personalizados
 * Gera títulos únicos baseado nos desafios específicos do quiz
 */

export function generatePersonalizedTitle(
  profileName: string,
  challenges: string[],
  userName: string
): string {
  const profile = profileName.toLowerCase();

  if (profile.includes("sobrecarregado")) {
    return generateOverwhelmedTitle(challenges, userName);
  } else if (profile.includes("distante")) {
    return generateDistantTitle(challenges, userName);
  } else if (profile.includes("confuso")) {
    return generateConfusedTitle(challenges, userName);
  } else if (profile.includes("fraco")) {
    return generateWeakTitle(challenges, userName);
  } else if (profile.includes("perdido")) {
    return generateLostTitle(challenges, userName);
  } else if (profile.includes("seco")) {
    return generateDryTitle(challenges, userName);
  }

  return generateGeneralTitle(challenges, userName);
}

function generateOverwhelmedTitle(challenges: string[], userName: string): string {
  const challengeMap: Record<string, string> = {
    "falta de tempo para oração": `${userName}, você não tem tempo nem para respirar.`,
    "dificuldade em manter disciplina": `${userName}, você começou bem, mas não consegue manter.`,
    "sensação de culpa": `${userName}, a culpa não te deixa em paz.`,
    "cansaço espiritual": `${userName}, você está queimado por dentro.`,
    "pressão para ser perfeito": `${userName}, você nunca é suficiente.`,
    "falta de paz": `${userName}, a paz desapareceu da sua vida.`,
  };

  const mainChallenge = challenges[0]?.toLowerCase() || "";
  
  for (const [key, title] of Object.entries(challengeMap)) {
    if (mainChallenge.includes(key)) {
      return `${title}\n\nE isso está destruindo sua alma.\n\nMas você continua fingindo que está tudo bem.`;
    }
  }

  return `${userName}, você está fazendo tudo certo.\n\nMas está tudo errado.\n\nPorque você está fazendo TUDO.`;
}

function generateDistantTitle(challenges: string[], userName: string): string {
  const challengeMap: Record<string, string> = {
    "dúvidas sobre fé": `${userName}, você não sabe mais se acredita.`,
    "sensação de abandono": `${userName}, sente que Deus te abandonou.`,
    "falta de conexão": `${userName}, não consegue se conectar com Deus.`,
    "decepção com Deus": `${userName}, Deus não fez o que você esperava.`,
    "distância emocional": `${userName}, há uma parede entre você e Deus.`,
    "falta de presença": `${userName}, você não sente Deus mais.`,
  };

  const mainChallenge = challenges[0]?.toLowerCase() || "";
  
  for (const [key, title] of Object.entries(challengeMap)) {
    if (mainChallenge.includes(key)) {
      return `${title}\n\nE você não sabe como voltar.\n\nMas sente que precisa.`;
    }
  }

  return `${userName}, Deus está em silêncio.\n\nE você não sabe por quê.\n\nMas você sente que algo está errado.`;
}

function generateConfusedTitle(challenges: string[], userName: string): string {
  const challengeMap: Record<string, string> = {
    "falta de direção": `${userName}, você não sabe qual caminho seguir.`,
    "indecisão": `${userName}, você fica preso analisando tudo.`,
    "confusão espiritual": `${userName}, tudo parece confuso e contraditório.`,
    "falta de clareza": `${userName}, você não consegue ver com clareza.`,
    "paralisia": `${userName}, você está paralisado pela indecisão.`,
    "múltiplas vozes": `${userName}, cada pessoa diz uma coisa diferente.`,
  };

  const mainChallenge = challenges[0]?.toLowerCase() || "";
  
  for (const [key, title] of Object.entries(challengeMap)) {
    if (mainChallenge.includes(key)) {
      return `${title}\n\nE cada dia que passa, a paralisia aumenta.\n\nVocê está preso.`;
    }
  }

  return `${userName}, você está preso.\n\nNão sabe qual caminho seguir.\n\nE cada dia que passa, a paralisia aumenta.`;
}

function generateWeakTitle(challenges: string[], userName: string): string {
  const challengeMap: Record<string, string> = {
    "queda em tentações": `${userName}, você caiu novamente.`,
    "falta de força": `${userName}, você perdeu sua força.`,
    "ciclo de fracasso": `${userName}, você está em um ciclo que não consegue sair.`,
    "culpa": `${userName}, a culpa está te destruindo.`,
    "fraqueza": `${userName}, você se sente tão fraco.`,
    "falta de vitória": `${userName}, você não consegue vencer.`,
  };

  const mainChallenge = challenges[0]?.toLowerCase() || "";
  
  for (const [key, title] of Object.entries(challengeMap)) {
    if (mainChallenge.includes(key)) {
      return `${title}\n\nE cada dia fica mais fraco.\n\nMas você não sabe por quê.`;
    }
  }

  return `${userName}, você perdeu sua força.\n\nE cada dia fica mais fraco.\n\nMas você não sabe por quê.`;
}

function generateLostTitle(challenges: string[], userName: string): string {
  const challengeMap: Record<string, string> = {
    "perda de identidade": `${userName}, você não sabe mais quem é.`,
    "desorientação": `${userName}, você está completamente perdido.`,
    "falta de propósito": `${userName}, você não sabe mais para onde ir.`,
    "confusão de valores": `${userName}, você não sabe mais o que acredita.`,
    "afastamento de si": `${userName}, você se perdeu de si mesmo.`,
    "falta de rumo": `${userName}, você não tem mais direção.`,
  };

  const mainChallenge = challenges[0]?.toLowerCase() || "";
  
  for (const [key, title] of Object.entries(challengeMap)) {
    if (mainChallenge.includes(key)) {
      return `${title}\n\nMuito perdido.\n\nE não sabe como voltar para casa.`;
    }
  }

  return `${userName}, você está perdido.\n\nMuito perdido.\n\nE não sabe como voltar para casa.`;
}

function generateDryTitle(challenges: string[], userName: string): string {
  const challengeMap: Record<string, string> = {
    "falta de emoção espiritual": `${userName}, você não sente mais nada.`,
    "vazio espiritual": `${userName}, há um vazio dentro de você.`,
    "falta de vida": `${userName}, sua fé não tem mais vida.`,
    "ressecamento": `${userName}, sua fé secou completamente.`,
    "falta de paixão": `${userName}, você perdeu a paixão pela fé.`,
    "morte espiritual": `${userName}, você se sente espiritualmente morto.`,
  };

  const mainChallenge = challenges[0]?.toLowerCase() || "";
  
  for (const [key, title] of Object.entries(challengeMap)) {
    if (mainChallenge.includes(key)) {
      return `${title}\n\nSua fé secou.\n\nE você não sabe como regar novamente.`;
    }
  }

  return `${userName}, você está vazio.\n\nSua fé secou.\n\nE você não sabe como regar novamente.`;
}

function generateGeneralTitle(challenges: string[], userName: string): string {
  const challengeMap: Record<string, string> = {
    "falta de profundidade": `${userName}, sua fé é apenas superficial.`,
    "falta de conexão": `${userName}, você não consegue se conectar.`,
    "vazio": `${userName}, há um vazio que você não consegue preencher.`,
    "confusão": `${userName}, tudo parece confuso.`,
    "distância": `${userName}, você sente uma distância crescente.`,
    "fraqueza": `${userName}, você se sente fraco.`,
  };

  const mainChallenge = challenges[0]?.toLowerCase() || "";
  
  for (const [key, title] of Object.entries(challengeMap)) {
    if (mainChallenge.includes(key)) {
      return `${title}\n\nVocê sente isso.\n\nMas não sabe exatamente o quê.`;
    }
  }

  return `${userName}, algo não está bem.\n\nVocê sente isso.\n\nMas não sabe exatamente o quê.`;
}
