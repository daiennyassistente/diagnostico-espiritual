import PDFDocument from "pdfkit";
import { invokeLLM } from "./_core/llm";

interface DevotionalRequest {
  profileName: string;
  profileDescription: string;
  challenges: string[];
  recommendations: string[];
  responses?: Record<string, string>;
  strengths?: string[];
  nextSteps?: string[];
  userName?: string;
}

interface GeneratedDay {
  day: number;
  title: string;
  verse: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  application: string;
}

const QUIZ_QUESTION_LABELS: Record<number, string> = {
  0: "Qual é o seu nome?",
  1: "Como você se sente espiritualmente hoje?",
  2: "O que mais tem dificultado sua constância com Deus?",
  3: "Como está sua rotina com a Palavra?",
  4: "Como você descreveria sua vida de oração hoje?",
  5: "O que você mais sente falta hoje na sua vida com Deus?",
  6: "O que você sente que mais tem sido tratado em você nessa fase?",
  7: "O que você mais deseja viver com Deus agora?",
  8: "Quanto tempo por dia você consegue dedicar com intencionalidade?",
  9: "Qual é sua maior dificuldade?",
  10: "Como você se descreve espiritualmente neste momento?",
  11: "Algo que você queira acrescentar ou desabafar?",
};

const getResponseValue = (responses: Record<string, string>, zeroIndexKey: number, stepKey: string) => {
  return responses[String(zeroIndexKey)] || responses[stepKey] || "";
};

const normalizeResponse = (value: string) => value.trim().toLowerCase();

const getFirstName = (request: DevotionalRequest) => {
  const explicitName = request.userName?.trim();
  if (explicitName) {
    return explicitName.split(/\s+/).filter(Boolean)[0] || "";
  }

  const quizName = request.responses ? getResponseValue(request.responses, 0, "step1").trim() : "";
  return quizName.split(/\s+/).filter(Boolean)[0] || "";
};

const buildResponsesContext = (responses: Record<string, string>) => {
  return Object.entries(QUIZ_QUESTION_LABELS)
    .map(([index, question]) => {
      const numericIndex = Number(index);
      const answer = getResponseValue(responses, numericIndex, `step${numericIndex + 1}`) || "Não respondido";
      return `Pergunta ${numericIndex + 1}: ${question}\nResposta: ${answer}`;
    })
    .join("\n\n");
};

const buildRequestSnapshot = (request: DevotionalRequest) => {
  const responsesText = request.responses ? buildResponsesContext(request.responses) : "Respostas do quiz indisponíveis.";
  const strengthsText = request.strengths?.length ? request.strengths.map((item) => `- ${item}`).join("\n") : "- Não informado";
  const challengesText = request.challenges.length ? request.challenges.map((item) => `- ${item}`).join("\n") : "- Não informado";
  const recommendationsText = request.recommendations.length
    ? request.recommendations.map((item) => `- ${item}`).join("\n")
    : "- Não informado";
  const nextStepsText = request.nextSteps?.length ? request.nextSteps.map((item) => `- ${item}`).join("\n") : "- Não informado";

  return `RESULTADO ESPIRITUAL CONSOLIDADO:
Perfil identificado: ${request.profileName}
Descrição do resultado: ${request.profileDescription}
Forças percebidas:
${strengthsText}

Desafios percebidos:
${challengesText}

Recomendações do diagnóstico:
${recommendationsText}

Próximos passos sugeridos:
${nextStepsText}

RESPOSTAS COMPLETAS DO QUIZ:
${responsesText}`;
};

export function normalizePdfText(text: string): string {
  return text
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildDevotionalPrompt(request: DevotionalRequest): string {
  const firstName = getFirstName(request);
  const userReference = firstName || "essa pessoa";

  return `Você é um pastor conselheiro evangélico experiente, cristocêntrico e totalmente fiel às Escrituras. Sua tarefa é escrever um devocional de 7 dias com tom pastoral, bíblico, acolhedor e profundamente pessoal.

MISSÃO:
Crie um devocional 100% personalizado para ${userReference}, usando OBRIGATORIAMENTE as respostas reais do quiz e o resultado espiritual consolidado abaixo. O conteúdo precisa soar como algo escrito especificamente para essa pessoa e para ninguém mais.

BASE TEOLÓGICA OBRIGATÓRIA:
- O conteúdo deve ser totalmente alinhado à fé cristã evangélica.
- Jesus Cristo deve ser o centro da esperança, da interpretação e da aplicação.
- A Bíblia é a única autoridade usada para consolo, correção, encorajamento e direção.
- Não use linguagem mística, energética, esotérica, de universo, de decretos mágicos ou autoajuda secular.
- Não relativize pecado, arrependimento, graça, cruz, obediência, santificação e comunhão com Deus.

DADOS REAIS DA PESSOA:
${buildRequestSnapshot(request)}

REGRAS DE PERSONALIZAÇÃO ABSOLUTA:
1. Cada dia deve mencionar evidências concretas das respostas e do resultado; nunca escreva algo que poderia servir para qualquer pessoa.
2. Traga conexões explícitas entre a dor relatada, o estado espiritual identificado e a esperança encontrada em Cristo.
3. Leve em conta o tempo diário disponível informado pela pessoa ao propor aplicações práticas.
4. Se houver desabafo final, trate-o como pista decisiva da dor principal.
5. Mostre um progresso pastoral em 7 dias: acolhimento, verdade bíblica, arrependimento, descanso em Cristo, prática diária, perseverança e renovação.
6. Use versículos bíblicos reais e coerentes com o tema do dia.
7. Não invente experiências que a pessoa não relatou.
8. O texto deve ser íntimo, pastoral e bíblico, mas claro e direto.

ESTRUTURA DE CADA DIA:
- title: título curto e pastoral do dia
- verseReference: referência bíblica real
- verse: texto bíblico completo ou trecho fiel suficiente para o uso devocional
- reflection: 180 a 260 palavras, sempre conectando as respostas do quiz ao evangelho de Jesus
- prayer: 90 a 160 palavras, oração cristã evangélica em nome de Jesus, coerente com o dia
- application: 60 a 120 palavras, passo prático viável para hoje, considerando o tempo e a fase espiritual da pessoa

FORMATO DE SAÍDA:
Retorne JSON VÁLIDO no formato:
{
  "days": [
    {
      "day": 1,
      "title": "...",
      "verseReference": "...",
      "verse": "...",
      "reflection": "...",
      "prayer": "...",
      "application": "..."
    }
  ]
}

EXIGÊNCIAS FINAIS:
- Retorne exatamente 7 dias.
- Cada reflexão deve citar ou parafrasear claramente elementos concretos das respostas.
- O devocional deve transmitir verdade bíblica, arrependimento, graça e direção prática em Jesus.
- Se o mesmo texto pudesse servir para outra pessoa com respostas diferentes, então sua resposta está errada.`;
}

const buildFallbackDayLibrary = (request: DevotionalRequest, firstName: string) => {
  const responses = request.responses || {};
  const currentState = getResponseValue(responses, 1, "step2") || "uma fase espiritual sensível";
  const constancyDifficulty = getResponseValue(responses, 2, "step3") || "a dificuldade de permanecer constante";
  const bibleRoutine = getResponseValue(responses, 3, "step4") || "uma rotina ainda irregular com a Palavra";
  const prayerLife = getResponseValue(responses, 4, "step5") || "uma vida de oração que precisa ser fortalecida";
  const missingWithGod = getResponseValue(responses, 5, "step6") || "mais presença de Deus";
  const currentTreatment = getResponseValue(responses, 6, "step7") || "um processo de tratamento interior";
  const desireWithGod = getResponseValue(responses, 7, "step8") || "crescer com Deus de forma sincera";
  const availableTime = getResponseValue(responses, 8, "step9") || "um tempo curto, mas real";
  const biggestDifficulty = getResponseValue(responses, 9, "step10") || "instabilidade espiritual";
  const selfDescription = getResponseValue(responses, 10, "step11") || request.profileName;
  const additionalContext = getResponseValue(responses, 11, "step12");
  const intro = firstName ? `${firstName}, ` : "";
  const extraPain = additionalContext
    ? ` Quando você desabafou dizendo "${additionalContext}", isso deixou ainda mais claro o peso dessa fase.`
    : "";

  return [
    {
      day: 1,
      title: "Jesus vê sua fase atual",
      verseReference: "Mateus 11:28",
      verse: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.",
      reflection: `${intro}o que você respondeu mostra que hoje você se percebe em ${currentState}. Isso não é detalhe. Existe um cansaço real por trás de ${constancyDifficulty}, de ${bibleRoutine} e de ${prayerLife}. Jesus não trata esse quadro com frieza; Ele chama justamente os cansados e sobrecarregados para perto. Seu diagnóstico espiritual não é um rótulo para condenação, mas um convite para ser enxergado com verdade. Quando você diz que sente falta de ${missingWithGod}, fica evidente que ainda existe sede de Deus em seu coração. Essa sede é importante, porque aponta que sua alma não se acostumou a viver longe da presença do Senhor. ${extraPain} O primeiro movimento do evangelho não é desempenho, é rendição. Antes de tentar provar força, você precisa ouvir Cristo dizendo que Ele recebe quem chega quebrado. Hoje, a Palavra não manda você fingir estabilidade; ela chama você para descansar em Jesus com sinceridade e fé.`,
      prayer: `Senhor Jesus, eu me aproximo de Ti como estou, sem esconder meu cansaço e minhas falhas. Tu conheces a fase em que me encontro e vês como tenho lutado com ${constancyDifficulty}. Eu reconheço que preciso do Teu alívio, da Tua graça e da Tua presença. Perdoa-me pelas vezes em que tentei seguir sozinho(a) e fortalece meu coração para voltar a Ti com sinceridade. Traz descanso para minha alma e reacende em mim a alegria da salvação. Em nome de Jesus, amém.`,
      application: `Separe hoje ${availableTime} para fazer apenas duas coisas: releia Mateus 11:28 em voz baixa três vezes e depois fale com Jesus com honestidade total sobre seu cansaço. Não tente impressionar a Deus. Apenas reconheça diante dEle a fase em que você está e entregue a Ele o peso que você tem carregado.`
    },
    {
      day: 2,
      title: "A verdade corrige sua alma",
      verseReference: "Salmos 119:105",
      verse: "Lâmpada para os meus pés é a tua palavra e, luz para os meus caminhos.",
      reflection: `${intro}uma das marcas mais claras das suas respostas é que sua caminhada tem sofrido com ${bibleRoutine}. Quando a Palavra perde espaço, o coração fica mais vulnerável ao medo, à distração e à oscilação. Deus não nos deu as Escrituras como peso religioso, mas como luz real para dias confusos. O que hoje parece nebuloso em sua vida espiritual não será resolvido com motivação momentânea, e sim com exposição constante à verdade. Jesus venceu a tentação respondendo com a Palavra, e isso mostra que maturidade espiritual não cresce separada da Bíblia. Seu resultado espiritual revela dores concretas, mas também mostra que o Senhor está lhe chamando de volta ao fundamento. A mudança começa quando a voz de Deus volta a ocupar o lugar que tantas outras vozes têm ocupado dentro de você. A Bíblia não apenas informa; ela confronta, consola, alinha e reacende a fé.`,
      prayer: `Pai, eu reconheço que preciso voltar a dar lugar à Tua Palavra. Muitas vezes minha mente tem sido ocupada por preocupações, distrações e pensamentos que me afastam da verdade. Dá-me fome das Escrituras e disciplina para ouvir a Tua voz acima de todo ruído. Que a Tua Palavra ilumine meu caminho, corrija meus pensamentos e me conduza de volta a uma vida centrada em Cristo. Em nome de Jesus, amém.`,
      application: `Hoje escolha um único trecho bíblico para meditar sem pressa: Salmos 119:105. Anote em uma frase onde sua vida está sem luz neste momento. Em seguida, escreva uma decisão simples para recolocar a Palavra no centro da sua rotina a partir de amanhã, mesmo que isso comece com poucos minutos.`
    },
    {
      day: 3,
      title: "Cristo trata o coração ferido",
      verseReference: "Salmos 34:18",
      verse: "Perto está o Senhor dos que têm o coração quebrantado e salva os de espírito oprimido.",
      reflection: `${intro}você revelou que sente falta de ${missingWithGod} e que nesta fase Deus tem tratado ${currentTreatment}. Isso mostra que sua necessidade não é superficial. Há áreas internas que pedem cura, arrependimento, restauração e consolação. O evangelho não ignora a ferida; ele entra nela com verdade e graça. Em Jesus, Deus não se aproxima apenas da sua versão forte, mas do seu coração quebrantado. O Senhor usa processos difíceis para expor onde você tem buscado sustento fora dEle, mas Ele faz isso para restaurar, não para destruir. A proximidade de Deus não depende de você parecer bem; ela se manifesta justamente quando você admite a necessidade de socorro. Sua dor pode até ter confundido sua percepção, mas não anulou a fidelidade do Senhor. Cristo continua perto, tratando o que ninguém vê, formando em você uma dependência mais sincera e uma fé menos superficial.`,
      prayer: `Senhor, Tu conheces o que está sendo tratado dentro de mim. Tu sabes onde meu coração está ferido, endurecido ou cansado. Eu não quero resistir ao Teu cuidado. Vem curar o que precisa ser curado, confrontar o que precisa ser confrontado e restaurar o que foi enfraquecido em mim. Que eu não fuja do Teu processo, mas aprenda a permanecer em Ti. Em nome de Jesus, amém.`,
      application: `Hoje escreva em uma folha: “O que Deus está tratando em mim nesta fase?” Responda com sinceridade usando o que você mesmo(a) disse no quiz sobre ${currentTreatment}. Depois ore por cinco minutos entregando isso a Cristo e pedindo coragem para cooperar com a obra dEle em você.`
    },
    {
      day: 4,
      title: "Pequenos passos com constância",
      verseReference: "Tiago 4:8",
      verse: "Chegai-vos a Deus, e ele se chegará a vós outros.",
      reflection: `${intro}seu desejo declarado foi ${desireWithGod}, mas você também reconheceu que a constância tem sido atingida por ${biggestDifficulty}. Essa combinação mostra fome espiritual e, ao mesmo tempo, limitação prática. Deus pode fazer muito com passos pequenos oferecidos com fidelidade. O problema de muitos momentos da jornada cristã não é a ausência de desejo, e sim a falta de ritmo santo. Aproximar-se de Deus envolve decisão concreta: abrir a Bíblia, orar com sinceridade, confessar pecado, cortar distrações e obedecer no cotidiano. O Senhor honra esse movimento humilde. Você não precisa esperar um cenário ideal para começar. Em Cristo, o caminho de volta é aberto hoje. A intimidade não nasce em explosões emocionais esporádicas, mas no hábito de chegar-se a Deus repetidas vezes, mesmo quando o coração ainda está sendo reorganizado.`,
      prayer: `Deus, eu reconheço que meu desejo de viver ${desireWithGod} precisa se transformar em prática. Livra-me da inconstância, da procrastinação espiritual e das desculpas que me afastam de Ti. Dá-me perseverança para construir uma rotina simples e fiel. Que eu me aproxime do Senhor não apenas quando estiver bem, mas também quando estiver fraco(a). Em nome de Jesus, amém.`,
      application: `Monte hoje um plano mínimo de constância para os próximos 3 dias usando o tempo real que você disse ter: ${availableTime}. Exemplo: leitura breve, oração honesta e um registro de uma verdade bíblica. O alvo não é fazer muito; é voltar a ser constante com Deus.`
    },
    {
      day: 5,
      title: "Sua fraqueza não vence Cristo",
      verseReference: "2 Coríntios 12:9",
      verse: "A minha graça te basta, porque o poder se aperfeiçoa na fraqueza.",
      reflection: `${intro}talvez uma das razões de você se sentir ${selfDescription} seja o peso de perceber a própria limitação. Suas respostas mostram lutas reais, mas a graça de Deus não trabalha negando fraquezas; ela trabalha dentro delas. Em Cristo, a consciência da necessidade pode se tornar o lugar mais fértil para amadurecimento. Isso não significa acomodar-se, e sim abandonar a ilusão de autossuficiência. Quando a alma entende que não consegue sozinha, começa a depender da suficiência de Jesus. Seu resultado espiritual apontou desafios concretos como ${request.challenges[0] || "instabilidade espiritual"}, e isso exige dependência diária do Senhor. Você não está sendo chamado(a) a sustentar a própria vida espiritual no braço; está sendo chamado(a) a permanecer em Cristo, de quem vem a força para continuar.`,
      prayer: `Jesus, eu confesso minha fraqueza diante de Ti. Muitas vezes eu me sinto incapaz de sustentar uma vida espiritual firme, e isso me desanima. Mas hoje eu recebo a Tua graça como suficiente para mim. Ensina-me a depender menos da minha força e mais do Teu poder. Que minha limitação não me afaste de Ti, mas me conduza para mais perto da Tua presença. Em nome de Jesus, amém.`,
      application: `Escolha hoje uma fraqueza específica que mais tem atrapalhado sua constância com Deus, como ${biggestDifficulty}. Escreva ao lado uma verdade bíblica maior do que essa fraqueza. Repita essa verdade durante o dia toda vez que o desânimo ou a culpa tentarem dominar seu coração.`
    },
    {
      day: 6,
      title: "Permaneça mesmo sem sentir tudo",
      verseReference: "João 15:5",
      verse: "Eu sou a videira, vós, os ramos. Quem permanece em mim, e eu, nele, esse dá muito fruto; porque sem mim nada podeis fazer.",
      reflection: `${intro}sua jornada precisa ser construída sobre permanência, não sobre impulso. Talvez em alguns dias você não sinta grandes emoções espirituais, mas isso não significa ausência de Deus. Jesus ensinou que fruto nasce de permanência. Suas respostas mostram que você deseja viver algo verdadeiro com o Senhor, mas a oscilação tem quebrado a continuidade dessa caminhada. Permanecer é voltar a Cristo todos os dias: pela Palavra, pela oração, pela obediência e pela confiança. Não é intensidade sem continuidade; é comunhão sustentada pela graça. Quando você permanece, até áreas cansadas começam a florescer novamente. Seu coração não será fortalecido apenas por experiências marcantes, mas por raízes mais profundas em Jesus. É assim que a fé evangélica amadurece: por meio de relacionamento real com Cristo, e não de ativismo religioso.`,
      prayer: `Senhor Jesus, eu quero permanecer em Ti. Livra-me da superficialidade, da religiosidade vazia e da pressa de querer resultados sem comunhão. Ensina-me a voltar para Ti todos os dias, mesmo quando minhas emoções estiverem confusas. Firma minhas raízes em Tua Palavra e produz fruto verdadeiro em minha vida. Em nome de Jesus, amém.`,
      application: `Hoje faça um compromisso simples: voltar a João 15:5 em dois momentos diferentes do dia. Em cada leitura, responda a esta pergunta: “Como posso permanecer em Cristo de modo prático ainda hoje?” Depois obedeça a uma resposta concreta, por menor que pareça.`
    },
    {
      day: 7,
      title: "Recomeço com os olhos em Jesus",
      verseReference: "Hebreus 12:2",
      verse: "Olhando firmemente para o Autor e Consumador da fé, Jesus...",
      reflection: `${intro}ao final destes dias, o ponto principal não é que todos os seus problemas desapareceram, mas que seu olhar foi reposicionado. Seu diagnóstico mostrou um quadro específico: ${request.profileDescription}. Isso continua sendo sério, mas agora precisa ser interpretado à luz de Cristo. O mesmo Jesus que revela sua necessidade é o Jesus que sustenta sua fé, corrige seu caminho e renova sua esperança. O que você deseja viver com Deus não será construído apenas por esforço; será sustentado por um relacionamento contínuo com o Salvador. Se houve pecado, confesse. Se houve frieza, volte. Se houve cansaço, descanse nEle. Se houve distração, reorganize sua vida com prioridade espiritual. Você não termina esta jornada olhando para si mesmo(a), mas para Jesus, o centro da fé cristã, o fundamento da graça e a esperança de verdadeira transformação.`,
      prayer: `Pai, obrigado porque em Jesus existe caminho de volta, consolo para o cansado e firmeza para quem deseja recomeçar. Eu entrego a Ti minha caminhada e peço que meu coração permaneça fixo em Cristo. Guarda-me da superficialidade, fortalece minha obediência e ajuda-me a viver uma fé bíblica, sincera e perseverante. Que os próximos dias não sejam marcados por promessas vazias, mas por comunhão real contigo. Em nome de Jesus, amém.`,
      application: `Feche esta semana definindo um compromisso espiritual para os próximos 7 dias com base nas recomendações do seu resultado: ${request.recommendations[0] || "voltar a cultivar uma rotina com Deus"}. Compartilhe essa decisão com alguém de confiança da fé cristã e peça oração para perseverar.`
    },
  ] satisfies GeneratedDay[];
};

export function buildFallbackDevotionalContent(request: DevotionalRequest): GeneratedDay[] {
  const firstName = getFirstName(request);
  return buildFallbackDayLibrary(request, firstName);
}

const parseGeneratedDays = (rawContent: unknown): GeneratedDay[] => {
  const contentStr = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
  const parsed = JSON.parse(contentStr);
  const days = Array.isArray(parsed) ? parsed : parsed.days;

  if (!Array.isArray(days) || days.length !== 7) {
    throw new Error(`Esperado 7 dias de devocional, recebido ${Array.isArray(days) ? days.length : 0}`);
  }

  return days.map((day, index) => ({
    day: Number(day.day ?? index + 1),
    title: String(day.title ?? `Dia ${index + 1}`),
    verse: String(day.verse ?? ""),
    verseReference: String(day.verseReference ?? ""),
    reflection: String(day.reflection ?? ""),
    prayer: String(day.prayer ?? ""),
    application: String(day.application ?? ""),
  }));
};

export async function generateDevotionalContent(request: DevotionalRequest): Promise<GeneratedDay[]> {
  const prompt = buildDevotionalPrompt(request);

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um pastor conselheiro evangélico que escreve devocionais cristãos personalizados, bíblicos, centrados em Jesus e sempre retorna JSON válido com exatamente 7 dias.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "devotional_content",
          strict: true,
          schema: {
            type: "object",
            properties: {
              days: {
                type: "array",
                minItems: 7,
                maxItems: 7,
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    title: { type: "string" },
                    verse: { type: "string" },
                    verseReference: { type: "string" },
                    reflection: { type: "string" },
                    prayer: { type: "string" },
                    application: { type: "string" },
                  },
                  required: ["day", "title", "verse", "verseReference", "reflection", "prayer", "application"],
                  additionalProperties: false,
                },
              },
            },
            required: ["days"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Resposta vazia da IA na geração do devocional");
    }

    return parseGeneratedDays(content);
  } catch (error) {
    console.error("Erro ao gerar conteúdo do devocional com IA, usando fallback personalizado:", error);
    return buildFallbackDevotionalContent(request);
  }
}

export async function generateDevotionalPDF(request: DevotionalRequest): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const devotionalDays = await generateDevotionalContent(request);
      const firstName = getFirstName(request);
      const personalizedTitle = firstName ? `Devocional de ${firstName}` : "Devocional Personalizado";

      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.fontSize(20).font("Helvetica-Bold").text(personalizedTitle);
      doc.moveDown(0.2);
      doc.fontSize(15).font("Helvetica").text("7 dias com Jesus, base bíblica e aplicação prática");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica").text(`Perfil espiritual identificado: ${normalizePdfText(request.profileName)}`);
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica").text(normalizePdfText(request.profileDescription), {
        align: "justify",
      });
      doc.moveDown(0.8);

      if (request.challenges.length > 0) {
        doc.fontSize(11).font("Helvetica-Bold").text("Desafios percebidos:");
        doc.fontSize(10).font("Helvetica").text(normalizePdfText(request.challenges.join("; ")), { align: "justify" });
        doc.moveDown(0.5);
      }

      if (request.recommendations.length > 0) {
        doc.fontSize(11).font("Helvetica-Bold").text("Direção pastoral inicial:");
        doc.fontSize(10).font("Helvetica").text(normalizePdfText(request.recommendations.join("; ")), {
          align: "justify",
        });
        doc.moveDown(0.5);
      }

      devotionalDays.forEach((day, index) => {
        if (index > 0) {
          doc.addPage();
        }

        doc.fontSize(15).font("Helvetica-Bold").text(`Dia ${day.day} — ${normalizePdfText(day.title)}`);
        doc.moveDown(0.4);

        doc.fontSize(11).font("Helvetica-Bold").text("Texto bíblico:");
        doc.fontSize(10).font("Helvetica").text(normalizePdfText(day.verse), { align: "justify" });
        doc.moveDown(0.2);
        doc.fontSize(9).font("Helvetica-Oblique").text(normalizePdfText(day.verseReference));
        doc.moveDown(0.5);

        doc.fontSize(11).font("Helvetica-Bold").text("Reflexão:");
        doc.fontSize(10).font("Helvetica").text(normalizePdfText(day.reflection), { align: "justify" });
        doc.moveDown(0.5);

        doc.fontSize(11).font("Helvetica-Bold").text("Oração:");
        doc.fontSize(10).font("Helvetica").text(normalizePdfText(day.prayer), { align: "justify" });
        doc.moveDown(0.5);

        doc.fontSize(11).font("Helvetica-Bold").text("Aplicação para hoje:");
        doc.fontSize(10).font("Helvetica").text(normalizePdfText(day.application), { align: "justify" });
      });

      doc.addPage();
      doc.fontSize(14).font("Helvetica-Bold").text("Encerramento");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica").text(
        normalizePdfText(
          "Que esta jornada continue levando seu coração de volta para Jesus, com arrependimento sincero, fé bíblica, constância espiritual e dependência diária da graça de Deus. Persevere na Palavra, na oração e na comunhão cristã."
        ),
        { align: "justify" }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export type { DevotionalRequest, GeneratedDay };
