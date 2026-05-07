/** Allowed academic years for team membership (newest first). */
export const ACADEMIC_YEARS = [
  "2025/2026",
  "2024/2025",
  "2023/2024",
  "2022/2023",
  "2021/2022",
  "2020/2021",
  "2019/2020",
  "2018/2019",
] as const;

export type AcademicYear = (typeof ACADEMIC_YEARS)[number];

export const [DEFAULT_ACADEMIC_YEAR] = ACADEMIC_YEARS;
