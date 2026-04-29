/**
 * Gera um texto emocional personalizado de até 3 linhas
 * que cria conexão e emoção após o perfil espiritual
 * Baseado nas respostas específicas do quiz
 */

interface PersonalizedMicrocopyParams {
  profileName: string;
  currentState: string;
  mainDifficulty: string;
  missingWithGod: string;
  desireWithGod: string;
  spiritualSelfDescription: string;
  additionalContext?: string;
}

const normalizeText = (text: string): string => text.trim().toLowerCase();

export function generateProfileEmotionalMicrocopy(params: PersonalizedMicrocopyParams): string {
  const {
    profileName,
    currentState,
    mainDifficulty,
    missingWithGod,
    desireWithGod,
    spiritualSelfDescription,
    additionalContext,
  } = params;

  const normalized = {
    profile: normalizeText(profileName),
    state: normalizeText(currentState),
    difficulty: normalizeText(mainDifficulty),
    missing: normalizeText(missingWithGod),
    desire: normalizeText(desireWithGod),
    selfDesc: normalizeText(spiritualSelfDescription),
    context: normalizeText(additionalContext || ""),
  };

  // Perfil: Espiritualmente Cansado(a)
  if (normalized.profile.includes("cansado")) {
    if (normalized.missing.includes("paz")) {
      return "Esse cansaço que você sente é real, mas não é o fim.\nDeus vê cada passo que você dá, mesmo quando falta energia.\nVocê merece encontrar paz novamente.";
    }
    if (normalized.difficulty.includes("emocional")) {
      return "O peso emocional que carrega não define quem você é em Deus.\nSua luta é conhecida por Ele, e Ele quer restaurar sua força.\nVocê não está sozinho nesse cansaço.";
    }
    if (normalized.desire.includes("força")) {
      return "Esse desejo de força que você sente vem do Espírito Santo em você.\nDeus promete renovar as forças dos que nele esperam.\nSeu cansaço pode se transformar em descanso verdadeiro.";
    }
    return "Seu cansaço espiritual é um sinal de que você realmente se importa com Deus.\nEle vê sua sinceridade e quer restaurar sua alegria.\nNão desista agora, Ele está ao seu lado.";
  }

  // Perfil: Espiritualmente Travado(a)
  if (normalized.profile.includes("travado")) {
    if (normalized.difficulty.includes("direção")) {
      return "Essa sensação de estar travado não é fraqueza, é um convite para confiar.\nDeus pode abrir caminhos que você não consegue ver agora.\nSua libertação começa quando você entrega esse peso a Ele.";
    }
    if (normalized.desire.includes("liberdade")) {
      return "O desejo de liberdade que você sente é legítimo e vem de Deus.\nEle não quer você preso, quer você livre em Sua graça.\nEssa transformação é possível, e começa agora.";
    }
    return "Aquilo que te trava hoje não define seu futuro com Deus.\nEle vê seu coração e quer te libertar dessa paralisia.\nSeu primeiro passo é reconhecer que precisa de Sua ajuda.";
  }

  // Perfil: Espiritualmente em Recomeço
  if (normalized.profile.includes("recomeço")) {
    if (normalized.desire.includes("reconstruir") || normalized.desire.includes("voltar")) {
      return "Recomçar é um ato de coragem que Deus honra profundamente.\nCada novo dia é uma oportunidade de se reconectar com Ele.\nSua volta não é fracasso, é um retorno ao amor de Deus.";
    }
    if (normalized.missing.includes("intimidade")) {
      return "Essa intimidade que você sente falta é exatamente o que Deus quer restaurar.\nEle nunca se afastou de você, apenas esperava seu retorno.\nAgora é o momento de reconstruir essa relação sagrada.";
    }
    return "Seu recomeço espiritual é um presente de Deus para você.\nEle celebra cada passo que você dá em Sua direção.\nSua jornada de volta é tão importante quanto a primeira vez.";
  }

  // Perfil: Espiritualmente Amadurecendo
  if (normalized.profile.includes("amadurecendo")) {
    if (normalized.desire.includes("profundidade")) {
      return "Seu amadurecimento espiritual é fruto de uma entrega genuína.\nDeus está refinando sua fé para um propósito maior.\nContinue nessa jornada de crescimento, Ele está guiando cada passo.";
    }
    if (normalized.missing.includes("sabedoria")) {
      return "A sabedoria que você busca vem de uma relação profunda com Deus.\nSeu amadurecimento é uma bênção que impacta quem está ao seu redor.\nContinue buscando conhecê-Lo cada vez mais.";
    }
    return "Seu amadurecimento espiritual é uma bênção que Deus está cultivando.\nEle confia em você para crescer e impactar outros.\nContinue firme nessa jornada de transformação contínua.";
  }

  // Perfil: Espiritualmente Instável
  if (normalized.profile.includes("instável")) {
    if (normalized.difficulty.includes("constância")) {
      return "Sua inconsistência não é fracasso, é um convite para estabelecer raízes.\nDeus quer você firme, não flutuando de um lado para o outro.\nCada dia é uma nova chance de construir uma rotina que te aproxima Dele.";
    }
    if (normalized.desire.includes("estabilidade")) {
      return "Esse desejo de estabilidade que você sente é do Espírito Santo.\nDeus oferece uma base sólida para sua vida espiritual.\nSua transformação começa quando você decide ser consistente.";
    }
    return "Sua instabilidade espiritual é um sinal de que você precisa de uma base mais sólida.\nDeus quer estabelecer você em Sua verdade e constância.\nCom Ele, você pode construir uma fé que não balança.";
  }

  // Perfil: Espiritualmente em Crescimento (padrão)
  if (normalized.desire.includes("profundidade")) {
    return "Seu desejo de crescimento espiritual agrada a Deus profundamente.\nEle quer que você conheça Sua verdade cada vez mais.\nContinue buscando, porque Ele está sempre disponível para você.";
  }

  if (normalized.missing.includes("intimidade")) {
    return "A intimidade com Deus que você sente falta é o que Ele mais deseja com você.\nEssa sede espiritual é um convite para se aproximar mais Dele.\nSeu crescimento começa quando você responde a esse chamado.";
  }

  // Fallback genérico emocional
  return "Sua sinceridade ao reconhecer onde você está espiritualmente agrada a Deus.\nEle vê seu coração e quer caminhar com você nessa jornada.\nO que você está vivendo agora é apenas o começo de uma transformação profunda.";
}

/**
 * Extrai os dados necessários das respostas do quiz
 * para gerar o microcopy emocional
 */
export function extractMicrocopyData(
  responses: Record<string, string> | null,
  profileName: string,
): PersonalizedMicrocopyParams | null {
  if (!responses) {
    return null;
  }

  const readResponse = (numericKey: string, stepKey: string): string => {
    return (responses[stepKey] ?? responses[numericKey] ?? "").trim();
  };

  return {
    profileName,
    currentState: readResponse("1", "step2"),
    mainDifficulty: readResponse("2", "step3"),
    missingWithGod: readResponse("5", "step6"),
    desireWithGod: readResponse("7", "step8"),
    spiritualSelfDescription: readResponse("10", "step11"),
    additionalContext: readResponse("11", "step12"),
  };
}
