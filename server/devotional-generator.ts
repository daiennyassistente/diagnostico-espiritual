import PDFDocument from "pdfkit";
import { Buffer } from "buffer";

interface DevotionalDay {
  day: number;
  title: string;
  verse: string;
  verseReference: string;
  reflection: string;
  prayer: string;
  application: string;
}

interface DevotionalInput {
  profileName: string;
  profileDescription: string;
  challenges: string[];
  recommendations: string[];
  responses: Record<string, string>;
}

// Mapeamento de perfis para temas de devocionais
const devotionalThemes: Record<string, DevotionalDay[]> = {
  "Amadurecendo na Fé": [
    {
      day: 1,
      title: "Quando você não sabe mais o que fazer",
      verse: "Confia no Senhor de todo o teu coração e não te esteies no teu próprio entendimento.",
      verseReference: "Provérbios 3:5",
      reflection: "Tem dias em que tudo parece incerto. Você tenta entender, tenta resolver, tenta controlar... mas nada parece funcionar. E no fundo, isso cansa. Deus nunca te pediu para carregar o peso do mundo. Ele te convida a confiar — mesmo sem entender. Confiar não é ter respostas. É descansar sabendo que Ele tem.",
      prayer: "Senhor, eu não sei o que fazer, mas o Senhor sabe. Eu entrego minhas dúvidas, meus medos e minhas preocupações em Tuas mãos. Me ensina a confiar, mesmo quando tudo parece confuso.",
      application: "Hoje, quando a ansiedade vier, não lute sozinho. Pare por um momento e diga: 'Deus, eu confio em Ti.'"
    },
    {
      day: 2,
      title: "A força que vem do descanso",
      verse: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
      verseReference: "Mateus 11:28",
      reflection: "Você não precisa estar forte o tempo todo. Deus não espera perfeição de você. Ele espera que você reconheça quando está cansado e busque descanso nEle. O descanso não é preguiça — é sabedoria. É reconhecer seus limites e confiar que Deus é suficiente.",
      prayer: "Jesus, eu estou cansado. Cansado de tentar ser forte, de carregar tudo sozinho. Eu venho a Ti agora, buscando Teu descanso e Tua paz.",
      application: "Reserve 10 minutos hoje para simplesmente estar na presença de Deus, sem pedir nada, apenas descansando."
    },
    {
      day: 3,
      title: "Quando a fé é testada",
      verse: "Bem-aventurado o homem que sofre a prova; porque, depois de aprovado, receberá a coroa da vida.",
      verseReference: "Tiago 1:12",
      reflection: "As dificuldades não significam que Deus te abandonou. Elas são oportunidades de crescimento. Cada desafio é uma chance de descobrir que Deus é mais real, mais forte, mais fiel do que você imaginava. Sua fé está se desenvolvendo, não se perdendo.",
      prayer: "Senhor, mesmo quando tudo é difícil, eu escolho confiar em Ti. Ajuda-me a ver Tua mão nos desafios e a crescer através deles.",
      application: "Identifique um desafio que você está enfrentando e escreva uma razão pela qual você ainda pode confiar em Deus nele."
    },
    {
      day: 4,
      title: "Transformação através da Palavra",
      verse: "Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção e para a instrução na justiça.",
      verseReference: "2 Timóteo 3:16",
      reflection: "A Palavra de Deus não é apenas informação — é transformação. Cada versículo que você medita é uma semente plantada em seu coração. Com o tempo, essas sementes crescem e mudam quem você é. Não é sobre ler mais, é sobre deixar a Palavra trabalhar em você.",
      prayer: "Deus, abre meu coração para receber Tua Palavra. Que ela não apenas entre em minha mente, mas transforme meu coração e minha vida.",
      application: "Escolha um versículo que toca seu coração hoje. Escreva-o e medite nele durante o dia."
    },
    {
      day: 5,
      title: "Oração: A conversa que muda tudo",
      verse: "Portanto, confessai os vossos pecados uns aos outros, e orai uns pelos outros, para que sareis; a oração do justo pode muito em seus efeitos.",
      verseReference: "Tiago 5:16",
      reflection: "Oração não é uma fórmula mágica. É uma conversa real com Deus. Você pode ser honesto, vulnerável, até mesmo zangado. Deus quer ouvir você de verdade. E quando você ora, você não está sozinho — o Espírito Santo intercede por você.",
      prayer: "Pai, eu quero aprender a orar de verdade. Não palavras vazias, mas conversas sinceras. Ensina-me a abrir meu coração para Ti.",
      application: "Hoje, ore sem seguir um padrão. Apenas converse com Deus como se estivesse falando com um amigo querido."
    },
    {
      day: 6,
      title: "Comunidade: Você não está sozinho",
      verse: "Portanto, exortai-vos mutuamente e edificai-vos uns aos outros, como também estais fazendo.",
      verseReference: "1 Tessalonicenses 5:11",
      reflection: "Sua jornada espiritual não é solitária. Deus criou a comunidade para nos sustentar, encorajar e fortalecer. Quando você compartilha suas lutas com outros cristãos, você descobre que não está sozinho. E quando você encoraja outros, você também cresce.",
      prayer: "Senhor, obrigado pela comunidade. Ajuda-me a ser honesto sobre minhas lutas e a buscar encorajamento nos irmãos. E que eu possa encorajar outros também.",
      application: "Alcance alguém hoje. Compartilhe algo real sobre sua jornada ou simplesmente pergunte como eles estão."
    },
    {
      day: 7,
      title: "Seu próximo passo",
      verse: "Portanto, meus amados irmãos, sede firmes, inabaláveis e sempre abundantes na obra do Senhor, sabendo que o vosso trabalho não é vão no Senhor.",
      verseReference: "1 Coríntios 15:58",
      reflection: "Você chegou ao final deste devocional, mas o começo de sua transformação continua. Cada dia que você escolhe confiar em Deus, cada oração que você faz, cada versículo que você medita — tudo importa. Você está crescendo. Você está mudando. Você está se aproximando de Deus.",
      prayer: "Deus, obrigado por estes 7 dias. Continua trabalhando em mim. Que eu nunca pare de buscar uma conexão mais profunda com Você. Que minha fé cresça cada dia.",
      application: "Escreva uma oração pessoal para os próximos 7 dias. O que você quer que Deus faça em você? Que mudanças você quer ver?"
    }
  ],
  "Buscador Sedento": [
    {
      day: 1,
      title: "Sua sede é válida",
      verse: "Como o cervo brama pelas correntes de água, assim a minha alma brama por ti, ó Deus.",
      verseReference: "Salmo 42:1",
      reflection: "Você sente que está cansado de tentar ser forte. Essa sensação é válida. Mas saiba que essa sede que você sente por Deus é um presente. É o Espírito Santo chamando você de volta. Sua fome espiritual não é fracasso — é o começo de uma transformação real.",
      prayer: "Deus, minha alma tem sede de Ti. Eu reconheço que tentei viver sem Ti e isso não funciona. Eu quero voltar. Eu quero conhecer Você de verdade.",
      application: "Hoje, simplesmente reconheça sua sede por Deus. Não tente resolver nada. Apenas admita: 'Eu preciso de Deus.'"
    },
    {
      day: 2,
      title: "Voltando para casa",
      verse: "Levantei-me, e fui para meu pai. E quando ainda estava longe, meu pai o viu, e, movido de compaixão, correu, e se lançou sobre o seu pescoço, e o beijou.",
      verseReference: "Lucas 15:20",
      reflection: "Você pode ter se afastado de Deus. Mas Ele nunca se afastou de você. Ele está esperando. E quando você volta, mesmo que seja com vergonha, mesmo que seja com dúvidas, Ele corre para você. Não com julgamento, mas com amor.",
      prayer: "Pai, eu voltei. Perdoa-me por ter me afastado. Recebe-me de volta. Eu quero estar perto de Ti novamente.",
      application: "Se você se afastou de Deus, este é o momento de voltar. Não é nunca tarde. Faça um passo em direção a Ele hoje."
    },
    {
      day: 3,
      title: "Limpeza e renovação",
      verse: "Se confessarmos os nossos pecados, ele é fiel e justo para nos perdoar os pecados, e nos purificar de toda a injustiça.",
      verseReference: "1 João 1:9",
      reflection: "Voltar para Deus começa com confissão. Não é sobre ser perfeito. É sobre ser honesto. Quando você confessa o que fez, o que deixou de fazer, Deus não te rejeita — Ele te limpa. Você recomeça.",
      prayer: "Senhor, eu confesso meus pecados. As coisas que fiz, as coisas que deixei de fazer. Limpa-me e renova-me. Quero começar de novo.",
      application: "Escreva os pecados que você quer confessar. Depois, destrua o papel como símbolo de que você foi perdoado."
    },
    {
      day: 4,
      title: "Conhecendo o coração de Deus",
      verse: "Deus é amor.",
      verseReference: "1 João 4:8",
      reflection: "Deus não é um juiz furioso esperando para te punir. Ele é amor. Seu coração é compassivo, misericordioso, gentil. Quando você entende isso, tudo muda. Você não serve por medo — você serve por amor.",
      prayer: "Deus, ajuda-me a entender Teu amor. Que eu sinta Tua compaixão. Que eu saiba, no fundo do meu coração, que sou amado por Ti.",
      application: "Passe tempo meditando no amor de Deus. Leia 1 Coríntios 13:4-7 e imagine que Deus está dizendo essas palavras para você."
    },
    {
      day: 5,
      title: "Transformação de dentro para fora",
      verse: "Não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente, para que experimenteis qual seja a boa, agradável, e perfeita vontade de Deus.",
      verseReference: "Romanos 12:2",
      reflection: "Você não precisa mudar sua vida para Deus aceitar você. Você muda porque Deus já o aceitou. Quando você entende que é amado, sua mente muda. Seus desejos mudam. Você naturalmente quer ser melhor.",
      prayer: "Senhor, renova minha mente. Muda meus pensamentos, meus desejos, meu coração. Que eu seja transformado de dentro para fora.",
      application: "Identifique um pensamento ou desejo que você quer que Deus mude. Entregue isso a Ele e peça para ser transformado."
    },
    {
      day: 6,
      title: "Comunidade de fé",
      verse: "E todos os que criam estavam juntos, e tinham tudo em comum.",
      verseReference: "Atos 2:44",
      reflection: "Sua jornada de volta para Deus não é solitária. Há uma comunidade de pessoas que também estão buscando, crescendo, transformando. Você precisa deles e eles precisam de você. Juntos, você é mais forte.",
      prayer: "Deus, conecta-me com uma comunidade de fé. Que eu encontre pessoas que me entendam, que me encorajem, que caminhem comigo.",
      application: "Procure uma comunidade de fé. Uma igreja, um grupo de oração, um pequeno grupo. Você não está sozinho nessa jornada."
    },
    {
      day: 7,
      title: "Seu novo começo",
      verse: "Eis que faço novas todas as coisas.",
      verseReference: "Apocalipse 21:5",
      reflection: "Você não é a mesma pessoa que era no dia 1. Você começou uma jornada de transformação. Não será fácil. Haverá desafios. Mas você agora sabe que não está sozinho. Deus está com você. E Ele está fazendo você novo.",
      prayer: "Deus, obrigado por este novo começo. Continua comigo. Que eu cresça cada dia. Que minha fé seja real e transformadora.",
      application: "Escreva uma carta para você mesmo sobre o que Deus fez em você nestes 7 dias. Guarde-a e releia quando precisar de encorajamento."
    }
  ],
};

function generateDevotionalContent(input: DevotionalInput): DevotionalDay[] {
  // Extrai o nome do perfil (remove emoji)
  const profileNameClean = input.profileName.replace(/[^\w\s]/g, "").trim();
  
  // Procura por um tema correspondente
  for (const [theme, days] of Object.entries(devotionalThemes)) {
    if (profileNameClean.toLowerCase().includes(theme.toLowerCase()) || 
        theme.toLowerCase().includes(profileNameClean.toLowerCase())) {
      return days;
    }
  }
  
  // Se não encontrar um tema específico, usa o primeiro disponível
  return Object.values(devotionalThemes)[0];
}

function sanitizeText(text: string): string {
  // Remove emojis e caracteres especiais problemáticos
  // Remove emojis e caracteres especiais
  return text
    .replace(/[^\x00-\x7F]/g, "") // Remove caracteres não-ASCII
    .trim();
}

export async function generateDevotionalPDF(input: DevotionalInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Cores da paleta
      const colors = {
        primary: "#4A3F35",
        secondary: "#3E342C",
        accent: "#8B7355",
        light: "#F5F1EA",
      };

      // Título
      doc.fontSize(24).font("Helvetica-Bold").fillColor(colors.primary);
      doc.text("Devocional: 7 Dias para se Aproximar de Deus de Verdade", { align: "center" });
      
      doc.fontSize(14).font("Helvetica").fillColor(colors.secondary);
      doc.text("Personalizado para sua jornada espiritual", { align: "center" });
      doc.moveDown(0.5);

      // Introdução
      doc.fontSize(12).fillColor(colors.primary).font("Helvetica-Bold");
      doc.text("Introducao");
      doc.fontSize(11).font("Helvetica").fillColor(colors.secondary);
      
      const intro = `Talvez você esteja cansado...

Cansado de tentar ser forte o tempo todo.
Cansado de carregar coisas em silêncio.
Cansado de sentir que sua fé não é como deveria ser.

A verdade é que Deus nunca pediu perfeição —
Ele só pede um coração disponível.

Este devocional não é sobre religião.
É sobre relacionamento.

Deus não quer apenas que você O conheça...
Ele quer caminhar com você.`;

      doc.text(intro);
      doc.moveDown(1);

      // Instruções
      doc.fontSize(12).fillColor(colors.primary).font("Helvetica-Bold");
      doc.text("Como usar este devocional");
      doc.fontSize(11).font("Helvetica").fillColor(colors.secondary);
      
      const instructions = `Não tenha pressa.

Leia devagar.
Sinta cada palavra.
Ore com sinceridade — mesmo que simples.

Deus ouve até aquilo que você não consegue dizer.`;

      doc.text(instructions);
      doc.moveDown(1);

      // Gera os 7 dias
      const devotionalDays = generateDevotionalContent(input);

      devotionalDays.forEach((day, index) => {
        if (index > 0) {
          doc.addPage();
        }

        // Dia
        doc.fontSize(16).fillColor(colors.primary).font("Helvetica-Bold");
        doc.text(`DIA ${day.day} - ${sanitizeText(day.title).toUpperCase()}`);
        doc.moveDown(0.5);

        // Versículo
        doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
        doc.text("Versiculo");
        doc.fontSize(11).font("Helvetica").fillColor(colors.secondary);
        doc.text(`"${sanitizeText(day.verse)}"`);
        doc.fontSize(10).fillColor(colors.accent).font("Helvetica");
        doc.text(`— ${sanitizeText(day.verseReference)}`);
        doc.moveDown(0.5);

        // Reflexão
        doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
        doc.text("Reflexao");
        doc.fontSize(11).font("Helvetica").fillColor(colors.secondary);
        doc.text(sanitizeText(day.reflection));
        doc.moveDown(0.5);

        // Oração
        doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
        doc.text("Oracao");
        doc.fontSize(11).font("Helvetica").fillColor(colors.secondary);
        doc.text(sanitizeText(day.prayer));
        doc.moveDown(0.5);

        // Aplicação
        doc.fontSize(11).fillColor(colors.accent).font("Helvetica-Bold");
        doc.text("Aplicacao");
        doc.fontSize(11).font("Helvetica").fillColor(colors.secondary);
        doc.text(sanitizeText(day.application));
      });

      // Página final
      doc.addPage();
      doc.fontSize(16).fillColor(colors.primary).font("Helvetica-Bold");
      doc.text("Seu Proximo Passo", { align: "center" });
      doc.moveDown(1);

      doc.fontSize(11).font("Helvetica").fillColor(colors.secondary);
      const closing = `Você completou estes 7 dias de devocional.

Mas sua jornada com Deus não termina aqui.

Cada dia que você escolhe confiar em Deus,
cada oração que você faz,
cada versículo que você medita —
tudo importa.

Você está crescendo.
Você está mudando.
Você está se aproximando de Deus.

Continue.

Que Deus abençoe sua jornada.`;

      doc.text(closing, { align: "center" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
