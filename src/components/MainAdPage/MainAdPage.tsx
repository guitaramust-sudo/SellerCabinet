import { useState, useMemo } from "react"; // Импортируем только хуки
import { Sidebar } from "../SideBar/Sidebar";
import { AdCard } from "../AdCard/AdCard";
import type {
  AdItem,
  FiltersState,
  SortOption,
  ViewMode,
} from "../../types/types";
import "./MainAdPage.scss";

const MOCK_DATA: AdItem[] = [
  { id: "1", category: "Электроника", title: "Наушники", price: 2990 },
  {
    id: "2",
    category: "Авто",
    title: "Volkswagen Polo",
    price: 1100000,
    requiresRevision: true,
  },
  { id: "3", category: "Недвижимость", title: "Студия, 25м²", price: 15000000 },
  {
    id: "4",
    category: "Недвижимость",
    title: "1-кк, 44м²",
    price: 19000000,
    requiresRevision: true,
  },
  {
    id: "5",
    category: "Электроника",
    title: 'MacBook Pro 16"',
    price: 64000,
    requiresRevision: true,
  },
];

export const MainAdPage = () => {
  const [filters, setFilters] = useState<FiltersState>({
    categories: [],
    onlyRequiresRevision: false,
    searchQuery: "",
    sortBy: "newest",
  });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const processedAds = useMemo(() => {
    const filtered = MOCK_DATA.filter((ad) => {
      const matchesSearch = ad.title
        .toLowerCase()
        .includes(filters.searchQuery.toLowerCase());
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(ad.category);
      const matchesRevision =
        !filters.onlyRequiresRevision || ad.requiresRevision;
      return matchesSearch && matchesCategory && matchesRevision;
    });

    return [...filtered].sort((a, b) => {
      if (filters.sortBy === "price-asc") return a.price - b.price;
      if (filters.sortBy === "price-desc") return b.price - a.price;
      return 0;
    });
  }, [filters]);

  return (
    <div className="ads-page">
      <header className="ads-page__header">
        <h1>Мои объявления</h1>
        <p>{processedAds.length} объявления</p>
      </header>

      <div className="ads-page__toolbar">
        <div className="ads-page__search">
          <input
            type="text"
            placeholder="Найти объявление..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters({ ...filters, searchQuery: e.target.value })
            }
          />
        </div>

        <div className="ads-page__controls">
          <div className="ads-page__view-switch">
            <button
              className={viewMode === "grid" ? "active" : ""}
              onClick={() => setViewMode("grid")}
            >
              ⊞
            </button>
            <button
              className={viewMode === "list" ? "active" : ""}
              onClick={() => setViewMode("list")}
            >
              ≡
            </button>
          </div>

          <select
            className="ads-page__sort"
            value={filters.sortBy}
            onChange={(e) =>
              setFilters({ ...filters, sortBy: e.target.value as SortOption })
            }
          >
            <option value="newest">По новизне</option>
            <option value="price-asc">Дешевле</option>
            <option value="price-desc">Дороже</option>
          </select>
        </div>
      </div>

      <div className="ads-page__layout">
        <Sidebar filters={filters} onChange={setFilters} />
        <main className="ads-page__content">
          {processedAds.length > 0 ? (
            <div
              className={`ads-page__container ${viewMode === "list" ? "is-list" : "is-grid"}`}
            >
              {processedAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          ) : (
            <div className="ads-page__empty">Ничего не найдено</div>
          )}
        </main>
      </div>
    </div>
  );
};
