import React, { useState } from "react";
import "./AdEditPage.scss";

export const AdEditPage: React.FC = () => {
  const [formData, setFormData] = useState({
    category: "Электроника",
    title: 'MacBook Pro 16"',
    price: "120000",
    type: "Ноутбук",
    brand: "Apple",
    model: "M1 Pro",
    color: "Серый",
    condition: "Б/У",
    description: "",
  });

  const [showAiPopup, setShowAiPopup] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const applyAiPrice = () => {
    updateField("price", "125000"); // Пример применения цены
    setShowAiPopup(false);
  };

  return (
    <div className="ad-edit">
      <h1>Редактирование объявления</h1>

      <form className="ad-edit__form" onSubmit={(e) => e.preventDefault()}>
        <div className="ad-edit__section">
          <div className="input-group">
            <label>Категория</label>
            <select
              value={formData.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              <option>Электроника</option>
              <option>Авто</option>
            </select>
          </div>

          <div className="input-group">
            <label>
              <span className="required">*</span> Название
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
              <button
                type="button"
                className="clear-btn"
                onClick={() => updateField("title", "")}
              >
                ⊗
              </button>
            </div>
          </div>

          <div className="input-group price-group">
            <label>
              <span className="required">*</span> Цена
            </label>
            <div className="input-wrapper">
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
              />
              <button
                type="button"
                className="clear-btn"
                onClick={() => updateField("price", "")}
              >
                ⊗
              </button>
            </div>

            <button
              type="button"
              className="ai-btn"
              onClick={() => setShowAiPopup(!showAiPopup)}
            >
              <span className="ai-icon">⟳</span> Повторить запрос
            </button>

            {showAiPopup && (
              <div className="ai-popup">
                <div className="ai-popup__header">Ответ AI:</div>
                <div className="ai-popup__body">
                  Средняя цена на MacBook Pro 16" M1 Pro (16/512GB):
                  <ul>
                    <li>115 000 — 135 000 ₽ — отличное состояние.</li>
                    <li>От 140 000 ₽ — идеал, малый износ АКБ.</li>
                    <li>90 000 — 110 000 ₽ — срочно или с дефектами.</li>
                  </ul>
                </div>
                <div className="ai-popup__actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={applyAiPrice}
                  >
                    Применить
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowAiPopup(false)}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="ad-edit__section">
          <h2>Характеристики</h2>

          <div className="input-group">
            <label>
              <span className="required">*</span> Тип
            </label>
            <select
              value={formData.type}
              onChange={(e) => updateField("type", e.target.value)}
            >
              <option>Ноутбук</option>
              <option>Планшет</option>
            </select>
          </div>

          {["brand", "model", "color", "condition"].map((field) => (
            <div className="input-group" key={field}>
              <label>
                {field === "brand"
                  ? "Бренд"
                  : field === "model"
                    ? "Модель"
                    : field === "color"
                      ? "Цвет"
                      : "Состояние"}
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={formData[field as keyof typeof formData]}
                  onChange={(e) => updateField(field, e.target.value)}
                />
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => updateField(field, "")}
                >
                  ⊗
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="ad-edit__section">
          <h2>Описание</h2>
          <div className="textarea-wrapper">
            <textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              maxLength={1000}
            />
            <span className="char-count">
              {formData.description.length} / 1000
            </span>
          </div>
          <button type="button" className="ai-btn mt-2">
            <span className="ai-icon">💡</span> Придумать описание
          </button>
        </div>

        <div className="ad-edit__footer">
          <button type="submit" className="btn-primary">
            Сохранить
          </button>
          <button type="button" className="btn-secondary">
            Отменить
          </button>
        </div>
      </form>
    </div>
  );
};
