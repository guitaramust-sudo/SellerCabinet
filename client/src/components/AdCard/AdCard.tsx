import React from "react";
import { Link } from "react-router-dom";
import type { AdItem } from "../../types/types";
import { getDisplayCategory } from "../../utils/categoryHelper";
import "./AdCard.scss";

interface AdCardProps {
  ad: AdItem;
}

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  // --- УМНАЯ ПРОВЕРКА (АНАЛОГИЧНО PRODUCTVIEWPAGE) ---

  // 1. Проверка параметров на пустоту
  const hasEmptyParams = ad.params
    ? Object.values(ad.params).some(
        (value) => value === "" || value === null || value === undefined,
      )
    : false;

  // 2. Проверка описания (минимум 5 символов)
  const isDescriptionMissing =
    !ad.description || ad.description.trim().length < 5;

  // Итоговый флаг: игнорируем ad.needsRevision, если по факту данные заполнены
  const hasActualIssues = hasEmptyParams || isDescriptionMissing;

  // Форматирование цены
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <Link to={`/ads/${ad.id}`} className="ad-card-link">
      <div className={`ad-card ${hasActualIssues ? "ad-card--warning" : ""}`}>
        <div className="ad-card__image-container">
          <div className="ad-card__placeholder">🖼️</div>
        </div>

        <div className="ad-card__info">
          <span className="ad-card__category-tag">
            {getDisplayCategory(ad.category)}
          </span>

          <h3 className="ad-card__title">{ad.title}</h3>

          <p className="ad-card__price">{formatPrice(ad.price)} ₽</p>

          {hasActualIssues && (
            <div className="ad-card__badge">
              <span className="ad-card__badge-dot" />
              Нужно доработать
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
