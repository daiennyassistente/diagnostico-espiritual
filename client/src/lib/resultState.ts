export function resolveLeadIdFromSources(search: string, storedLeadId: string | null): number | null {
  const params = new URLSearchParams(search);
  const idFromUrl = params.get('leadId');
  const resolvedLeadId = idFromUrl ?? storedLeadId;

  if (!resolvedLeadId) {
    return null;
  }

  const parsedLeadId = Number.parseInt(resolvedLeadId, 10);
  return Number.isNaN(parsedLeadId) ? null : parsedLeadId;
}

interface StoredQuizStateInput {
  sessionUserName: string | null;
  localUserName: string | null;
  localResponses: string | null;
  sessionResponses: string | null;
}

export interface StoredQuizState {
  userName: string;
  responses: Record<string, string> | null;
}

export function readStoredQuizState({
  sessionUserName,
  localUserName,
  localResponses,
  sessionResponses,
}: StoredQuizStateInput): StoredQuizState {
  const storedUserName = sessionUserName ?? localUserName;
  const storedResponses = localResponses ?? sessionResponses;

  if (!storedResponses) {
    return {
      userName: storedUserName ?? '',
      responses: null,
    };
  }

  const parsedResponses = JSON.parse(storedResponses) as Record<string, string>;

  return {
    userName: storedUserName ?? parsedResponses[0] ?? '',
    responses: parsedResponses,
  };
}
