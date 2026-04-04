import React from "react";
import { Link } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import type { AdItem } from "../../types/types";
import { getDisplayCategory } from "../../utils/categoryHelper";
import "./AdCard.scss";
import placeholderIcon from "../../assets/icons/placeholder.svg";
import { useTheme } from "../../hooks/useTheme";

interface AdCardProps {
  ad: AdItem;
}

export const AdCard: React.FC<AdCardProps> = ({ ad }) => {
  const { isDarkMode } = useTheme();

  const isDescriptionShort =
    !ad.description || ad.description.trim().length < 5;

  const checkIncompleteParams = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params = (ad.params || {}) as Record<string, any>;

    const requiredFields: Record<string, string[]> = {
      auto: ["brand", "model", "yearOfManufacture", "transmission", "mileage"],
      real_estate: ["type", "address", "area", "floor"],
      electronics: ["type", "condition"],
    };

    const fieldsToCheck = requiredFields[ad.category] || [];

    if (fieldsToCheck.length === 0) return false;

    // Если хоть одно обязательное поле пустое — возвращаем true (нужна доработка)
    return fieldsToCheck.some((key) => {
      const value = params[key];
      return value === undefined || value === "" || value === null;
    });
  };

  const hasIncompleteParams =
    !ad.params ||
    Object.keys(ad.params).length === 0 ||
    checkIncompleteParams();
  const hasErrors = isDescriptionShort || hasIncompleteParams;

  const formatPrice = (price: number | string) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? "0" : numPrice.toLocaleString("ru-RU");
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Link to={`/ads/${ad.id}`} className="ad-card-link">
        <div className={`ad-card ${hasErrors ? "ad-card--warning" : ""}`}>
          <div className="ad-card__image-container">
            <img
              className="ad-card__placeholder"
              src={placeholderIcon}
              alt="placeholder"
            />
          </div>

          <div className="ad-card__info">
            <div className="ad-card__category-row">
              <span className="ad-card__category-tag">
                {getDisplayCategory(ad.category)}
              </span>
            </div>

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
    </ConfigProvider>
  );
};
