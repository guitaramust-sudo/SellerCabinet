export interface AdItem {
  id: string;
  category: string;
  title: string;
  price: number;
  createdAt: number; // Добавили
  description?: string; // Добавили
  needsRevision?: boolean;
  // Добавляем params, чтобы TS понимал, что там могут быть любые строки/числа
  params?: Record<string, string | number | undefined>;
  imageUrl?: string;
}

export type SortOption = "newest" | "price-asc" | "price-desc";

export interface FiltersState {
  categories: string[];
  onlyRequiresRevision: boolean;
  searchQuery: string;
  sortBy?: SortOption;
}

export type ViewMode = "grid" | "list";
