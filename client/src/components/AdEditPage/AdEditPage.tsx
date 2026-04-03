/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ConfigProvider, theme, Spin, Alert } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import {
  useGetAdByIdQuery,
  useUpdateAdMutation,
  useGenerateAIMutation,
} from "../../store/adsApi";
import { getParamLabel } from "../../utils/paramsMapper";
import { CATEGORY_FIELDS } from "../../utils/categoryFields";
import type { Category, AdItem } from "../../types/types";
import { Loader } from "../Loader/Loader";
import { ErrorState } from "../ErrorState/ErrorState";
import { useTheme } from "../../hooks/useTheme";
import "./AdEditPage.scss";

interface FormState {
  category: string;
  title: string;
  price: string;
  description: string;
  params: Record<string, string | number | undefined>;
}

export const AdEditPage = () => {
  const { isDarkMode } = useTheme();
  const MAX_PRICE = 100000000;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // API Hooks
  const { data, isLoading: isFetching, isError } = useGetAdByIdQuery(id || "");
  const [updateAd, { isLoading: isUpdating }] = useUpdateAdMutation();
  const [generateAI] = useGenerateAIMutation();

  // Local State
  const [priceError, setPriceError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null); // Для общих ошибок
  const [showAiPopup, setShowAiPopup] = useState(false);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [isDescLoading, setIsDescLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    category: "",
    title: "",
    price: "",
    description: "",
    params: {},
  });

  const currentFieldsConfig = CATEGORY_FIELDS[formData.category] || [];

  useEffect(() => {
    if (data) {
      setFormData({
        category: data.category || "",
        title: data.title || "",
        price: String(data.price || ""),
        description: data.description || "",
        params: (data.params as Record<string, any>) || {},
      });
    }
  }, [data]);

  const updateField = (
    field: keyof Omit<FormState, "params">,
    value: string,
  ) => {
    setFormError(null); // Сбрасываем ошибку при вводе
    if (field === "price") {
      setPriceError(null);
      if (value.includes("-"))
        setPriceError("Цена не может быть отрицательной");
      if (Number(value) > MAX_PRICE)
        setPriceError("Максимальная цена — 100 млн ₽");
    }

    if (field === "category") {
      setFormData((prev) => ({ ...prev, category: value, params: {} }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateParam = (key: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      params: { ...prev.params, [key]: value },
    }));
  };

  const handleGetPriceAI = async () => {
    try {
      setAiError(null);
      setAiResult(null);
      setShowAiPopup(true);
      setIsPriceLoading(true);
      const result = await generateAI({
        action: "price",
        title: formData.title,
      }).unwrap();
      setAiResult(result);
    } catch (err) {
      setAiError(
        "Ошибка: убедитесь, что Ollama запущена. Не удалось получить цену.",
      );
    } finally {
      setIsPriceLoading(false);
    }
  };

  const handleImproveDescription = async () => {
    try {
      setFormError(null);
      setIsDescLoading(true);
      const result = await generateAI({
        action: "improve",
        text: formData.description,
      }).unwrap();
      const descRegex = /(?:описание|текст):\s*([\s\S]+?)(?=\n\w+:|$)/i;
      const match = result.match(descRegex);
      const finalDesc = match ? match[1].trim() : result.trim();
      setFormData((prev) => ({ ...prev, description: finalDesc }));
    } catch (err) {
      setFormError("Не удалось улучшить описание через AI. Попробуйте позже.");
    } finally {
      setIsDescLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (priceError) return setFormError("Проверьте правильность цены");
    if (!formData.category) return setFormError("Необходимо выбрать категорию");

    const numericKeys = currentFieldsConfig
      .filter((f) => f.type === "number")
      .map((f) => f.key);

    const preparedParams = Object.entries(formData.params).reduce(
      (acc, [key, value]) => {
        if (value === "" || value === null || value === undefined) {
          acc[key] = "";
          return acc;
        }
        acc[key] = numericKeys.includes(key) ? Number(value) : value;
        return acc;
      },
      {} as Record<string, any>,
    );

    try {
      const body = {
        title: formData.title,
        description: formData.description,
        category: formData.category as Category,
        price: Number(formData.price),
        params: preparedParams,
      } as Partial<AdItem>;

      await updateAd({ id: id!, body }).unwrap();
      navigate(`/ads/${id}`);
    } catch (err: any) {
      setFormError(
        err.data?.error ||
          "Ошибка сохранения. Проверьте соединение с сервером.",
      );
    }
  };

  if (isFetching) return <Loader />;
  if (isError) return <ErrorState />;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className={`ad-edit ${isUpdating ? "ad-edit--updating" : ""}`}>
        <h1>Редактирование объявления</h1>

        {formError && (
          <div className="ad-edit__error-block">
            <Alert
              message={formError}
              type="error"
              showIcon
              closable
              onClose={() => setFormError(null)}
            />
          </div>
        )}

        <form className="ad-edit__form" onSubmit={handleSubmit}>
          <div className="ad-edit__section">
            <div className="input-group">
              <label>Категория</label>
              <select
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                <option value="">Выберите категорию</option>
                <option value="electronics">Электроника</option>
                <option value="auto">Авто</option>
                <option value="real_estate">Недвижимость</option>
              </select>
            </div>

            <div className="input-group">
              <label>
                <span className="required">*</span> Название
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>

            <div className="input-group price-group">
              <label>
                <span className="required">*</span> Цена (₽)
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  className={priceError ? "input-error" : ""}
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  required
                />
                {priceError && (
                  <span className="error-message">{priceError}</span>
                )}
              </div>
              <button
                type="button"
                className={`ai-btn ${isPriceLoading ? "ai-btn--loading" : ""}`}
                onClick={handleGetPriceAI}
                disabled={isPriceLoading || isDescLoading || !formData.title}
              >
                {isPriceLoading ? "Думаю..." : "Узнать рыночную цену"}
              </button>
            </div>
          </div>

          {currentFieldsConfig.length > 0 && (
            <div className="ad-edit__section">
              <h2>Характеристики</h2>
              {currentFieldsConfig.map((field) => (
                <div className="input-group" key={field.key}>
                  <label>{getParamLabel(field.key, formData.category)}</label>
                  <div className="input-wrapper">
                    {field.type === "select" ? (
                      <select
                        value={formData.params[field.key] ?? ""}
                        onChange={(e) => updateParam(field.key, e.target.value)}
                      >
                        <option value="">Не выбрано</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type === "number" ? "number" : "text"}
                        value={formData.params[field.key] ?? ""}
                        onChange={(e) => updateParam(field.key, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="ad-edit__section">
            <div className="section-header">
              <h2>Описание</h2>
              <button
                type="button"
                className="btn-magic"
                onClick={handleImproveDescription}
                disabled={isDescLoading || !formData.description}
              >
                {isDescLoading ? "Улучшаю..." : "Улучшить описание нейросетью"}
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

          <div className="ad-edit__footer">
            <button
              type="submit"
              className="btn-primary"
              disabled={isUpdating || !!priceError}
            >
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

        {showAiPopup && (
          <>
            <div
              className="ai-popup-overlay"
              onClick={() => !isPriceLoading && setShowAiPopup(false)}
            />
            <div className="ai-popup">
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowAiPopup(false)}
              >
                ×
              </button>
              <h3>Рекомендация AI</h3>

              {isPriceLoading && (
                <div className="ai-loader">
                  <Spin
                    indicator={
                      <LoadingOutlined style={{ fontSize: 32 }} spin />
                    }
                  />
                  <p style={{ marginTop: 16 }}>Анализирую рынок...</p>
                </div>
              )}

              {aiError && (
                <Alert
                  message={aiError}
                  type="error"
                  style={{ marginBottom: 16 }}
                />
              )}

              {aiResult && !isPriceLoading && (
                <>
                  <div className="ai-result-text">{aiResult}</div>
                  <div className="ai-popup-actions">
                    <button
                      type="button"
                      className="btn-apply"
                      onClick={() => {
                        const match = aiResult?.match(/(?:цена):\s*(\d+)/i);
                        if (match?.[1]) {
                          updateField("price", match[1]);
                          setShowAiPopup(false);
                        } else {
                          setAiError("Цена не найдена в ответе нейросети.");
                        }
                      }}
                    >
                      Применить цену
                    </button>
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => setShowAiPopup(false)}
                    >
                      Закрыть
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </ConfigProvider>
  );
};
