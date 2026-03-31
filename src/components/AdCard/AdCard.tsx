import { Link } from "react-router-dom";
import type { AdItem } from "../../types/types";
import "./AdCard.scss";

interface AdCardProps {
  ad: AdItem;
}

// Убрали React.FC, используем деструктуризацию пропсов напрямую
export const AdCard = ({ ad }: AdCardProps) => {
  return (
    <Link to={`/ads/${ad.id}`} className="ad-card-link">
      <div className="ad-card">
        <div className="ad-card__image-container">
          <div className="ad-card__placeholder">🖼️</div>
          {/* Если потом появятся реальные картинки, вставишь сюда <img> */}
        </div>

        <div className="ad-card__info">
          <span className="ad-card__category-tag">{ad.category}</span>
          <h3 className="ad-card__title">{ad.title}</h3>
          <p className="ad-card__price">{ad.price.toLocaleString("ru-RU")} ₽</p>

          {ad.requiresRevision && (
            <div className="ad-card__badge">
              <span className="ad-card__badge-dot" />
              Требует доработок
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
