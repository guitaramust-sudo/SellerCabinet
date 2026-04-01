import { useParams, Link } from "react-router-dom";
import { useGetAdByIdQuery } from "../../store/adsApi";
import { getDisplayCategory } from "../../utils/categoryHelper";
import { getParamLabel } from "../../utils/paramsMapper";
import placeholderIcon from "../../assets/icons/placeholder.svg";
import "./ProductViewPage.scss";

export const ProductViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetAdByIdQuery(id || "");

  if (isLoading) return <div className="product-view__loader">Загрузка...</div>;
  if (isError || !data?.items?.[0])
    return <div className="product-view__error">Не найдено</div>;

  const ad = data.items[0];

  const formatPrice = (price: number) =>
    price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Не указана";
    return new Date(timestamp).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const characteristics = ad.params ? Object.entries(ad.params) : [];

  const missingFields = characteristics
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => !value)
    .map(([key]) => getParamLabel(key));

  return (
    <div className="product-view">
      <header className="product-view__header">
        <div className="product-view__title-row">
          <h1>{ad.title}</h1>
          <span className="product-view__price">{formatPrice(ad.price)} ₽</span>
        </div>

        {/* Возвращаем блок actions, чтобы кнопки и даты встали по местам */}
        <div className="product-view__actions">
          <Link to="edit" className="product-view__btn-edit">
            Редактировать ✎
          </Link>
          <div className="product-view__dates">
            <span>Опубликовано: {formatDate(ad.createdAt)}</span>
          </div>
        </div>
      </header>

      <div className="product-view__main">
        <div className="product-view__gallery">
          <div className="product-view__placeholder">
            <img
              src={placeholderIcon}
              alt="Placeholder"
              className="product-view__icon"
            />
          </div>
        </div>

        <div className="product-view__info">
          {/* Возвращаем правильную BEM-структуру для алерта */}
          {(ad.needsRevision || missingFields.length > 0) && (
            <div className="product-view__alert">
              <div className="product-view__alert-icon">!</div>
              <div className="product-view__alert-content">
                <strong>Требуются доработки</strong>
                <p>Проверьте следующие поля:</p>
                <ul>
                  {!ad.description && <li>Описание</li>}
                  {missingFields.map((label, i) => (
                    <li key={i}>{label}</li>
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

              {characteristics.map(
                ([key, value]) =>
                  value && (
                    <div className="product-view__char-item" key={key}>
                      <span className="char-key">{getParamLabel(key)}</span>
                      <span className="char-value">{String(value)}</span>
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="product-view__description">
        <h2>Описание</h2>
        <p>{ad.description || "Описание отсутствует"}</p>
      </div>
    </div>
  );
};
