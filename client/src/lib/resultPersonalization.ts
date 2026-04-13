const readResponse = (responses: Record<string, string>, numericKey: string, stepKey: string): string => {
  return (responses[stepKey] ?? responses[numericKey] ?? "").trim();
};

const quote = (value: string): string => `“${value.replace(/\s+/g, " ").trim()}”`;

export function extractQuizInsights(responses: Record<string, string> | null): string[] {
  if (!responses) {
    return [];
  }

  const insights = [
    {
      value: readResponse(responses, "1", "step2"),
      formatter: (value: string) => `Hoje você se descreve como ${quote(value)}.`,
    },
    {
      value: readResponse(responses, "2", "step3"),
      formatter: (value: string) => `Sua principal trava espiritual apareceu como ${quote(value)}.`,
    },
    {
      value: readResponse(responses, "5", "step6"),
      formatter: (value: string) => `Você sente falta de ${quote(value)} na sua caminhada com Deus.`,
    },
    {
      value: readResponse(responses, "7", "step8"),
      formatter: (value: string) => `O seu desejo mais forte agora é viver ${quote(value)}.`,
    },
    {
      value: readResponse(responses, "8", "step9"),
      formatter: (value: string) => `Na prática, você disse que consegue separar ${quote(value)} para recomeçar.`,
    },
    {
      value: readResponse(responses, "11", "step12"),
      formatter: (value: string) => `No espaço aberto, você escreveu ${quote(value)}.`,
    },
  ];

  return insights
    .filter((item) => item.value.length > 0)
    .map((item) => item.formatter(item.value))
    .slice(0, 5);
}
