import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetAdByIdQuery } from "../../store/adsApi";
import { getDisplayCategory } from "../../utils/categoryHelper";
import { getParamLabel } from "../../utils/paramsMapper";
import placeholderIcon from "../../assets/icons/placeholder.svg";
import "./ProductViewPage.scss";

interface RouteParams extends Record<string, string | undefined> {
  id: string;
}

export const ProductViewPage: React.FC = () => {
  const { id } = useParams<RouteParams>();

  // Фикс типизации: приводим к string, чтобы TS не ругался
  const { data: ad, isLoading, isError } = useGetAdByIdQuery(String(id || ""));

  if (isLoading) return <div className="product-view__loader">Загрузка...</div>;
  if (isError || !ad)
    return <div className="product-view__error">Не найдено</div>;

  // --- ЛОГИКА ИСПРАВЛЕНИЯ ПЛАШКИ ---

  // 1. Находим реальные пустые поля в параметрах
  const missingParamKeys = ad.params
    ? Object.entries(ad.params)
        .filter(
          ([_, value]) => value === "" || value === null || value === undefined,
        )
        .map(([key]) => key)
    : [];

  // 2. Проверяем длину описания
  const isDescriptionTooShort =
    !ad.description || ad.description.trim().length < 5;

  // 3. Итоговый флаг: плашка будет только если реально чего-то не хватает
  const hasActualErrors = missingParamKeys.length > 0 || isDescriptionTooShort;

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
        <div className="product-view__gallery">
          <div className="product-view__placeholder">
            <img
              src={placeholderIcon}
              alt="Product"
              className="product-view__icon"
            />
          </div>
        </div>

        <div className="product-view__info">
          {/* ТЕПЕРЬ ПЛАШКА ВЫВОДИТСЯ ТОЛЬКО ПО ФАКТУ ОШИБОК */}
          {hasActualErrors && (
            <div className="product-view__alert">
              <div className="product-view__alert-icon">!</div>
              <div className="product-view__alert-content">
                <strong>Требуются доработки</strong>
                <p>Необходимо заполнить:</p>
                <ul>
                  {isDescriptionTooShort && (
                    <li>Описание (минимум 5 символов)</li>
                  )}
                  {missingParamKeys.map((key) => (
                    <li key={key}>{getParamLabel(key)}</li>
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

              {ad.params &&
                Object.entries(ad.params).map(([key, value]) => {
                  // Если поле пустое, в списке характеристик его не показываем
                  if (value === "" || value === null || value === undefined)
                    return null;
                  return (
                    <div className="product-view__char-item" key={key}>
                      <span className="char-key">{getParamLabel(key)}</span>
                      <span className="char-value">
                        {key === "enginePower"
                          ? `${value} л.с.`
                          : String(value)}
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
        <p className={!ad.description ? "is-empty" : ""}>
          {ad.description || "Описание отсутствует"}
        </p>
      </div>
    </div>
  );
};
