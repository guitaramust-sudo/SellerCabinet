import React from "react";
import { ConfigProvider, theme } from "antd";
import { getServiceCategory } from "../../utils/categoryHelper";
import type { FiltersState } from "../../types/types";
import { useTheme } from "../../hooks/useTheme";
import "./Sidebar.scss";

interface SidebarProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
}

const DISPLAY_CATEGORIES = ["Транспорт", "Электроника", "Недвижимость"];

export const Sidebar: React.FC<SidebarProps> = ({ filters, onChange }) => {
  const { isDarkMode } = useTheme();

  const toggleCategory = (label: string) => {
    const catKey = getServiceCategory(label);
    const newCats = filters.categories.includes(catKey)
      ? filters.categories.filter((c) => c !== catKey)
      : [...filters.categories, catKey];

    onChange({ ...filters, categories: newCats });
  };

  const handleReset = () => {
    onChange({
      categories: [],
      onlyRequiresRevision: false,
      searchQuery: "",
      sortBy: "newest",
    });
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <aside className="sidebar">
        <div className="sidebar__group">
          <div className="sidebar__header">
            <span>Категория</span>
          </div>
          <div className="sidebar__options">
            {DISPLAY_CATEGORIES.map((label) => {
              const catKey = getServiceCategory(label);
              return (
                <label key={catKey} className="sidebar__checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(catKey)}
                    onChange={() => toggleCategory(label)}
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </div>

        <div className="sidebar__divider" />

        <div className="sidebar__toggle-row">
          <span className="sidebar__toggle-text">
            Только требующие
            <br />
            доработок
          </span>
          <button
            type="button"
            className={`sidebar__switch ${filters.onlyRequiresRevision ? "is-active" : ""}`}
            onClick={() =>
              onChange({
                ...filters,
                onlyRequiresRevision: !filters.onlyRequiresRevision,
              })
            }
          >
            <div className="sidebar__switch-handle" />
          </button>
        </div>

        <button className="sidebar__reset" onClick={handleReset}>
          Сбросить фильтры
        </button>
      </aside>
    </ConfigProvider>
  );
};
