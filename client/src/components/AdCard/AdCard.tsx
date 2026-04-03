import React from "react";
import { Link } from "react-router-dom";
import type { AdItem } from "../../types/types";
import { getDisplayCategory } from "../../utils/categoryHelper";
import "./AdCard.scss";

interface AdCardProps {
  ad: AdItem;
}

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const isDescriptionShort =
    !ad.description || ad.description.trim().length < 5;

  const hasIncompleteParams =
    !ad.params ||
    Object.keys(ad.params).length === 0 ||
    Object.values(ad.params).some(
      (v) => v === "" || v === null || v === undefined,
    );

  const hasErrors = isDescriptionShort || hasIncompleteParams;

  const formatPrice = (price: number | string) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? "0" : numPrice.toLocaleString("ru-RU");
  };

  return (
    <Link to={`/ads/${ad.id}`} className="ad-card-link">
      <div className={`ad-card ${hasErrors ? "ad-card--warning" : ""}`}>
        <div className="ad-card__image-container">
          <div className="ad-card__placeholder">🖼️</div>
        </div>

        <div className="ad-card__info">
          <span className="ad-card__category-tag">
            {getDisplayCategory(ad.category)}
          </span>

          <h3 className="ad-card__title">{ad.title}</h3>

          <p className="ad-card__price">{formatPrice(ad.price)} ₽</p>

          {hasErrors && (
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
