/**
 * Sistema de copywriting 100% personalizado
 * Verdade Bíblica + Graça + Esperança
 * Para cristãos evangélicos
 */

export interface SpiritualPageCopy {
  opening: string;
  identification: string;
  revelation: string;
  truthWithLove: string;
  biblicalTruth: string;
  hope: string;
  solutionIntro: string;
  benefits: string[];
  internalCall: string;
  ctaPrimary: string;
  priceMessage: string;
  closingReflection: string;
}

/**
 * Detecta o tipo de perfil espiritual baseado no nome
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
 * 🔴 ABERTURA (FORTE E VERDADEIRA)
 */
const getOpening = (profileType: string, userName: string): string => {
  const openings: Record<string, string> = {
    overwhelmed: `${userName}, eu preciso ser sincero com você.\n\nO que apareceu no seu resultado merece sua atenção.\n\nPorque o que você está vivendo… Deus vê.`,
    distant: `${userName}, eu preciso ser sincero com você.\n\nO que apareceu no seu resultado merece sua atenção.\n\nPorque essa distância que você sente… não é invisível para Deus.`,
    confused: `${userName}, eu preciso ser sincero com você.\n\nO que apareceu no seu resultado merece sua atenção.\n\nPorque essa confusão que você vive… Deus quer resolver.`,
    weak: `${userName}, eu preciso ser sincero com você.\n\nO que apareceu no seu resultado merece sua atenção.\n\nPorque essa fraqueza que você sente… não é o fim.`,
    lost: `${userName}, eu preciso ser sincero com você.\n\nO que apareceu no seu resultado merece sua atenção.\n\nPorque estar perdido não significa estar abandonado.`,
    dry: `${userName}, eu preciso ser sincero com você.\n\nO que apareceu no seu resultado merece sua atenção.\n\nPorque esse vazio que você sente… Deus quer preencher.`,
    general: `${userName}, eu preciso ser sincero com você.\n\nO que apareceu no seu resultado merece sua atenção.\n\nPorque o que você está vivendo espiritualmente… importa.`,
  };
  
  return openings[profileType] || openings.general;
};

/**
 * 🟡 IDENTIFICAÇÃO PROFUNDA
 * Descrever situações reais que a pessoa vive
 */
const getIdentification = (profileType: string): string => {
  const identifications: Record<string, string> = {
    overwhelmed: `Você tenta.\n\nTenta manter a oração, tenta ler a Bíblia, tenta estar perto de Deus.\n\nMas é tão pesado.\n\nVocê começa bem, com entusiasmo, mas no meio do caminho cansa.\n\nE aí vem aquela culpa.\n\nA culpa de não conseguir manter.\n\nA culpa de estar tão cansado espiritualmente.`,
    distant: `Você sabe que deveria estar mais perto de Deus.\n\nVocê acredita nisso.\n\nMas por alguma razão… não consegue sentir Ele perto.\n\nÉ como se houvesse uma parede.\n\nUma parede que você não sabe como derrubou.\n\nE quanto mais tempo passa, mais grossa fica essa parede.`,
    confused: `Você quer fazer a coisa certa.\n\nMas não sabe qual é.\n\nUm dia você pensa de um jeito, no outro dia acha que estava errado.\n\nE essa confusão… ela te paralisa.\n\nVocê quer avançar na fé, mas não sabe para onde ir.\n\nE fica preso nesse lugar.`,
    weak: `Você se lembra de quando tinha força.\n\nQuando conseguia enfrentar as coisas com confiança em Deus.\n\nMas agora… você se sente fraco.\n\nComo se tivesse perdido a bateria espiritual.\n\nE isso é assustador.\n\nPorque você sabe que poderia estar melhor.`,
    lost: `Você se perdeu em algum lugar.\n\nNão sabe bem quando.\n\nMas de repente você olha para trás e percebe que está longe.\n\nMuito longe de onde deveria estar com Deus.\n\nE não sabe como voltar.\n\nE isso dói.`,
    dry: `Você sente um vazio.\n\nNão é depressão.\n\nNão é tristeza.\n\nÉ um vazio espiritual.\n\nComo se a água viva que alimentava sua alma tivesse secado.\n\nE você não consegue encontrar a fonte novamente.`,
    general: `Você sente que algo está faltando.\n\nNão consegue nomear direito.\n\nMas sabe que está faltando.\n\nE essa sensação… ela não sai de você.`,
  };
  
  return identifications[profileType] || identifications.general;
};

/**
 * 🔵 REVELAÇÃO DO DIAGNÓSTICO
 */
const getRevelation = (profileType: string, profileDescription: string): string => {
  const revelations: Record<string, string> = {
    overwhelmed: `Seu resultado mostra um padrão claro.\n\nVocê está vivendo uma sobrecarga espiritual real.\n\nNão é fraqueza.\n\nNão é falta de fé.\n\nÉ que você está carregando um peso que não foi feito para você carregar sozinho.`,
    distant: `Seu resultado mostra um padrão claro.\n\nVocê está vivendo uma distância real de Deus.\n\nNão é imaginação.\n\nNão é culpa sua.\n\nÉ um padrão que precisa ser quebrado.`,
    confused: `Seu resultado mostra um padrão claro.\n\nVocê está vivendo em confusão espiritual real.\n\nNão é falta de inteligência.\n\nNão é falta de fé.\n\nÉ que você precisa de direção.`,
    weak: `Seu resultado mostra um padrão claro.\n\nVocê está vivendo uma fraqueza espiritual real.\n\nNão é fraqueza de caráter.\n\nNão é falta de coragem.\n\nÉ que você perdeu a conexão com a fonte de força.`,
    lost: `Seu resultado mostra um padrão claro.\n\nVocê está vivendo uma perdição real.\n\nNão é porque você não tentou.\n\nNão é porque você não acreditou.\n\nÉ que você se perdeu… e agora está buscando o caminho.`,
    dry: `Seu resultado mostra um padrão claro.\n\nVocê está vivendo uma secura espiritual real.\n\nNão é porque você não merece.\n\nNão é porque Deus se afastou.\n\nÉ que você precisa beber da água viva novamente.`,
    general: `Seu resultado mostra um padrão claro.\n\nVocê está vivendo algo real.\n\nAlgo que muitas pessoas vivem.\n\nMas que poucos conseguem nomear e enfrentar.`,
  };
  
  return revelations[profileType] || revelations.general;
};

/**
 * 🟠 CONFRONTO COM AMOR
 * Fazer refletir sem acusar
 */
const getTruthWithLove = (profileType: string): string => {
  const truths: Record<string, string> = {
    overwhelmed: `Talvez você esteja se acostumando com um cansaço que não deveria ser normal.\n\nTalvez tenha acreditado que estar cansado de Deus é parte da vida cristã.\n\nMas não é.\n\nDeus nunca quis que você vivesse assim.\n\nEle quer que você descanse nEle.`,
    distant: `Talvez você esteja aceitando uma distância que deveria ser inaceitável.\n\nTalvez tenha acreditado que é normal se afastar de Deus.\n\nMas não é.\n\nDeus não se afastou.\n\nMas algo no caminho… precisa ser ajustado.`,
    confused: `Talvez você esteja vivendo em confusão porque nunca parou para ouvir de verdade.\n\nTalvez tenha acreditado que Deus não fala claro.\n\nMas Ele fala.\n\nVocê só precisa aprender a ouvir.`,
    weak: `Talvez você tenha esquecido que sua força não vem de você.\n\nTalvez tenha acreditado que precisa ser forte sozinho.\n\nMas não precisa.\n\nDeus é sua força.\n\nE Ele quer que você se apoie nEle.`,
    lost: `Talvez você tenha deixado de procurar.\n\nTalvez tenha acreditado que está muito longe para voltar.\n\nMas não está.\n\nDeus não abandona quem O procura.\n\nE Ele está procurando por você também.`,
    dry: `Talvez você tenha esquecido onde fica a fonte.\n\nTalvez tenha acreditado que a água viva não existe mais.\n\nMas existe.\n\nE ela está disponível.\n\nVocê só precisa voltar a beber.`,
    general: `Talvez seja hora de parar e refletir de verdade.\n\nTalvez seja hora de confrontar o que você está vivendo.\n\nNão com condenação.\n\nMas com amor.`,
  };
  
  return truths[profileType] || truths.general;
};

/**
 * 🟢 VERDADE BÍBLICA (SUTIL)
 */
const getBiblicalTruth = (profileType: string): string => {
  const biblicalTruths: Record<string, string> = {
    overwhelmed: `A Bíblia diz que Jesus convida os cansados para descansar nEle.\n\nNão é uma sugestão.\n\nÉ um convite.\n\nE esse convite é para você.`,
    distant: `A Bíblia diz que Deus deseja proximidade com você.\n\nQue Ele quer estar perto.\n\nQue Ele nunca se afastou.\n\nE que existe um caminho de volta.`,
    confused: `A Bíblia diz que Deus não é Deus de confusão.\n\nQue Ele deseja guiar seus passos.\n\nQue Ele quer que você tenha clareza.\n\nE que isso é possível.`,
    weak: `A Bíblia diz que a força de Deus se aperfeiçoa na fraqueza.\n\nQue quando você é fraco, Ele é forte.\n\nQue você não precisa ser forte sozinho.\n\nE que Ele quer ser sua força.`,
    lost: `A Bíblia diz que Deus procura o perdido.\n\nQue Ele conhece cada passo seu.\n\nQue existe um caminho de volta.\n\nE que Ele está esperando você encontrá-lo.`,
    dry: `A Bíblia diz que quem bebe da água viva nunca mais terá sede.\n\nQue essa água é o próprio Deus.\n\nQue ela está disponível.\n\nE que você pode beber novamente.`,
    general: `A Bíblia diz que Deus se importa com sua alma.\n\nQue Ele vê o que você está vivendo.\n\nQue Ele quer ajudar.\n\nE que existe esperança.`,
  };
  
  return biblicalTruths[profileType] || biblicalTruths.general;
};

/**
 * 🟣 ESPERANÇA REAL
 */
const getHope = (profileType: string): string => {
  return `Mas aqui está a verdade que importa:\n\nIsso pode mudar.\n\nE você não precisa fazer isso sozinho.\n\nDeus está aqui.\n\nEle nunca saiu.\n\nE Ele quer te ajudar a voltar.`;
};

/**
 * 🟤 SOLUÇÃO (SEM FORÇAR)
 */
const getSolutionIntro = (profileType: string, userName: string): string => {
  return `Por isso existe um plano simples de 7 dias.\n\nNão é um devocional comum.\n\nÉ um caminho de volta.\n\nFeito especialmente para você, ${userName}.\n\nPara sua situação.\n\nPara sua alma.`;
};

/**
 * 8. BENEFÍCIOS (ESPIRITUAIS)
 */
const getBenefits = (profileType: string): string[] => {
  const benefitsByProfile: Record<string, string[]> = {
    overwhelmed: [
      "Aprender a descansar de verdade em Deus",
      "Voltar a ter alegria na sua fé",
      "Criar uma rotina espiritual que sustenta",
      "Sentir o peso sair de seus ombros",
      "Descobrir que Deus é seu descanso",
    ],
    distant: [
      "Sentir Deus perto de você novamente",
      "Recuperar aquela intimidade perdida",
      "Entender por que se afastou",
      "Encontrar o caminho de volta",
      "Voltar a ter um relacionamento real com Deus",
    ],
    confused: [
      "Ter clareza sobre a vontade de Deus para você",
      "Sair dessa paralisia",
      "Entender qual caminho seguir",
      "Tomar decisões com confiança",
      "Descobrir a direção que Deus tem para você",
    ],
    weak: [
      "Recuperar a força espiritual que você tinha",
      "Sentir o poder de Deus operando em você",
      "Ter coragem para enfrentar a vida",
      "Voltar a lutar com confiança",
      "Descobrir que sua força vem de Deus",
    ],
    lost: [
      "Encontrar o caminho de volta para Deus",
      "Ter direção clara novamente",
      "Recuperar o propósito que você perdeu",
      "Saber para onde ir",
      "Voltar a ter esperança",
    ],
    dry: [
      "Beber da água viva novamente",
      "Sentir o coração cheio de vida",
      "Recuperar a alegria de estar vivo espiritualmente",
      "Ter fé de novo",
      "Voltar a sentir a presença de Deus",
    ],
    general: [
      "Ter clareza sobre sua vida espiritual",
      "Sentir a presença de Deus voltando",
      "Criar uma rotina que funciona",
      "Voltar a ter direção",
      "Transformação real em 7 dias",
    ],
  };
  
  return benefitsByProfile[profileType] || benefitsByProfile.general;
};

/**
 * 🔴 CHAMADO INTERNO (MUITO FORTE)
 * Não pressionar compra, mas chamar para decisão
 */
const getInternalCall = (profileType: string): string => {
  return `Talvez esse seja o momento.\n\nO momento em que você para de ignorar o que sente.\n\nO momento em que você decide voltar.\n\nNão ignore isso dentro de você.\n\nEsse chamado que você está sentindo… é real.`;
};

/**
 * 🟡 CTA (SUAVE E VERDADEIRO)
 */
const getCtaPrimary = (profileType: string): string => {
  const ctas: Record<string, string> = {
    overwhelmed: "Quero descansar em Deus novamente",
    distant: "Quero voltar para Deus",
    confused: "Quero ter clareza com Deus",
    weak: "Quero recuperar minha força espiritual",
    lost: "Quero encontrar meu caminho com Deus",
    dry: "Quero beber da água viva novamente",
    general: "Quero recomeçar com Deus",
  };
  
  return ctas[profileType] || ctas.general;
};

/**
 * 🟢 PREÇO (DISCRETO)
 */
const getPriceMessage = (): string => {
  return `R$ 12,90\n\nMenos que um café.\n\nMas que pode mudar tudo.`;
};

/**
 * Reflexão de fechamento
 */
const getClosingReflection = (profileType: string): string => {
  return `Você merece estar perto de Deus.\n\nVocê merece sentir paz.\n\nVocê merece voltar.`;
};

/**
 * Função principal que gera todo o copywriting
 */
export const generateSpiritualPageCopy = (
  profileName: string,
  profileDescription: string,
  challenges: string[],
  userName: string
): SpiritualPageCopy => {
  const profileType = getProfileType(profileName);
  
  return {
    opening: getOpening(profileType, userName),
    identification: getIdentification(profileType),
    revelation: getRevelation(profileType, profileDescription),
    truthWithLove: getTruthWithLove(profileType),
    biblicalTruth: getBiblicalTruth(profileType),
    hope: getHope(profileType),
    solutionIntro: getSolutionIntro(profileType, userName),
    benefits: getBenefits(profileType),
    internalCall: getInternalCall(profileType),
    ctaPrimary: getCtaPrimary(profileType),
    priceMessage: getPriceMessage(),
    closingReflection: getClosingReflection(profileType),
  };
};
