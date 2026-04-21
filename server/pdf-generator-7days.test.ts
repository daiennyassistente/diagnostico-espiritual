import { describe, it, expect } from "vitest";
import { generatePremiumDevotionalPDF } from "./pdf-generator-premium";
import { writeFileSync } from "fs";
import { join } from "path";

describe("Premium PDF Generator - 7 Days", () => {
  const testContent = {
    userName: "João Silva",
    profileName: "Espiritualmente em Reconstrução",
    profileDescription:
      "Você está em uma fase de reconstrução espiritual, buscando reestabelecer sua intimidade com Deus após um período de distância.",
    strengths: [
      "Consciência da necessidade de Deus",
      "Disposição para mudança",
      "Fé resiliente mesmo em dificuldades",
    ],
    challenges: [
      "Constância na vida de oração",
      "Rotina irregular com a Palavra",
      "Dificuldade em manter disciplina espiritual",
    ],
    recommendations: [
      "Estabeleça uma rotina diária simples de leitura bíblica",
      "Comece com orações breves mas sinceras",
      "Busque comunhão com outros cristãos",
    ],
    nextSteps: [
      "Dedique 10 minutos diários à leitura da Bíblia",
      "Participe de um grupo de oração ou estudo bíblico",
      "Registre suas reflexões e orações",
    ],
    days: [
      {
        day: 1,
        title: "Jesus vê sua fase atual",
        verseReference: "Mateus 11:28",
        verse: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.",
        reflection:
          "João, o que você respondeu mostra que hoje você se percebe em uma fase de reconstrução. Isso não é detalhe. Existe um cansaço real por trás da dificuldade em sua constância com Deus, de sua rotina irregular com a Palavra e de sua vida de oração que precisa ser fortalecida. Jesus vê você nesta fase. Ele não está surpreso, não está decepcionado. Ele vê alguém que reconhece a necessidade, que tem disposição para mudança e que ainda tem fé resiliente mesmo em dificuldades. Isso é precioso aos olhos de Deus. Quando você se sente cansado, quando sente que não consegue mais, Jesus diz: 'Vinde a mim'. Não é um convite para os fortes, é um convite para os cansados. E Ele promete aliviar seu fardo. Não significa que os problemas desaparecerão, mas significa que você não carregará mais sozinho.",
        prayer:
          "Senhor Jesus, eu me aproximo de Ti como estou, sem esconder meu cansaço e minhas falhas. Tu conheces a fase em que me encontro e vês como tenho lutado com a dificuldade em minha constância com Deus. Obrigado por não me condenar, mas por me chamar para perto. Ajuda-me a reconhecer que meu cansaço não é fracasso, é um sinal de que preciso de Ti. Renovo minha fé em Ti neste momento. Que eu sinta Teu alívio, Tua presença, Tua graça.",
        application:
          "Separe hoje um tempo para fazer apenas duas coisas: releia Mateus 11:28 em voz baixa três vezes e depois fale com Jesus com honestidade total sobre seu cansaço. Não precisa ser perfeito, apenas sincero. Diga a Ele exatamente como você se sente. Depois, escreva em uma frase: 'Hoje, Jesus vê minha fase e me convida para descansar nEle.'",
      },
      {
        day: 2,
        title: "A verdade corrige sua alma",
        verseReference: "Salmos 119:105",
        verse: "Lâmpada para os meus pés é a tua palavra e, luz para os meus caminhos.",
        reflection:
          "Uma das marcas mais claras das suas respostas é que sua caminhada tem sofrido com uma rotina irregular com a Palavra. Quando a Palavra perde espaço, o coração fica mais vulnerável ao medo, à distração e à oscilação. Você respondeu que sua vida de oração é sincera, mas instável. Isso é honesto. A Palavra de Deus é como uma lâmpada que ilumina cada passo. Sem ela, você anda no escuro, tropeçando, perdendo o caminho. A verdade bíblica não é apenas informação, é direção. É luz que corrige, que guia, que restaura. Quando você retoma a leitura da Bíblia, você não está apenas adquirindo conhecimento, está deixando que Deus ilumine as áreas escuras de sua vida. Você está permitindo que a verdade corrija seus pensamentos, suas emoções, suas escolhas.",
        prayer:
          "Pai, eu reconheço que preciso voltar a dar lugar à Tua Palavra. Muitas vezes minha mente tem sido ocupada por preocupações, distrações e pensamentos que me afastam da verdade. Confesso que deixei de lado a leitura regular da Bíblia e isso me deixou vulnerável. Perdoe-me por ter negligenciado a fonte de luz que Tu me deste. Reaviva em mim o desejo de conhecer Tua Palavra, de meditar nela, de deixá-la transformar meu coração. Que a Bíblia seja novamente a lâmpada que guia meus passos.",
        application:
          "Hoje escolha um único trecho bíblico para meditar sem pressa: Salmos 119:105. Anote em uma frase onde sua vida está sem luz neste momento. Depois, peça a Deus que ilumine esse lugar com Sua verdade. Comprometa-se a ler um pequeno trecho da Bíblia amanhã. Comece pequeno: um capítulo, um salmo, um evangelho. O importante é começar.",
      },
      {
        day: 3,
        title: "Confronto amoroso com a verdade",
        verseReference: "Hebreus 10:24-25",
        verse: "E consideremos uns aos outros, para nos estimularmos ao amor e às boas obras; não abandonando a nossa congregação, como é costume de alguns, mas exortando-nos uns aos outros.",
        reflection:
          "Você está sozinho em sua jornada espiritual? Suas respostas mostram alguém que busca comunhão com Deus, mas que pode estar isolado. A Bíblia é clara: não fomos feitos para caminhar sozinhos. A comunhão com outros cristãos não é um luxo, é uma necessidade. Quando você se afasta da comunidade, fica mais vulnerável ao desânimo, à dúvida e ao abandono da fé. Deus quer que você tenha pessoas ao seu lado que o estimulem, que orem com você, que o tragam de volta quando você se afastar. O isolamento é uma estratégia do inimigo para enfraquecê-lo. A comunidade é uma estratégia de Deus para fortalecê-lo. Você não precisa ter tudo resolvido para buscar comunhão. Você pode compartilhar sua luta, sua fase de reconstrução, e encontrar em outros cristãos compreensão, encorajamento e oração.",
        prayer:
          "Senhor, reconheço que tenho caminhado sozinho em muitos momentos. Confesso que às vezes tenho medo de me abrir, de compartilhar meus desafios com outros. Mas vejo agora que isso me enfraquece. Ajuda-me a ter coragem de buscar comunhão verdadeira. Traz pessoas piedosas ao meu caminho que me estimulem e que eu possa estimular também. Que eu não me sinta envergonhado de minha fase de reconstrução, mas que a compartilhe com confiança. Que eu encontre em Teu povo força, encorajamento e amor.",
        application:
          "Hoje, tome uma ação concreta: identifique uma pessoa cristã de confiança e envie uma mensagem simples dizendo que gostaria de conversar sobre sua fé. Não precisa ser longa, apenas sincera. Ou procure uma comunidade cristã, um grupo de oração, um estudo bíblico. Dê o primeiro passo. Se não conhece ninguém, procure uma igreja próxima a você.",
      },
      {
        day: 4,
        title: "Transformação através da obediência",
        verseReference: "João 14:15",
        verse: "Se me amais, guardareis os meus mandamentos.",
        reflection:
          "A transformação espiritual não vem de sentimentos, vem de obediência. Você pode não sentir vontade de orar, de ler a Bíblia, de ir à igreja. Mas a obediência não depende de sentimento, depende de escolha. Quando você escolhe obedecer a Deus mesmo sem sentir vontade, você demonstra amor real por Ele. E aqui está o milagre: a obediência gera sentimento. Quando você obedece, o Espírito Santo trabalha em seu coração e você começa a sentir a presença de Deus, a paz, a alegria. A transformação começa com um ato de vontade. Você não precisa esperar se sentir melhor para começar. Comece a obedecer e o sentimento virá depois. Isso é fé: agir como se Deus fosse real e confiável, mesmo quando você não sente Sua presença.",
        prayer:
          "Deus, eu quero te amar de verdade, não apenas com palavras. Ajuda-me a obedecer mesmo quando não tenho vontade. Fortalece minha vontade para fazer o que é certo, mesmo que seja difícil. Que minha obediência seja um ato de amor por Ti. Transforma meu coração através de minha disposição de obedecer. Que eu sinta Tua presença e Tua graça enquanto caminho em obediência. Que meus sentimentos se alinhem com minha fé.",
        application:
          "Escolha uma área específica onde você sabe que precisa obedecer a Deus, mas tem resistido. Pode ser oração diária, leitura bíblica, frequência à igreja, ou algo específico. Hoje, obedeça nessa área, mesmo que não sinta vontade. Faça isso como um ato de amor por Deus. Anote como você se sente depois. Provavelmente sentirá paz.",
      },
      {
        day: 5,
        title: "Renovação do coração",
        verseReference: "Romanos 12:2",
        verse: "E não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente, para que experimenteis qual seja a boa, agradável e perfeita vontade de Deus.",
        reflection:
          "Sua mente foi moldada por este mundo. Preocupações, ansiedades, pensamentos de fracasso, medo de não ser bom o suficiente. Tudo isso é do mundo. Mas Deus quer renovar sua mente. Ele quer que você pense como Ele pensa. Que você se veja como Ele o vê: amado, escolhido, capaz através de Cristo. A renovação da mente é um processo, não acontece de um dia para o outro. Mas começa hoje. Começa quando você para de acreditar nas mentiras do mundo e começa a acreditar na verdade de Deus sobre você. Você não é um fracasso. Você não é inadequado. Você não é abandonado. Você é amado. Você é perdoado. Você é capaz. Essas são as verdades de Deus sobre você.",
        prayer:
          "Pai, renova minha mente. Limpa os pensamentos que não vêm de Ti. Ajuda-me a pensar como Tu pensas sobre mim. Que eu veja a mim mesmo através dos olhos de Jesus. Que eu acredite que sou amado, que sou perdoado, que sou capaz através de Tua graça. Transforma meus pensamentos de derrota em pensamentos de vitória em Cristo. Que minha mente seja um lugar onde Tua verdade reina. Que cada pensamento seja cativo à obediência de Cristo.",
        application:
          "Hoje, sempre que um pensamento negativo vier à sua mente, pause e questione: 'Isso é verdade segundo a Bíblia?' Se não for, substitua por uma verdade bíblica. Por exemplo, se pensar 'Sou um fracasso', substitua por 'Sou amado e aceito em Cristo'. Faça isso conscientemente durante todo o dia. Escreva três verdades bíblicas sobre você e releia-as sempre que duvidarem.",
      },
      {
        day: 6,
        title: "Força na fraqueza",
        verseReference: "2 Coríntios 12:9",
        verse: "E disse-me: A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.",
        reflection:
          "Você respondeu que sua fé é resiliente mesmo em dificuldades. Isso é uma força real. Mas você também respondeu que tem dificuldade em manter disciplina espiritual. Aqui está a verdade: sua fraqueza é exatamente o lugar onde Deus quer trabalhar. Não é quando você é forte que Deus age mais, é quando você reconhece sua fraqueza e clama por Sua graça. Sua dificuldade em manter disciplina não é sua condenação, é seu convite para depender mais de Deus. Quando você fraqueja, Deus se fortalece em você. Sua graça não é para os fortes, é para os fracos. Não é para os perfeitos, é para os quebrantados. Quando você reconhece sua fraqueza e clama por Sua graça, você abre espaço para que o poder de Deus trabalhe em você.",
        prayer:
          "Senhor, reconheço minha fraqueza. Não consigo manter disciplina espiritual sozinho. Confesso que tenho tentado fazer isso com minha própria força e tenho falhado. Mas agora entendo: Tua graça é suficiente para mim. Teu poder se aperfeiçoa em minha fraqueza. Ajuda-me a depender de Ti, não de mim mesmo. Que eu encontre força em Tua graça, não em meu esforço. Que minha fraqueza seja o lugar onde Tua força se manifesta. Que eu sinta Teu poder trabalhando em minha vida.",
        application:
          "Identifique uma área onde você se sente fraco espiritualmente. Em vez de tentar ser forte por conta própria, ore pedindo a graça de Deus. Depois, tome uma ação pequena e viável nessa área. Por exemplo, se é difícil orar, comece com uma oração de 2 minutos. Se é difícil ler a Bíblia, comece com um versículo. Pequenos passos com a graça de Deus. Lembre-se: Deus não espera perfeição, Ele espera disposição.",
      },
      {
        day: 7,
        title: "Compromisso renovado",
        verseReference: "Josué 24:15",
        verse: "Porém, se vos parece mal servir ao Senhor, escolhei hoje a quem sirvais; se aos deuses que vossos pais serviram além do rio, ou aos deuses dos amorreus, em cuja terra habitais; mas eu e a minha casa serviremos ao Senhor.",
        reflection:
          "Estes 7 dias foram um tempo de encontro com Deus. Você foi confrontado com a verdade, desafiado a obedecer, renovado em seu coração. Agora vem a escolha mais importante: você vai continuar? Você vai manter o compromisso com Deus ou vai voltar aos velhos padrões? Não há meio termo. Ou você serve a Deus ou você serve a este mundo. Josué fez sua escolha e declarou: 'Eu e minha casa serviremos ao Senhor.' Agora é sua vez de fazer essa escolha. Não é uma escolha de um dia, é uma escolha que você faz todos os dias. Mas começa hoje. Você sentirá tentações, dificuldades, momentos em que quererá voltar aos velhos caminhos. Mas lembre-se: você já experimentou a graça de Deus, já sentiu Sua presença, já foi transformado. Não há nada neste mundo que seja melhor do que isso.",
        prayer:
          "Deus, estes 7 dias foram transformadores. Sinto-me renovado, restaurado, encontrado. Mas sei que a jornada não termina aqui. Hoje faço um compromisso: vou servir a Ti. Vou manter a disciplina espiritual, vou buscar comunhão com Teu povo, vou obedecer Tua Palavra. Não será fácil, mas com Tua graça, eu posso. Que este compromisso não seja apenas de hoje, mas de todos os dias da minha vida. Que eu seja um homem que serve a Deus com todo o coração. Que minha vida seja uma declaração de Teu amor e Tua fidelidade.",
        application:
          "Escreva uma carta para você mesmo. Nela, declare seu compromisso com Deus. Diga o que você vai fazer diferente a partir de agora. Seja específico. Depois, guarde essa carta em um lugar seguro e releia-a quando sentir que está enfraquecendo. Compartilhe seu compromisso com alguém de confiança que possa orar com você e ajudá-lo a manter a disciplina. Que esta seja a primeira de muitas decisões de servir a Deus.",
      },
    ],
  };

  it("should generate a PDF with all 7 days", async () => {
    const pdfBuffer = await generatePremiumDevotionalPDF(testContent);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(10000);
    
    // Save for inspection
    writeFileSync(
      join(process.cwd(), "test-devotional-7days.pdf"),
      pdfBuffer
    );
    console.log("7-day PDF saved to: test-devotional-7days.pdf");
    console.log("PDF size:", pdfBuffer.length, "bytes");
  });
});
