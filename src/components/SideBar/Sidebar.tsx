import React from "react";
import type { FiltersState } from "../../types/types";
import "./Sidebar.scss";

interface SidebarProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
}

const CATEGORIES = ["Авто", "Электроника", "Недвижимость"];

export const Sidebar: React.FC<SidebarProps> = ({ filters, onChange }) => {
  const toggleCategory = (cat: string) => {
    const newCats = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: newCats });
  };

  const handleReset = () => {
    onChange({
      categories: [],
      onlyRequiresRevision: false,
      searchQuery: "",
    });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__group">
        <div className="sidebar__header">
          <span>Категория</span>
          <span className="sidebar__arrow">⌄</span>
        </div>
        <div className="sidebar__options">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="sidebar__checkbox-label">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>
          ))}
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
  );
};
