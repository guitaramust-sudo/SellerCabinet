import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetAdByIdQuery } from "../../store/adsApi";
import { getDisplayCategory } from "../../utils/categoryHelper";
import { getParamLabel, getValueLabel } from "../../utils/paramsMapper";
import "./ProductViewPage.scss";

export const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: ad, isLoading, isError } = useGetAdByIdQuery(id || "");

  if (isLoading) return <div className="product-view__loader">Загрузка...</div>;
  if (isError || !ad)
    return <div className="product-view__error">Не найдено</div>;

  // --- ЛОГИКА ОШИБОК ---
  const isDescriptionShort =
    !ad.description || ad.description.trim().length < 5;
  const paramsEntries = Object.entries(ad.params || {});

  // Список ключей параметров, которые пустые (null, "", undefined)
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
    <div className="product-view">
      <header className="product-view__header">
        <div className="product-view__title-row">
          <h1>{ad.title}</h1>
          <span className="product-view__price">{formatPrice(ad.price)} ₽</span>
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
        <div className="product-view__info">
          {/* БЛОК ОШИБОК */}
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
                      Поле «{getParamLabel(key, ad.category)}» не заполнено
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

              {/* Рендерим только заполненные параметры */}
              {paramsEntries.map(
                ([key, value]) =>
                  value && (
                    <div className="product-view__char-item" key={key}>
                      <span className="char-key">
                        {getParamLabel(key, ad.category)}
                      </span>
                      <span className="char-value">
                        {key === "enginePower" || key === "engunepower"
                          ? `${value} л.с.`
                          : getValueLabel(value)}
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
  );
};
