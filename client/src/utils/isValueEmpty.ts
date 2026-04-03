import type { AdItem } from "../types/types";

export const isValueEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim().length === 0) return true;
  if (typeof value === "number" && value <= 0) return true; // Например, год 0 или цена 0
  return false;
};

export const checkAdIssues = (ad: AdItem) => {
  // 1. Базовая проверка описания
  const isDescriptionMissing =
    !ad.description || ad.description.trim().length < 10;

  // 2. Проверка параметров (проходим по всем ключам, что есть в объекте)
  const hasNoParams = !ad.params || Object.keys(ad.params).length === 0;

  // Проверяем, нет ли пустых значений внутри параметров
  const hasIncompleteParams = ad.params
    ? Object.values(ad.params).some(isValueEmpty)
    : true;

  return {
    isDescriptionMissing,
    hasNoParams,
    hasIncompleteParams,
    any: isDescriptionMissing || hasNoParams || hasIncompleteParams,
  };
};
