/** KOPPS sometimes returns this placeholder instead of a real title. */
export function isUsableKthProgrammeTitle(title: string): boolean {
  const t = title.trim();
  if (!t) return false;
  return !/translation\s+not\s+found/i.test(t);
}
