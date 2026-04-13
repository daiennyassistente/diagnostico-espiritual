type ResultHeadlineInput = {
  profileName: string;
  personalizedTitle: string;
};

const normalizeTitle = (value: string) => value.trim().replace(/[.!?\s]+$/g, '');

export function buildResultHeadline({ profileName, personalizedTitle }: ResultHeadlineInput) {
  const preferredTitle = normalizeTitle(personalizedTitle);

  if (preferredTitle) {
    return preferredTitle;
  }

  return `Sua situação espiritual hoje revela: ${normalizeTitle(profileName)}`;
}
