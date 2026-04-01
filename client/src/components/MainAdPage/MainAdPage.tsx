import { useState } from "react";
import { Sidebar } from "../SideBar/Sidebar";
import { AdCard } from "../AdCard/AdCard";
import { useGetAdsQuery } from "../../store/adsApi"; // Наш новый хук
import type { FiltersState, SortOption, ViewMode } from "../../types/types";
import "./MainAdPage.scss";

export const MainAdPage = () => {
  // 1. Оставляем только стейт для фильтров и режима отображения
  const [filters, setFilters] = useState<FiltersState>({
    categories: [],
    onlyRequiresRevision: false,
    searchQuery: "",
    sortBy: "newest",
  });
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // 2. Магия RTK Query. Запрос улетит автоматически при изменении filters
  const { data, isLoading, isFetching, isError } = useGetAdsQuery(filters);

  // Обработка состояний загрузки
  if (isError)
    return (
      <div className="ads-page__error">
        Ошибка при загрузке данных. Проверьте, запущен ли сервер.
      </div>
    );

  const ads = data?.items || [];
  const totalCount = data?.total || 0;

  return (
    <div className={`ads-page ${isFetching ? "ads-page--loading" : ""}`}>
      <header className="ads-page__header">
        <h1>Мои объявления</h1>
        <p>{totalCount} объявления</p>
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
          {isLoading ? (
            <div className="ads-page__loader">Грузим данные...</div>
          ) : ads.length > 0 ? (
            <div
              className={`ads-page__container ${viewMode === "list" ? "is-list" : "is-grid"}`}
            >
              {ads.map((ad) => (
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
