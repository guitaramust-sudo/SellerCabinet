export interface AdItem {
  id: string;
  category: string;
  title: string;
  price: number;
  createdAt: number;
  description?: string;
  needsRevision?: boolean;
  // Добавляем params, чтобы TS понимал, что там могут быть любые строки/числа
  params?: Record<string, string | number | undefined>;
  imageUrl?: string;
}

export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "title-asc"
  | "title-desc";

export interface FiltersState {
  categories: string[];
  onlyRequiresRevision: boolean;
  searchQuery: string;
  sortBy?: SortOption;
}

export type ViewMode = "grid" | "list";

export interface AIRequest {
  action: "improve" | "price";
  text?: string;
  title?: string;
}

export interface AIResponse {
  result: string;
}
