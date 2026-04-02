import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetAdByIdQuery,
  useUpdateAdMutation,
  useGenerateAIMutation,
} from "../../store/adsApi";
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
  const MAX_PRICE = 10_000_000_000;

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
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isDescLoading, setIsDescLoading] = useState(false);

  // 1. Инициализируем мутацию
  const [generateAI] = useGenerateAIMutation();

  // Состояние для хранения текста от нейронки в попапе
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Функция для запроса цены
  const handleGetPriceAI = async () => {
    try {
      setAiResult(null); // Сбрасываем старый результат
      setShowAiPopup(true); // Открываем попап (в нем будет лоадер)
      setIsPriceLoading(true);

      const result = await generateAI({
        action: "price",
        title: formData.title,
      }).unwrap();

      setAiResult(result);
    } catch (err) {
      console.error("AI Error:", err);
      setAiResult("Ошибка: убедитесь, что Ollama запущена");
    } finally {
      setIsPriceLoading(false); // Выключаем
    }
  };

  // Функция для улучшения описания
  const handleImproveDescription = async () => {
    try {
      setIsDescLoading(true);
      const result = await generateAI({
        action: "improve",
        text: formData.description,
      }).unwrap();

      // ПАРСЕР: Ищем блок "Описание:" или "Текст:"
      // Если нейронка прислала структуру, берем только середину
      const descRegex = /(?:описание|текст):\s*([\s\S]+?)(?=\n\w+:|$)/i;
      const match = result.match(descRegex);

      const finalDesc = match ? match[1].trim() : result.trim();

      setFormData((prev) => ({ ...prev, description: finalDesc }));
    } catch (err) {
      alert(`Не удалось улучшить описание: ${err}`);
    } finally {
      setIsDescLoading(false);
    }
  };

  // 2. Синхронизация данных с сервера в стейт формы
  useEffect(() => {
    const ad = data?.items?.[0];
    if (ad) {
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
              className={`ai-btn ${isPriceLoading ? "ai-btn--loading" : ""}`}
              onClick={handleGetPriceAI}
              disabled={isPriceLoading || isDescLoading}
            >
              <span className="ai-icon">✨</span>
              {isPriceLoading ? "Думаю..." : "Узнать рыночную цену"}
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
          <div className="section-header">
            <h2>Описание</h2>
            <button
              type="button"
              className="btn-magic"
              onClick={handleImproveDescription}
              disabled={
                isDescLoading || isPriceLoading || !formData.description
              }
            >
              {isDescLoading ? "Улучшаю..." : "Улучшить описание нейронкой"}
            </button>
          </div>
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
        <div
          className="ai-popup-overlay"
          onClick={() => {
            // Закрываем только если загрузка цены НЕ идет
            if (!isPriceLoading) setShowAiPopup(false);
          }}
        >
          <div className="ai-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowAiPopup(false)}>
              ×
            </button>
            <h3>Рекомендация AI</h3>

            {/* ИСПОЛЬЗУЕМ ТОЛЬКО isPriceLoading */}
            {isPriceLoading ? (
              <div className="ai-loader">
                <div className="spinner"></div>
                <p>Анализирую рынок через Ollama...</p>
              </div>
            ) : (
              <>
                <div
                  className="ai-result-text"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {aiResult}
                </div>
                <div className="ai-popup-actions">
                  <button
                    className="btn-apply"
                    onClick={() => {
                      if (!aiResult) return;

                      const match = aiResult.match(/(?:цена):\s*(\d+)/i);

                      if (match && match[1]) {
                        updateField("price", match[1]);
                        setShowAiPopup(false);
                      } else {
                        alert("Цена не найдена в ответе");
                      }
                    }}
                  >
                    Применить цену
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setShowAiPopup(false)}
                  >
                    Закрыть
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
