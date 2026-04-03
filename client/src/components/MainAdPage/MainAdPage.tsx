import { useState } from "react";
import { Pagination } from "antd"; // 1. Импортируем пагинацию
import { Sidebar } from "../SideBar/Sidebar";
import { AdCard } from "../AdCard/AdCard";
import { useGetAdsQuery } from "../../store/adsApi";
import type { FiltersState, SortOption, ViewMode } from "../../types/types";
import "./MainAdPage.scss";

export const MainAdPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // 2. Добавляем стейт для текущей страницы
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [filters, setFilters] = useState<FiltersState>({
    categories: [],
    onlyRequiresRevision: false,
    searchQuery: "",
    sortBy: "newest",
  });

  // 3. Хендлер для сброса страницы при изменении фильтров
  const handleFilterChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Сбрасываем на 1, если юзер что-то отфильтровал
  };

  // 4. Передаем и фильтры, и текущую страницу в запрос
  const { data, isLoading, isFetching, isError } = useGetAdsQuery({
    ...filters,
    page: currentPage,
  });

  if (isError)
    return <div className="ads-page__error">Ошибка при загрузке...</div>;

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
              handleFilterChange({ ...filters, searchQuery: e.target.value })
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
              handleFilterChange({
                ...filters,
                sortBy: e.target.value as SortOption,
              })
            }
          >
            <option value="newest">Сначала новые</option>
            <option value="price-asc">Дешевле</option>
            <option value="price-desc">Дороже</option>
            <option value="title-asc">А — Я (название)</option>
            <option value="title-desc">Я — А (название)</option>
          </select>
        </div>
      </div>

      <div className="ads-page__layout">
        <Sidebar filters={filters} onChange={handleFilterChange} />

        <main className="ads-page__content">
          {isLoading ? (
            <div className="ads-page__loader">Грузим данные...</div>
          ) : ads.length > 0 ? (
            <>
              <div
                className={`ads-page__container ${viewMode === "list" ? "is-list" : "is-grid"}`}
              >
                {ads.map((ad) => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>

              {/* 5. Сама пагинация под списком */}
              <div className="ads-page__pagination">
                <Pagination
                  current={currentPage}
                  total={totalCount}
                  pageSize={pageSize}
                  showSizeChanger={false} // Скрываем выбор кол-ва на странице для простоты
                  onChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" }); // Скроллим вверх при переключении
                  }}
                />
              </div>
            </>
          ) : (
            <div className="ads-page__empty">Ничего не найдено</div>
          )}
        </main>
      </div>
    </div>
  );
};
