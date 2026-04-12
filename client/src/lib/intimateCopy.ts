/**
 * Sistema de copywriting com tom de conversa íntima
 * Foco em conexão emocional profunda antes da venda
 * Parece uma conversa real, não um anúncio
 */

export interface IntimatePageCopy {
  opening: string;
  identification: string;
  revelation: string;
  painReality: string;
  comfort: string;
  hope: string;
  solutionIntro: string;
  benefits: string[];
  urgency: string;
  ctaPrimary: string;
  priceMessage: string;
  closingThought: string;
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
 * Abertura (conexão forte)
 * Como se estivesse conversando diretamente
 */
const getOpening = (profileType: string, userName: string): string => {
  const openings: Record<string, string> = {
    overwhelmed: `${userName}, eu preciso te falar uma coisa…\n\nO que apareceu no seu resultado… não é por acaso.\n\nEu vejo em você alguém que tenta. Que realmente tenta.`,
    distant: `${userName}, eu preciso te falar uma coisa…\n\nO que apareceu no seu resultado… não é por acaso.\n\nEu vejo em você alguém que sente falta. Que sente essa distância.`,
    confused: `${userName}, eu preciso te falar uma coisa…\n\nO que apareceu no seu resultado… não é por acaso.\n\nEu vejo em você alguém que busca. Que quer entender.`,
    weak: `${userName}, eu preciso te falar uma coisa…\n\nO que apareceu no seu resultado… não é por acaso.\n\nEu vejo em você alguém que perdeu a força. Mas que ainda quer lutar.`,
    lost: `${userName}, eu preciso te falar uma coisa…\n\nO que apareceu no seu resultado… não é por acaso.\n\nEu vejo em você alguém que se perdeu. Mas que ainda está procurando.`,
    dry: `${userName}, eu preciso te falar uma coisa…\n\nO que apareceu no seu resultado… não é por acaso.\n\nEu vejo em você alguém que sente o vazio. Que sente falta de vida.`,
    general: `${userName}, eu preciso te falar uma coisa…\n\nO que apareceu no seu resultado… não é por acaso.\n\nEu vejo em você alguém que está buscando. De verdade.`,
  };
  
  return openings[profileType] || openings.general;
};

/**
 * Identificação profunda
 * Descrever sentimentos reais que a pessoa vive
 */
const getIdentification = (profileType: string): string => {
  const identifications: Record<string, string> = {
    overwhelmed: `Você tenta manter a rotina espiritual.\n\nTenta orar, tenta ler a Bíblia, tenta estar perto de Deus.\n\nMas é tão cansativo.\n\nE no final do dia, você fica vazio. Como se tivesse dado tudo e ainda assim não fosse o suficiente.\n\nE isso começa a pesar dentro de você.`,
    distant: `Você sente que Deus deveria estar perto.\n\nVocê sabe que Ele está perto.\n\nMas por alguma razão… você não consegue sentir isso.\n\nÉ como se houvesse uma parede entre você e Ele.\n\nE quanto mais tempo passa, mais grossa fica essa parede.`,
    confused: `Você quer fazer a coisa certa.\n\nMas não sabe qual é a coisa certa.\n\nUm dia você pensa de um jeito, no outro dia acha que estava errado.\n\nE essa confusão… ela te paralisa.\n\nVocê quer avançar, mas não sabe para onde ir.`,
    weak: `Você se lembra de quando tinha força.\n\nQuando conseguia enfrentar as coisas.\n\nMas agora… você se sente fraco.\n\nComo se tivesse perdido a bateria que te alimentava.\n\nE isso é assustador.`,
    lost: `Você se perdeu em algum lugar.\n\nNão sabe bem quando aconteceu.\n\nMas de repente você olha para trás e percebe que está longe.\n\nMuito longe.\n\nE não sabe como voltar.`,
    dry: `Você sente um vazio.\n\nNão é depressão. Não é tristeza.\n\nÉ um vazio espiritual.\n\nComo se a água que alimentava sua alma tivesse secado.\n\nE você não consegue encontrar a fonte novamente.`,
    general: `Você sente que algo está faltando.\n\nNão consegue nomear direito.\n\nMas sabe que está faltando.\n\nE essa sensação… ela não sai de você.`,
  };
  
  return identifications[profileType] || identifications.general;
};

/**
 * Revelação
 * Falar do diagnóstico como algo pessoal e específico
 */
const getRevelation = (profileType: string, profileDescription: string): string => {
  const revelations: Record<string, string> = {
    overwhelmed: `E sabe o que o seu resultado mostrou?\n\nQue você está vivendo uma sobrecarga espiritual real.\n\nNão é fraqueza sua. Não é falta de fé.\n\nÉ que você está carregando um peso que não foi feito para você carregar sozinho.`,
    distant: `E sabe o que o seu resultado mostrou?\n\nQue você está vivendo uma distância real de Deus.\n\nNão é imaginação sua. Não é culpa sua.\n\nÉ que você se afastou… e agora não consegue encontrar o caminho de volta.`,
    confused: `E sabe o que o seu resultado mostrou?\n\nQue você está vivendo uma confusão espiritual real.\n\nNão é falta de inteligência. Não é falta de fé.\n\nÉ que você está perdido em um labirinto… e não consegue ver a saída.`,
    weak: `E sabe o que o seu resultado mostrou?\n\nQue você está vivendo uma fraqueza espiritual real.\n\nNão é fraqueza de caráter. Não é falta de coragem.\n\nÉ que você perdeu a conexão com a fonte de força que te alimentava.`,
    lost: `E sabe o que o seu resultado mostrou?\n\nQue você está vivendo uma perdição real.\n\nNão é porque você não tentou. Não é porque você não acreditou.\n\nÉ que você se perdeu… e agora está buscando o caminho.`,
    dry: `E sabe o que o seu resultado mostrou?\n\nQue você está vivendo uma secura espiritual real.\n\nNão é porque você não merece. Não é porque Deus se afastou.\n\nÉ que você precisa beber da água viva novamente.`,
    general: `E sabe o que o seu resultado mostrou?\n\nQue você está vivendo algo real.\n\nAlgo que muitas pessoas vivem.\n\nMas que poucos conseguem nomear.`,
  };
  
  return revelations[profileType] || revelations.general;
};

/**
 * Dor real (sem exagero)
 * Mostrar consequência emocional de forma humana
 */
const getPainReality = (profileType: string): string => {
  const pains: Record<string, string> = {
    overwhelmed: `E se você continuar assim?\n\nVocê vai acordar daqui a alguns meses e perceber que está ainda mais cansado.\n\nQue aquela alegria de servir a Deus desapareceu.\n\nQue você virou só um robô cumprindo obrigações.\n\nE Deus… Deus vai parecer ainda mais distante.`,
    distant: `E se você continuar assim?\n\nVocê vai acordar daqui a alguns meses e perceber que está ainda mais longe.\n\nQue Deus virou um estranho na sua vida.\n\nQue aquela intimidade que você tinha… se foi.\n\nE recuperar isso vai ser ainda mais difícil.`,
    confused: `E se você continuar assim?\n\nVocê vai ficar preso em dúvidas.\n\nSem saber qual caminho seguir.\n\nParalisado.\n\nE cada dia que passa, mais difícil fica sair dessa confusão.`,
    weak: `E se você continuar assim?\n\nVocê vai ficar ainda mais fraco.\n\nVai desistir das coisas que importam.\n\nVai deixar de lutar.\n\nE um dia você vai olhar para trás e não vai reconhecer quem você virou.`,
    lost: `E se você continuar assim?\n\nVocê vai ficar ainda mais perdido.\n\nVai se afastar mais.\n\nE um dia você vai acordar e perceber que se perdeu de verdade.\n\nQue não sabe mais onde fica a volta.`,
    dry: `E se você continuar assim?\n\nVocê vai ficar ainda mais seco.\n\nAinda mais vazio.\n\nAté que um dia você não consegue nem lembrar por que acreditava em Deus.\n\nE aí fica muito mais difícil.`,
    general: `E se você continuar assim?\n\nEssa sensação vai crescer.\n\nVocê vai se afastar mais.\n\nE um dia você vai perceber que perdeu algo muito importante.`,
  };
  
  return pains[profileType] || pains.general;
};

/**
 * Acolhimento (MUITO IMPORTANTE)
 * Validar e confortar
 */
const getComfort = (profileType: string): string => {
  const comforts: Record<string, string> = {
    overwhelmed: `Mas espera.\n\nAntes de você se desesperar… eu preciso te dizer uma coisa importante.\n\nIsso que você está sentindo? Não é culpa sua.\n\nMuitos cristãos sinceros… pessoas que realmente amam Deus… passam por isso.\n\nVocê não está sozinho.`,
    distant: `Mas espera.\n\nAntes de você desistir… eu preciso te dizer uma coisa importante.\n\nEssa distância que você sente? Não é porque Deus se afastou.\n\nMuitos cristãos sinceros… pessoas que realmente amam Deus… passam por isso.\n\nVocê não está sozinho.`,
    confused: `Mas espera.\n\nAntes de você desistir… eu preciso te dizer uma coisa importante.\n\nEssa confusão que você sente? Não é fraqueza.\n\nMuitos cristãos sinceros… pessoas que realmente buscam Deus… passam por isso.\n\nVocê não está sozinho.`,
    weak: `Mas espera.\n\nAntes de você desistir… eu preciso te dizer uma coisa importante.\n\nEssa fraqueza que você sente? Não é porque você não é digno.\n\nMuitos cristãos sinceros… pessoas que realmente lutam… passam por isso.\n\nVocê não está sozinho.`,
    lost: `Mas espera.\n\nAntes de você desistir… eu preciso te dizer uma coisa importante.\n\nEstar perdido? Não é o fim.\n\nMuitos cristãos sinceros… pessoas que realmente buscam Deus… passam por isso.\n\nVocê não está sozinho.`,
    dry: `Mas espera.\n\nAntes de você desistir… eu preciso te dizer uma coisa importante.\n\nEsse vazio que você sente? Não é porque você não merece.\n\nMuitos cristãos sinceros… pessoas que realmente amam Deus… passam por isso.\n\nVocê não está sozinho.`,
    general: `Mas espera.\n\nAntes de você desistir… eu preciso te dizer uma coisa importante.\n\nO que você está sentindo? Não é raro.\n\nMuitos cristãos sinceros passam por isso.\n\nVocê não está sozinho.`,
  };
  
  return comforts[profileType] || comforts.general;
};

/**
 * Esperança (virada emocional)
 * Trazer alívio e possibilidade
 */
const getHope = (profileType: string): string => {
  const hopes: Record<string, string> = {
    overwhelmed: `E aqui está o mais importante:\n\nIsso pode mudar.\n\nNão precisa ser complicado.\n\nNão precisa de grandes sacrifícios.\n\nVocê só precisa de um caminho claro. Um passo de cada vez.`,
    distant: `E aqui está o mais importante:\n\nVocê pode voltar.\n\nDeus nunca se afastou de você.\n\nEle está aqui, esperando você encontrar o caminho de volta.\n\nE esse caminho é mais simples do que você pensa.`,
    confused: `E aqui está o mais importante:\n\nVocê pode ter clareza.\n\nDeus quer guiar seus passos.\n\nVocê só precisa de um caminho que mostre a direção.\n\nUm passo de cada vez.`,
    weak: `E aqui está o mais importante:\n\nVocê pode recuperar sua força.\n\nNão é sobre força própria.\n\nÉ sobre se reconectar com a fonte de força que te alimenta.\n\nE isso é possível.`,
    lost: `E aqui está o mais importante:\n\nVocê pode encontrar o caminho.\n\nDeus sabe exatamente onde você está.\n\nEle tem um caminho marcado para você voltar.\n\nVocê só precisa dar o primeiro passo.`,
    dry: `E aqui está o mais importante:\n\nVocê pode beber da água viva novamente.\n\nEssa água que você sente falta? Ela ainda está disponível.\n\nVocê só precisa saber como encontrá-la.\n\nE isso é possível.`,
    general: `E aqui está o mais importante:\n\nIsso pode mudar.\n\nVocê não precisa continuar assim.\n\nExiste um caminho.\n\nE você está no lugar certo para encontrá-lo.`,
  };
  
  return hopes[profileType] || hopes.general;
};

/**
 * Introdução da solução
 * Apresentar como algo simples e pessoal
 */
const getSolutionIntro = (profileType: string, userName: string): string => {
  return `Por isso eu criei algo especialmente para você, ${userName}.\n\nNão é um devocional genérico.\n\nNão é mais uma lista de coisas para fazer.\n\nÉ um plano espiritual de 7 dias.\n\nFeito para VOCÊ. Para sua situação. Para seu coração.`;
};

/**
 * Benefícios (sentimento, não técnico)
 */
const getBenefits = (profileType: string): string[] => {
  const benefitsByProfile: Record<string, string[]> = {
    overwhelmed: [
      "Voltar a sentir paz… de verdade",
      "Deixar de carregar esse peso sozinho",
      "Recuperar a alegria de estar perto de Deus",
      "Ter uma rotina que não te esgota",
      "Acordar sem aquele cansaço no coração",
    ],
    distant: [
      "Sentir Deus perto de você novamente",
      "Recuperar aquela intimidade que você sente falta",
      "Voltar a ter uma relação real com Deus",
      "Entender por que se afastou",
      "Encontrar o caminho de volta",
    ],
    confused: [
      "Ter clareza sobre qual caminho seguir",
      "Entender a vontade de Deus para você",
      "Sair dessa paralisia",
      "Tomar decisões com segurança",
      "Saber exatamente o que fazer cada dia",
    ],
    weak: [
      "Recuperar a força espiritual que você tinha",
      "Sentir o poder de Deus operando em você",
      "Ter coragem para enfrentar a vida",
      "Voltar a lutar",
      "Ser forte de novo",
    ],
    lost: [
      "Encontrar o caminho de volta para Deus",
      "Ter direção clara",
      "Recuperar o propósito que você perdeu",
      "Saber para onde ir",
      "Voltar a ter esperança",
    ],
    dry: [
      "Beber da água viva novamente",
      "Sentir o coração cheio de vida",
      "Recuperar a alegria de estar vivo espiritualmente",
      "Ter fé de novo",
      "Voltar a sentir",
    ],
    general: [
      "Saber exatamente o que fazer cada dia",
      "Sentir a presença de Deus voltando",
      "Ter uma rotina espiritual que funciona",
      "Voltar a ter direção",
      "Transformação real em 7 dias",
    ],
  };
  
  return benefitsByProfile[profileType] || benefitsByProfile.general;
};

/**
 * Urgência suave + emocional
 * Sem pressão agressiva
 */
const getUrgency = (profileType: string): string => {
  return `Talvez esse seja o momento que você precisava.\n\nTalvez Deus esteja te falando agora.\n\nNão ignore isso.`;
};

/**
 * CTA natural
 */
const getCtaPrimary = (profileType: string): string => {
  const ctas: Record<string, string> = {
    overwhelmed: "Quero descansar em Deus agora",
    distant: "Quero voltar para Deus agora",
    confused: "Quero ter clareza agora",
    weak: "Quero recuperar minha força agora",
    lost: "Quero encontrar meu caminho agora",
    dry: "Quero beber da água viva agora",
    general: "Quero começar agora",
  };
  
  return ctas[profileType] || ctas.general;
};

/**
 * Mensagem de preço (leve, sem destaque agressivo)
 */
const getPriceMessage = (): string => {
  return `Menos que um café.\n\nMas que pode mudar tudo.`;
};

/**
 * Pensamento de fechamento
 */
const getClosingThought = (profileType: string): string => {
  return `Você merece voltar a sentir paz.\n\nVocê merece estar perto de Deus.\n\nE você merece um caminho claro para chegar lá.`;
};

/**
 * Função principal que gera todo o copywriting
 */
export const generateIntimatePageCopy = (
  profileName: string,
  profileDescription: string,
  challenges: string[],
  userName: string
): IntimatePageCopy => {
  const profileType = getProfileType(profileName);
  
  return {
    opening: getOpening(profileType, userName),
    identification: getIdentification(profileType),
    revelation: getRevelation(profileType, profileDescription),
    painReality: getPainReality(profileType),
    comfort: getComfort(profileType),
    hope: getHope(profileType),
    solutionIntro: getSolutionIntro(profileType, userName),
    benefits: getBenefits(profileType),
    urgency: getUrgency(profileType),
    ctaPrimary: getCtaPrimary(profileType),
    priceMessage: getPriceMessage(),
    closingThought: getClosingThought(profileType),
  };
};
