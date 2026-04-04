import { useState } from "react";
import { Pagination, ConfigProvider, theme, Button } from "antd";
import { Sidebar } from "../SideBar/Sidebar";
import { AdCard } from "../AdCard/AdCard";
import { useGetAdsQuery } from "../../store/adsApi";
import type { FiltersState, SortOption, ViewMode } from "../../types/types";
import "./MainAdPage.scss";
import { Loader } from "../Loader/Loader";
import { ErrorState } from "../ErrorState/ErrorState";
import { useTheme } from "../../hooks/useTheme";

export const MainAdPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [filters, setFilters] = useState<FiltersState>({
    categories: [],
    onlyRequiresRevision: false,
    searchQuery: "",
    sortBy: "newest",
  });

  const handleFilterChange = (newFilters: FiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const { data, isLoading, isFetching, isError } = useGetAdsQuery({
    ...filters,
    page: currentPage,
  });

  if (isLoading) return <Loader />;

  if (isError) return <ErrorState />;

  const ads = data?.items || [];
  const totalCount = data?.total || 0;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#6e8efb",
        },
      }}
    >
      <div
        className={`ads-page ${isDarkMode ? "dark-theme" : "light-theme"} ${isFetching ? "ads-page--loading" : ""}`}
      >
        <header className="ads-page__header">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1>Мои объявления</h1>
            <Button onClick={toggleTheme}>
              {isDarkMode ? "Светлая тема" : "Темная тема"}
            </Button>
          </div>
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
            {ads.length > 0 ? (
              <>
                <div
                  className={`ads-page__container ${viewMode === "list" ? "is-list" : "is-grid"}`}
                >
                  {ads.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>

                <div className="ads-page__pagination">
                  <Pagination
                    current={currentPage}
                    total={totalCount}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    onChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
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
    </ConfigProvider>
  );
};
