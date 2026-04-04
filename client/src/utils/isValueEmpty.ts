import type { AdItem } from "../types/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isValueEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim().length === 0) return true;
  if (typeof value === "number" && value <= 0) return true;
  return false;
};

export const checkAdIssues = (ad: AdItem) => {
  const isDescriptionMissing =
    !ad.description || ad.description.trim().length < 10;

  const hasNoParams = !ad.params || Object.keys(ad.params).length === 0;

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
