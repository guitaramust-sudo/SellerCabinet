import React from "react";
import { getServiceCategory } from "../../utils/categoryHelper"; // Твоя утилита
import type { FiltersState } from "../../types/types";
import "./Sidebar.scss";

interface SidebarProps {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
}

// Отображаемые названия.
// Важно: "Транспорт", так как в маппере у тебя 'auto' сопоставлен с 'Транспорт'
const DISPLAY_CATEGORIES = ["Транспорт", "Электроника", "Недвижимость"];

export const Sidebar: React.FC<SidebarProps> = ({ filters, onChange }) => {
  const toggleCategory = (label: string) => {
    // Превращаем "Транспорт" -> "auto"
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
      sortBy: "newest", // Добавляем, чтобы соответствовать типу FiltersState
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
          {DISPLAY_CATEGORIES.map((label) => {
            const catKey = getServiceCategory(label); // Получаем технический ключ
            return (
              <label key={catKey} className="sidebar__checkbox-label">
                <input
                  type="checkbox"
                  // Проверяем наличие технического ключа в стейте
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
          type="button" // Добавляем тип, чтобы случайно не засабмитить форму
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
