export interface AdItem {
  id: string;
  category: string;
  title: string;
  price: number;
  requiresRevision?: boolean;
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
