import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd"; // Добавили AntD тему
import { useGetAdByIdQuery } from "../../store/adsApi";
import { getDisplayCategory } from "../../utils/categoryHelper";
import { getParamLabel } from "../../utils/paramsMapper";
import placeholderIcon from "../../assets/icons/placeholder.svg";
import { Loader } from "../Loader/Loader";
import { ErrorState } from "../ErrorState/ErrorState";
import { useTheme } from "../../hooks/useTheme"; // Хук темы
import "./ProductViewPage.scss";

export const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { data: ad, isLoading, isError } = useGetAdByIdQuery(id || "");

  if (isLoading) return <Loader />;
  if (isError || !ad) return <ErrorState />;

  const isDescriptionShort =
    !ad.description || ad.description.trim().length < 5;
  const paramsEntries = Object.entries(ad.params || {});

  const emptyParamKeys = paramsEntries
    .filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, value]) => value === "" || value === null || value === undefined,
    )
    .map(([key]) => key);

  const hasNoParams = paramsEntries.length === 0;
  const hasErrors =
    isDescriptionShort || hasNoParams || emptyParamKeys.length > 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ru-RU").format(price);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="product-view">
        <button className="product-view__btn-back" onClick={() => navigate(-1)}>
          ← Назад
        </button>

        <header className="product-view__header">
          <div className="product-view__title-row">
            <h1>{ad.title}</h1>
            <span className="product-view__price">
              {formatPrice(ad.price)} ₽
            </span>
          </div>

          <div className="product-view__actions">
            <Link to="edit" className="product-view__btn-edit">
              Редактировать ✎
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
                    {emptyParamKeys.map((key) => (
                      <li key={key}>
                        Поле «{getParamLabel(key)}» не заполнено
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
                {paramsEntries.map(
                  ([key, value]) =>
                    value && (
                      <div className="product-view__char-item" key={key}>
                        <span className="char-key">{getParamLabel(key)}</span>
                        <span className="char-value">
                          {key === "enginePower"
                            ? `${value} л.с.`
                            : String(value)}
                        </span>
                      </div>
                    ),
                )}
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
