import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAdByIdQuery, useUpdateAdMutation } from "../../store/adsApi";
import "./AdEditPage.scss";
import { getParamLabel } from "../../utils/paramsMapper";

// Определяем структуру стейта формы для типизации
interface FormState {
  category: string;
  title: string;
  price: string;
  description: string;
  params: Record<string, string | number | undefined>;
}

export const AdEditPage = () => {
  const MAX_PRICE = 10_000_000_000; // 10 миллиардов

  const [priceError, setPriceError] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. Запросы к API
  const { data, isLoading: isFetching, isError } = useGetAdByIdQuery(id || "");
  const [updateAd, { isLoading: isUpdating }] = useUpdateAdMutation();

  const [formData, setFormData] = useState<FormState>({
    category: "",
    title: "",
    price: "",
    description: "",
    params: {},
  });

  const [showAiPopup, setShowAiPopup] = useState(false);

  // 2. Синхронизация данных с сервера в стейт формы
  useEffect(() => {
    const ad = data?.items?.[0];
    if (ad) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        category: ad.category || "",
        title: ad.title || "",
        price: String(ad.price || ""),
        description: ad.description || "",
        params: ad.params || {},
      });
    }
  }, [data]);

  // 3. Обработчики изменений
  const updateField = (
    field: keyof Omit<FormState, "params">,
    value: string,
  ) => {
    if (field === "price") {
      const numericValue = Number(value);

      // Сбрасываем ошибку при каждом вводе
      setPriceError(null);

      // Защита от отрицательных чисел
      if (value.includes("-")) {
        setPriceError("Цена не может быть отрицательной");
        return;
      }

      // Защита от лимита
      if (numericValue > MAX_PRICE) {
        setPriceError("Максимальная цена — 10 млрд ₽");
        // Опционально: можно принудительно ставить 10 млрд или оставлять старое
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const updateParam = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      params: { ...prev.params, [key]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await updateAd({
        id,
        body: {
          ...formData,
          price: Number(formData.price), // Конвертируем обратно в число для сервера
        },
      }).unwrap();
      navigate(`/ads/${id}`);
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
      alert("Не удалось сохранить изменения");
    }
  };

  if (isFetching)
    return <div className="ad-edit__loading">Загрузка данных...</div>;
  if (isError)
    return <div className="ad-edit__error">Ошибка загрузки объявления</div>;

  return (
    <div className={`ad-edit ${isUpdating ? "ad-edit--updating" : ""}`}>
      <h1>Редактирование объявления</h1>

      <form className="ad-edit__form" onSubmit={handleSubmit}>
        <div className="ad-edit__section">
          {/* Категория */}
          <div className="input-group">
            <label>Категория</label>
            <select
              value={formData.category}
              onChange={(e) => updateField("category", e.target.value)}
            >
              <option value="Электроника">Электроника</option>
              <option value="Авто">Авто</option>
              <option value="Недвижимость">Недвижимость</option>
            </select>
          </div>

          {/* Название */}
          <div className="input-group">
            <label>
              <span className="required">*</span> Название
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Цена */}
          <div className="input-group price-group">
            <label>
              <span className="required">*</span> Цена (₽)
            </label>
            <div className="input-wrapper">
              <input
                type="number"
                className={priceError ? "input-error" : ""} // Подсветим рамку красным
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                required
              />
            </div>

            {/* Та самая подпись для UX */}
            {priceError && <span className="error-message">{priceError}</span>}

            <button
              type="button"
              className="ai-btn"
              onClick={() => setShowAiPopup(!showAiPopup)}
            >
              <span className="ai-icon">⟳</span> Повторить запрос AI
            </button>
          </div>
        </div>

        {/* Динамические характеристики (Params) */}
        <div className="ad-edit__section">
          <h2>Характеристики</h2>
          {Object.entries(formData.params).map(([key, value]) => (
            <div className="input-group" key={key}>
              {/* ТЕПЕРЬ ТУТ БУДЕТ "Мощность двигателя", А НЕ enginePower */}
              <label>{getParamLabel(key)}</label>

              <div className="input-wrapper">
                <input
                  type="text"
                  value={value ?? ""}
                  onChange={(e) => updateParam(key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Описание */}
        <div className="ad-edit__section">
          <h2>Описание</h2>
          <div className="textarea-wrapper">
            <textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              maxLength={1000}
              placeholder="Введите описание товара..."
            />
            <span className="char-count">
              {formData.description.length} / 1000
            </span>
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="ad-edit__footer">
          <button type="submit" className="btn-primary" disabled={isUpdating}>
            {isUpdating ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Отменить
          </button>
        </div>
      </form>

      {/* Рендер попапа AI, если он нужен (логика внутри) */}
      {showAiPopup && (
        <div className="ai-popup-overlay" onClick={() => setShowAiPopup(false)}>
          <div className="ai-popup" onClick={(e) => e.stopPropagation()}>
            <h3>Рекомендация AI</h3>
            <p>Средняя цена для данной модели: 125 000 ₽</p>
            <button
              onClick={() => {
                updateField("price", "125000");
                setShowAiPopup(false);
              }}
            >
              Применить
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
