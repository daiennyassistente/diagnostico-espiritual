/**
 * Sistema de Diagnóstico Espiritual Profundo
 * Gera diagnósticos emocionais, detalhados e personalizados
 * que fazem a pessoa se sentir verdadeiramente entendida
 */

export interface DeepDiagnosis {
  opening: string;
  deepExplanation: string;
  rootOfProblem: string;
  realConsequence: string;
  emotionalConnection: string;
  acceptance: string;
  transitionToSolution: string;
}

/**
 * Gera diagnóstico profundo baseado no perfil espiritual
 */
export function generateDeepSpiritualDiagnosis(
  profileName: string,
  challenges: string[],
  userName: string
): DeepDiagnosis {
  const profile = profileName.toLowerCase();

  if (profile.includes("sobrecarregado")) {
    return generateOverwhelmedDiagnosis(challenges, userName);
  } else if (profile.includes("distante")) {
    return generateDistantDiagnosis(challenges, userName);
  } else if (profile.includes("confuso")) {
    return generateConfusedDiagnosis(challenges, userName);
  } else if (profile.includes("fraco")) {
    return generateWeakDiagnosis(challenges, userName);
  } else if (profile.includes("perdido")) {
    return generateLostDiagnosis(challenges, userName);
  } else if (profile.includes("seco")) {
    return generateDryDiagnosis(challenges, userName);
  }

  return generateGeneralDiagnosis(challenges, userName);
}

function generateOverwhelmedDiagnosis(challenges: string[], userName: string): DeepDiagnosis {
  return {
    opening: `${userName}, você está fazendo tudo certo.

Mas está tudo errado.

Porque você está fazendo TUDO.`,

    deepExplanation: `Você está vivendo uma fase onde a vida espiritual se tornou mais uma obrigação do que um encontro.

Você tenta manter a disciplina. Tenta orar. Tenta ler a Bíblia. Tenta estar presente na igreja. Tenta servir. Tenta ser o que esperam de você.

Mas cada tentativa é um peso a mais.

E o pior é que você sabe que deveria estar feliz com tudo isso. Afinal, está fazendo "o certo". Mas por dentro, você está cansado. Tão cansado que às vezes pensa em desistir de tudo.

Essa sensação de estar sempre correndo, sempre fazendo, sempre tentando ser melhor… ela não sai de você. Mesmo quando você dorme, a culpa continua ali.

E você começa a perceber que sua vida espiritual se tornou uma lista de tarefas que nunca termina.`,

    rootOfProblem: `A raiz disso não é falta de fé. É falta de descanso.

Você foi ensinado que ser cristão é fazer mais, ser mais, dar mais. E você acreditou. Tanto que agora não consegue parar.

Porque parar significa fracassar.

Mas a verdade é que você já está fracassando… de cansaço.

Você perdeu a capacidade de simplesmente estar com Deus. Tudo precisa ser produtivo. Tudo precisa contar. Tudo precisa ter resultado.

E isso está matando sua alma.

A pressão que você coloca em si mesmo é maior do que qualquer pressão externa. Você é seu próprio inimigo.`,

    realConsequence: `E o impacto disso é real.

Você começou a sentir que Deus está distante. Não porque Ele se afastou, mas porque você está tão ocupado que não consegue ouvi-Lo.

Sua oração se tornou uma lista de pedidos. Sua Bíblia, uma obrigação. Sua fé, uma carga.

E pior: você começou a questionar se realmente acredita. Porque quando tudo é obrigação, fica difícil sentir amor.

Você está queimado espiritualmente. E isso está afetando tudo: seu relacionamento com Deus, sua paz, sua saúde mental, seus relacionamentos.

Você está vazio. E ninguém percebe porque você continua fazendo tudo "certo".`,

    emotionalConnection: `Isso não aconteceu de um dia pro outro.

Foi gradual. Começou com um "não posso faltar". Depois virou "preciso fazer melhor". E agora é "nunca vou ser suficiente".

E talvez você já tenha sentido aquele momento em que percebeu que não consegue mais. Aquele momento em que você pensou: "não aguento mais".

Mas você não falou para ninguém. Porque você é forte. Porque você é cristão. Porque você não pode decepcionante.

Então você continuou. Continuou fingindo. Continuou carregando.

E agora está aqui. Procurando respostas. Procurando alívio.`,

    acceptance: `E não… você não está sozinho.

Muitas pessoas que parecem ter tudo junto estão passando exatamente por isso. Muitas pessoas que você admira estão queimadas por dentro.

Muitas pessoas estão cansadas de ser "perfeitas".

E a verdade que ninguém fala é: Deus não quer isso de você. Ele não quer que você se destrua tentando ser melhor.

Ele quer que você descanse. Que você respire. Que você simplesmente seja.`,

    transitionToSolution: `Mas aqui está a boa notícia: isso pode mudar.

E não precisa ser complicado. Não precisa de mais uma coisa na sua lista.

Precisa de permissão para parar. Permissão para descansar. Permissão para ser humano.`,
  };
}

function generateDistantDiagnosis(challenges: string[], userName: string): DeepDiagnosis {
  return {
    opening: `${userName}, Deus está em silêncio.

E você não sabe por quê.

Mas você sente que algo está errado.`,

    deepExplanation: `Você tenta se aproximar de Deus. Tenta orar. Tenta buscar Sua presença.

Mas é como se houvesse uma parede entre você e Ele.

Você fala, mas não sente que está sendo ouvido. Você busca, mas não sente que está sendo encontrado. Você clama, mas o silêncio é tudo que volta.

E isso é assustador.

Porque você lembra de um tempo em que sentia Deus perto. Um tempo em que a fé era viva. Um tempo em que você tinha certeza.

Mas agora? Agora você tem dúvidas. Muitas dúvidas.

E essas dúvidas começaram a criar uma distância cada vez maior entre você e Deus.

Você não sabe mais se acredita de verdade. Se realmente sente Deus. Se realmente vale a pena continuar.`,

    rootOfProblem: `A raiz disso é mais profunda do que você pensa.

Não é que Deus se afastou. É que você se perdeu no caminho.

Talvez tenha sido uma decepção. Talvez tenha sido uma dor que você não conseguiu processar. Talvez tenha sido uma promessa que você acreditou que Deus faria e que nunca se cumpriu.

E desde então, você construiu uma parede. Uma parede de proteção. Uma parede que diz: "não vou mais confiar".

Mas essa parede também impede que você sinta Deus.

Você está protegido. Mas também está sozinho.`,

    realConsequence: `E o impacto disso é profundo.

Você começou a viver uma fé de mentira. Vai à igreja, mas não sente. Reza, mas não acredita. Lê a Bíblia, mas não entende.

E a cada dia que passa, a distância aumenta.

Você começou a questionar tudo. Se Deus existe. Se Ele se importa. Se vale a pena continuar nessa jornada.

E pior: você começou a se sentir culpado por sentir tudo isso. Porque um "verdadeiro cristão" não deveria ter essas dúvidas.

Então você esconde. Você finge. Você continua.

Mas por dentro, você está morrendo de vontade de voltar a sentir Deus.`,

    emotionalConnection: `Isso não aconteceu de um dia pro outro.

Foi um afastamento gradual. Começou pequeno. Uma decepção aqui. Uma dúvida ali. Até que um dia você acordou e percebeu que não sente mais nada.

E talvez você já tenha sentido aquele momento em que percebeu que não consegue mais fingir. Aquele momento em que você pensou: "não aguento mais viver essa mentira".

Mas você não sabe como voltar. E tem medo de que seja muito tarde.

Tem medo de que Deus não queira mais você. Tem medo de que Ele tenha desistido de você.

Tem medo de estar realmente sozinho.`,

    acceptance: `E não… você não está sozinho.

Muitas pessoas que você conhece estão passando por isso. Muitas pessoas que parecem ter fé inabalável estão questionando tudo por dentro.

Muitas pessoas estão cansadas de fingir que tudo está bem.

E a verdade que ninguém fala é: Deus não desistiu de você. Ele está esperando você voltar.

Ele quer que você sinta Ele de novo. Mas dessa vez, de forma real. Sem máscaras. Sem fingimentos.`,

    transitionToSolution: `Mas aqui está a boa notícia: você pode voltar.

E não precisa ter todas as respostas. Não precisa resolver tudo sozinho.

Precisa apenas de um passo. Um pequeno passo em direção a Deus novamente.`,
  };
}

function generateConfusedDiagnosis(challenges: string[], userName: string): DeepDiagnosis {
  return {
    opening: `${userName}, você está preso.

Não sabe qual caminho seguir.

E cada dia que passa, a paralisia aumenta.`,

    deepExplanation: `Você tenta seguir Deus. Tenta obedecer. Tenta fazer o certo.

Mas você não sabe o que é o certo.

Você recebe conselhos de um lado. Conselhos de outro. Cada pessoa diz uma coisa. Cada livro diz outra. Cada pregação diz algo diferente.

E você fica preso no meio. Sem saber para onde ir.

Você tenta orar pedindo direção. Mas a resposta não vem clara. Você tenta buscar a vontade de Deus. Mas não consegue entender o que Ele quer.

E essa confusão está te deixando paralisado.

Você não consegue tomar decisões. Você fica preso analisando tudo. Procurando a "resposta certa". Esperando um sinal que talvez nunca venha.

E enquanto isso, a vida passa.`,

    rootOfProblem: `A raiz disso é que você foi ensinado que existe uma resposta "certa" para tudo.

Que Deus tem um plano perfeito. Que existe um caminho específico que você deve seguir. Que se você errar, tudo vai dar errado.

E essa pressão está te matando.

Porque a realidade é que a vida é complexa. Que Deus trabalha de formas que não conseguimos entender. Que às vezes não há uma resposta "certa", apenas escolhas.

Mas você não consegue aceitar isso. Então fica preso. Esperando uma clareza que talvez nunca chegue.`,

    realConsequence: `E o impacto disso é real.

Você começou a perder tempo precioso esperando por respostas que não vêm. Você deixou de viver porque estava tentando encontrar a "vontade de Deus".

Você começou a questionar suas próprias decisões. A duvidar de si mesmo. A pensar que talvez não seja capaz de ouvir Deus.

E pior: você começou a se sentir inadequado. Como se houvesse algo errado com você porque não consegue entender o que Deus quer.

Você está confuso. E essa confusão está afetando sua fé, suas decisões, seu futuro.`,

    emotionalConnection: `Isso não aconteceu de um dia pro outro.

Foi um acúmulo de confusões. De conselhos contraditórios. De sinais que você não consegue interpretar.

E talvez você já tenha sentido aquele momento em que percebeu que não consegue mais esperar. Aquele momento em que você pensou: "preciso de uma resposta agora".

Mas a resposta não vem. E você continua preso.

Talvez você já tenha tomado decisões que se arrependeu. Talvez você já tenha deixado oportunidades passar porque estava esperando a "vontade de Deus".

E agora você está cansado. Cansado de esperar. Cansado de confusão.`,

    acceptance: `E não… você não está sozinho.

Muitas pessoas estão passando por essa confusão. Muitas pessoas estão paralisadas esperando uma clareza que talvez nunca chegue.

Muitas pessoas foram ensinadas que precisam ouvir Deus de forma perfeita. E agora estão presas porque não conseguem.

E a verdade que ninguém fala é: Deus não quer que você fique preso. Ele quer que você viva.

Ele quer que você tome decisões. Que você corra riscos. Que você confie nele mesmo quando não tem todas as respostas.`,

    transitionToSolution: `Mas aqui está a boa notícia: você pode sair dessa confusão.

E não precisa ter todas as respostas. Não precisa entender tudo.

Precisa apenas de clareza sobre o que realmente importa. E de coragem para agir mesmo com incerteza.`,
  };
}

function generateWeakDiagnosis(challenges: string[], userName: string): DeepDiagnosis {
  return {
    opening: `${userName}, você perdeu sua força.

E cada dia fica mais fraco.

Mas você não sabe por quê.`,

    deepExplanation: `Você tenta manter a fé. Tenta ser forte. Tenta acreditar.

Mas você se sente fraco.

Tão fraco que às vezes você questiona se realmente acredita em Deus. Tão fraco que uma pequena dificuldade te derruba. Tão fraco que você não consegue resistir às tentações que antes conseguia.

É como se você tivesse perdido a bateria. Como se a energia que você tinha para viver a fé simplesmente desapareceu.

E você não sabe por quê.

Você lembra de um tempo em que tinha força. Um tempo em que conseguia enfrentar qualquer coisa. Um tempo em que sua fé era inabalável.

Mas agora? Agora você é fraco. E isso te assusta.`,

    rootOfProblem: `A raiz disso é que você está vivendo uma fé que não é sua.

Você está tentando viver a fé que seus pais tiveram. A fé que a igreja espera de você. A fé que você acha que deveria ter.

Mas não é a sua. E por isso você está fraco.

Porque viver uma fé que não é sua é exaustivo. É como tentar correr uma maratona com os sapatos de outra pessoa.

Você não consegue. Você cai. Você desiste.`,

    realConsequence: `E o impacto disso é profundo.

Você começou a cair em tentações que antes não caía. Você começou a fazer coisas que você sabe que não deveria fazer. E depois se sente culpado. Tão culpado que pensa em desistir de tudo.

Você começou a se sentir como um fracasso. Como se não fosse um "verdadeiro cristão". Como se houvesse algo fundamentalmente errado com você.

E pior: você começou a se afastar de Deus. Porque quanto mais fraco você se sente, mais longe você quer ficar.

Você está em um ciclo. Fraqueza → Tentação → Culpa → Afastamento → Mais Fraqueza.

E você não sabe como sair.`,

    emotionalConnection: `Isso não aconteceu de um dia pro outro.

Foi um enfraquecimento gradual. Começou com uma pequena queda. Depois outra. Depois outra.

E talvez você já tenha sentido aquele momento em que percebeu que não era mais forte. Aquele momento em que você pensou: "não sou mais o que era".

Mas você não sabe o que fazer com isso. Então você continua fingindo que está tudo bem.

Talvez você já tenha sentido aquela sensação de estar sozinho nessa luta. De que ninguém entende o que você está passando.

Talvez você já tenha pensado em desistir.`,

    acceptance: `E não… você não está sozinho.

Muitas pessoas que parecem fortes estão se sentindo fracas por dentro. Muitas pessoas que você admira estão lutando contra as mesmas coisas que você.

Muitas pessoas estão cansadas de fingir que têm força.

E a verdade que ninguém fala é: Sua fraqueza não é um fracasso. É uma oportunidade.

É uma oportunidade para descobrir uma fé que é realmente sua. Uma fé que te fortalece de verdade.`,

    transitionToSolution: `Mas aqui está a boa notícia: você pode recuperar sua força.

E não precisa ser a mesma força de antes. Precisa ser uma força que vem de uma fé que é realmente sua.

Precisa apenas de um passo. Um pequeno passo em direção a uma fé autêntica.`,
  };
}

function generateLostDiagnosis(challenges: string[], userName: string): DeepDiagnosis {
  return {
    opening: `${userName}, você está perdido.

Muito perdido.

E não sabe como voltar para casa.`,

    deepExplanation: `Você tenta encontrar seu caminho. Tenta seguir Deus. Tenta viver a fé.

Mas você não sabe onde está. Não sabe para onde ir. Não sabe como voltar.

É como se você estivesse em uma floresta escura. Você sabe que precisa sair. Mas todos os caminhos parecem levar a lugar nenhum.

Você tenta um caminho. Não funciona. Tenta outro. Também não funciona. E você fica cada vez mais perdido.

E a cada tentativa, você se afasta mais do ponto de partida. Mais longe de Deus. Mais longe de si mesmo.

Você não reconhece mais o lugar onde está. Você não reconhece mais quem você é.`,

    rootOfProblem: `A raiz disso é que você deixou de ouvir sua própria voz.

Você deixou de ouvir Deus. Você deixou de ouvir a si mesmo.

E agora você está seguindo a voz de todo mundo. Dos pais. Da igreja. Da sociedade. Da mídia.

Mas não a sua. E não a de Deus.

E por isso você está perdido. Porque você não sabe mais quem você é. Não sabe mais o que você acredita. Não sabe mais para onde você quer ir.`,

    realConsequence: `E o impacto disso é real.

Você começou a viver uma vida que não é sua. Você começou a fazer escolhas que não são suas. Você começou a ser alguém que você não é.

E você sabe disso. Você sente disso. Mas você não consegue parar.

Você começou a se sentir vazio. Vazio de propósito. Vazio de direção. Vazio de significado.

E pior: você começou a questionar se ainda existe volta. Se ainda é possível encontrar seu caminho.

Você está perdido. E tem medo de que seja muito tarde.`,

    emotionalConnection: `Isso não aconteceu de um dia pro outro.

Você se perdeu gradualmente. Começou com um pequeno desvio. Depois outro. Depois outro.

E talvez você já tenha sentido aquele momento em que percebeu que estava perdido. Aquele momento em que você pensou: "não sei mais onde estou".

Mas você não parou. Você continuou andando. Esperando encontrar o caminho.

Talvez você já tenha sentido aquela sensação de estar sozinho nessa jornada. De que ninguém entende como você se sente.

Talvez você já tenha pensado em desistir de encontrar o caminho.`,

    acceptance: `E não… você não está sozinho.

Muitas pessoas estão perdidas. Muitas pessoas não sabem mais quem são. Muitas pessoas estão vivendo uma vida que não é sua.

Muitas pessoas estão procurando o caminho de volta.

E a verdade que ninguém fala é: Deus não desistiu de você. Ele está procurando você.

Ele quer que você encontre seu caminho. Que você encontre a si mesmo. Que você encontre Ele novamente.`,

    transitionToSolution: `Mas aqui está a boa notícia: você pode encontrar seu caminho.

E não precisa fazer isso sozinho. Não precisa ter todas as respostas.

Precisa apenas de um passo. Um pequeno passo em direção a casa.`,
  };
}

function generateDryDiagnosis(challenges: string[], userName: string): DeepDiagnosis {
  return {
    opening: `${userName}, você está vazio.

Sua fé secou.

E você não sabe como regar novamente.`,

    deepExplanation: `Você tenta se conectar com Deus. Tenta sentir Sua presença. Tenta viver a fé.

Mas é como se não houvesse nada. Como se a água tivesse secado.

Você ora, mas não sente nada. Você lê a Bíblia, mas as palavras não tocam seu coração. Você vai à igreja, mas sai vazio.

É como se você estivesse vivendo uma vida espiritual que é apenas uma casca vazia. Sem vida. Sem água. Sem alimento.

E você está sedento. Tão sedento que às vezes você questiona se ainda acredita em Deus.

Porque se Deus existe, por que Ele não te satisfaz mais?`,

    rootOfProblem: `A raiz disso é que você parou de beber da fonte.

Você parou de buscar Deus de forma genuína. Você parou de permitir que Ele te transforme. Você parou de estar aberto para receber Dele.

E agora você está seco. Completamente seco.

É como se você tivesse um poço dentro de você. Um poço que deveria estar cheio de água viva. Mas agora está vazio.

E você não sabe como enchê-lo novamente.`,

    realConsequence: `E o impacto disso é profundo.

Você começou a se sentir morto por dentro. Você começou a perder a alegria de viver. Você começou a questionar o sentido de tudo.

Você começou a se afastar de Deus. Porque estar perto Dele sem sentir nada é ainda mais doloroso do que estar longe.

E pior: você começou a se sentir culpado por estar seco. Como se houvesse algo errado com você. Como se você não fosse um "verdadeiro cristão".

Você está seco. E essa secura está afetando tudo em sua vida.`,

    emotionalConnection: `Isso não aconteceu de um dia pro outro.

Você secou gradualmente. Começou com um pequeno ressecamento. Depois outro. Depois outro.

E talvez você já tenha sentido aquele momento em que percebeu que estava completamente seco. Aquele momento em que você pensou: "não tenho mais nada para dar".

Mas você continuou. Continuou tentando. Continuou fingindo que tudo estava bem.

Talvez você já tenha sentido aquela sensação de estar morto por dentro. De que nada mais te toca. De que nada mais te alegra.

Talvez você já tenha pensado em desistir de procurar por Deus.`,

    acceptance: `E não… você não está sozinho.

Muitas pessoas estão secas espiritualmente. Muitas pessoas estão passando por essa secura. Muitas pessoas sentem que perderam a conexão com Deus.

Muitas pessoas estão sedenta de algo real.

E a verdade que ninguém fala é: Deus quer te dar água viva. Ele quer que você beba e nunca mais tenha sede.

Ele quer que você volte a viver. Que você volte a sentir. Que você volte a ser preenchido.`,

    transitionToSolution: `Mas aqui está a boa notícia: você pode beber novamente.

E não precisa fazer isso sozinho. Não precisa ter todas as respostas.

Precisa apenas de um passo. Um pequeno passo em direção à água viva.`,
  };
}

function generateGeneralDiagnosis(challenges: string[], userName: string): DeepDiagnosis {
  return {
    opening: `${userName}, algo não está bem.

Você sente isso.

Mas não sabe exatamente o quê.`,

    deepExplanation: `Você tenta viver a fé. Tenta seguir Deus. Tenta fazer o certo.

Mas algo não está bem. Algo está fora do lugar.

Você não consegue nomear exatamente o que é. Mas você sente. É uma sensação de que está faltando algo. De que você deveria estar em um lugar diferente espiritualmente.

De que algo precisa mudar.

E essa sensação não sai de você. Ela fica ali. Sussurrando. Lembrando você de que algo está errado.`,

    rootOfProblem: `A raiz disso é que você parou de estar atento.

Você parou de questionar. Parou de refletir. Parou de buscar profundidade.

E agora você está vivendo uma fé que é apenas superficial. Uma fé que não te transforma. Uma fé que não te satisfaz.

Você está vivendo no piloto automático. Fazendo as coisas "certas". Mas sem realmente estar presente.`,

    realConsequence: `E o impacto disso é real.

Você começou a se sentir distante de Deus. Você começou a questionar sua fé. Você começou a se sentir vazio.

E pior: você começou a perceber que algo precisa mudar. Mas você não sabe o quê.

Você está em um ponto de virada. E você sente isso.`,

    emotionalConnection: `Isso não aconteceu de um dia pro outro.

Você chegou aqui gradualmente. Através de pequenas escolhas. Pequenos desvios. Pequenas negligências.

E talvez você já tenha sentido aquele momento em que percebeu que algo estava errado. Aquele momento em que você pensou: "preciso mudar".

Mas você não sabe por onde começar.`,

    acceptance: `E não… você não está sozinho.

Muitas pessoas estão nesse ponto de virada. Muitas pessoas sentem que algo precisa mudar.

Muitas pessoas estão procurando mais profundidade em sua fé.

E a verdade que ninguém fala é: Esse sentimento que você tem é Deus chamando você.

Ele quer que você desperte. Que você reflita. Que você mude.`,

    transitionToSolution: `Mas aqui está a boa notícia: você pode mudar.

E não precisa ser uma mudança drástica. Não precisa abandonar tudo.

Precisa apenas de um passo. Um pequeno passo em direção a uma fé mais profunda e autêntica.`,
  };
}
