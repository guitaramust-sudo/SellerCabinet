import "./ProductViewPage.scss";
import { Link } from "react-router-dom";

// Временно захардкодим данные, потом прокинешь через props или Redux/Zustand
const mockData = {
  title: 'MacBook Pro 16"',
  price: 64000,
  publishedAt: "10 марта 22:39",
  updatedAt: "10 марта 23:12",
  description:
    'Продаю свой MacBook Pro 16" (2021) на чипе M1 Pro. Состояние отличное, работал бережно. Мощности хватает на всё: от сложного монтажа до кода, при этом ноутбук почти не греется.',
  characteristics: {
    Тип: "Ноутбук",
    Бренд: "Apple",
    Модель: "M1 Pro",
  },
  requiresRevision: true,
  missingFields: ["Цвет", "Состояние"],
};

export const ProductViewPage = () => {
  return (
    <div className="product-view">
      <header className="product-view__header">
        <div className="product-view__title-row">
          <h1>{mockData.title}</h1>
          <span className="product-view__price">
            {mockData.price.toLocaleString("ru-RU")} ₽
          </span>
        </div>

        <div className="product-view__actions">
          <Link to="/edit" className="product-view__btn-edit">
            Редактировать <span className="icon-edit">✎</span>
          </Link>
          <div className="product-view__dates">
            <span>Опубликовано: {mockData.publishedAt}</span>
            <span>Отредактировано: {mockData.updatedAt}</span>
          </div>
        </div>
      </header>

      <div className="product-view__main">
        <div className="product-view__gallery">
          <div className="product-view__placeholder">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="#ccc"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" />
            </svg>
          </div>
        </div>

        <div className="product-view__info">
          {mockData.requiresRevision && (
            <div className="product-view__alert">
              <div className="product-view__alert-icon">!</div>
              <div className="product-view__alert-content">
                <strong>Требуются доработки</strong>
                <p>У объявления не заполнены поля:</p>
                <ul>
                  {mockData.missingFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="product-view__characteristics">
            <h2>Характеристики</h2>
            <div className="product-view__char-list">
              {Object.entries(mockData.characteristics).map(([key, value]) => (
                <div className="product-view__char-item" key={key}>
                  <span className="char-key">{key}</span>
                  <span className="char-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="product-view__description">
        <h2>Описание</h2>
        <p>{mockData.description}</p>
      </div>
    </div>
  );
};
