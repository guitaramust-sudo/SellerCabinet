import React from "react";
import { useParams, Link } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { useGetAdByIdQuery } from "../../store/adsApi";
import { getDisplayCategory } from "../../utils/categoryHelper";
import { getParamLabel, getValueLabel } from "../../utils/paramsMapper";
import placeholderIcon from "../../assets/icons/placeholder.svg";
import { Loader } from "../Loader/Loader";
import { ErrorState } from "../ErrorState/ErrorState";
import { useTheme } from "../../hooks/useTheme";
import type { Category } from "../../types/types";
import "./ProductViewPage.scss";

export const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isDarkMode } = useTheme();
  const { data: ad, isLoading, isError } = useGetAdByIdQuery(id || "");

  if (isLoading) return <Loader />;
  if (isError || !ad) return <ErrorState />;

  const isDescriptionShort =
    !ad.description || ad.description.trim().length < 5;

  const getMissingFields = () => {
    const params = (ad.params || {}) as Record<string, never>;
    const missing: string[] = [];

    const checks: Record<Category, string[]> = {
      auto: [
        "brand",
        "model",
        "yearOfManufacture",
        "transmission",
        "mileage",
        "enginePower",
      ],
      real_estate: ["type", "address", "area", "floor"],
      electronics: ["type", "condition", "model", "brand", "color"],
    };

    const fieldsToHistory = checks[ad.category as Category] || [];

    fieldsToHistory.forEach((key) => {
      const value = params[key];
      if (value === undefined || value === "" || value === null) {
        missing.push(key);
      }
    });

    return missing;
  };

  const missingFields = getMissingFields();
  const hasNoParams = !ad.params || Object.keys(ad.params).length === 0;
  const hasErrors =
    isDescriptionShort || hasNoParams || missingFields.length > 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ru-RU").format(price);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="product-view">
        <Link to="/ads" className="product-view__btn-back">
          ← К списку объявлений
        </Link>

        <header className="product-view__header">
          <div className="product-view__title-row">
            <h1>{ad.title}</h1>
            <span className="product-view__price">
              {formatPrice(ad.price)} ₽
            </span>
          </div>

          <div className="product-view__actions">
            <Link to="edit" className="product-view__btn-edit">
              Редактировать
            </Link>
            <div className="product-view__dates">
              <span>
                Опубликовано: {new Date(ad.createdAt).toLocaleString("ru-RU")}
              </span>
            </div>
          </div>
        </header>

        <div className="product-view__main">
          <div className="product-view__gallery">
            <div className="product-view__placeholder">
              <img
                src={placeholderIcon}
                alt="No photo"
                className="placeholder-icon"
              />
            </div>
          </div>

          <div className="product-view__info">
            {hasErrors && (
              <div className="product-view__alert">
                <div className="product-view__alert-icon">!</div>
                <div className="product-view__alert-content">
                  <strong>Требуются доработки</strong>
                  <ul>
                    {isDescriptionShort && (
                      <li>Добавьте описание (минимум 5 символов)</li>
                    )}
                    {hasNoParams && <li>Заполните характеристики товара</li>}
                    {missingFields.map((field) => (
                      <li key={field}>
                        Поле «{getParamLabel(field, ad.category)}» не заполнено
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="product-view__characteristics">
              <h2>Характеристики</h2>
              <div className="product-view__char-list">
                <div className="product-view__char-item">
                  <span className="char-key">Категория</span>
                  <span className="char-value">
                    {getDisplayCategory(ad.category)}
                  </span>
                </div>
                {Object.entries(ad.params || {}).map(([key, value]) => {
                  if (value === "" || value === null || value === undefined)
                    return null;

                  return (
                    <div className="product-view__char-item" key={key}>
                      <span className="char-key">
                        {getParamLabel(key, ad.category)}
                      </span>
                      <span className="char-value">
                        {key === "enginePower"
                          ? `${value} л.с.`
                          : key === "area"
                            ? `${value} м²`
                            : key === "mileage"
                              ? `${formatPrice(Number(value))} км`
                              : key === "yearOfManufacture"
                                ? `${value} г.`
                                : getValueLabel(value)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="product-view__description">
          <h2>Описание</h2>
          <p className={isDescriptionShort ? "is-empty" : ""}>
            {ad.description || "Описание отсутствует"}
          </p>
        </div>
      </div>
    </ConfigProvider>
  );
};
