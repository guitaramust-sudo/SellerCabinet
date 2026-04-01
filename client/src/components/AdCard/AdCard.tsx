import { Link } from "react-router-dom";
import type { AdItem } from "../../types/types";
import { getDisplayCategory } from "../../utils/categoryHelper";
import "./AdCard.scss";

interface AdCardProps {
  ad: AdItem;
}

export const AdCard = ({ ad }: AdCardProps) => {
  const hasIssues = ad.needsRevision;

  // Форматирование цены вручную через регулярку (красивые пробелы)
  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <Link to={`/ads/${ad.id}`} className="ad-card-link">
      <div className={`ad-card ${hasIssues ? "ad-card--warning" : ""}`}>
        <div className="ad-card__image-container">
          <div className="ad-card__placeholder">🖼️</div>
        </div>

        <div className="ad-card__info">
          {/* ТЕПЕРЬ ПЕРЕВОДИТСЯ */}
          <span className="ad-card__category-tag">
            {getDisplayCategory(ad.category)}
          </span>

          <h3 className="ad-card__title">{ad.title}</h3>

          {/* ТЕПЕРЬ БЕЗ toLocaleString */}
          <p className="ad-card__price">{formatPrice(ad.price)} ₽</p>

          {hasIssues && (
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
