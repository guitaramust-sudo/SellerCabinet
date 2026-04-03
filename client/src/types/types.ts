export type Category = "auto" | "real_estate" | "electronics";

// Специфичные параметры для Авто
export interface AutoParams {
  brand: string;
  model: string;
  yearOfManufacture: number;
  transmission: "manual" | "automatic";
  mileage: number;
}

// Специфичные параметры для Недвижимости
export interface RealEstateParams {
  type: "flat" | "house" | "room";
  address: string;
  area: number;
  floor: number;
}

// Специфичные параметры для Электроники
export interface ElectronicsParams {
  type: string;
  condition: "new" | "used";
  color?: string;
}

// Объединяем в Union
export type AdParams =
  | ({ category: "auto" } & AutoParams)
  | ({ category: "real_estate" } & RealEstateParams)
  | ({ category: "electronics" } & ElectronicsParams);

export interface AdItem {
  id: number | string;
  category: Category;
  title: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt?: string;
  // Теперь params зависят от категории
  params:
    | AutoParams
    | RealEstateParams
    | ElectronicsParams
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | Record<string, any>;
  needsRevision?: boolean;
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
