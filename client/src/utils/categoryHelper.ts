// src/utils/categoryHelper.ts

export const CATEGORY_MAP = {
  electronics: "Электроника",
  auto: "Транспорт",
  real_estate: "Недвижимость",
} as const;

export const getServiceCategory = (label: string): string => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const entry = Object.entries(CATEGORY_MAP).find(([_, v]) => v === label);
  return entry ? entry[0] : label.toLowerCase();
};

// Для отображения НА фронте (из англ в русский)
export const getDisplayCategory = (raw: string | undefined): string => {
  if (!raw) return "Без категории";
  const key = raw.toLowerCase() as keyof typeof CATEGORY_MAP;
  return CATEGORY_MAP[key] || raw;
};
