/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ConfigProvider,
  theme,
  Spin,
  Alert,
  notification,
  Drawer,
  Button,
  Space,
} from "antd";
import { LoadingOutlined, RobotOutlined } from "@ant-design/icons";
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
import { AIChat } from "../AiChat/AIChat";
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
  const [api, contextHolder] = notification.useNotification();
  const MAX_PRICE = 100000000;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading: isFetching, isError } = useGetAdByIdQuery(id || "");
  const [updateAd, { isLoading: isUpdating }] = useUpdateAdMutation();
  const [generateAI] = useGenerateAIMutation();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [priceError, setPriceError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
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
    const savedData = localStorage.getItem(`edit_ad_${id}`);
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error(e);
      }
    } else if (data) {
      setFormData({
        category: data.category || "",
        title: data.title || "",
        price: String(data.price || ""),
        description: data.description || "",
        params: (data.params as Record<string, any>) || {},
      });
    }
  }, [data, id]);

  useEffect(() => {
    if (formData.title || formData.price || formData.category) {
      localStorage.setItem(`edit_ad_${id}`, JSON.stringify(formData));
    }
  }, [formData, id]);

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const updateField = (
    field: keyof Omit<FormState, "params">,
    value: string,
  ) => {
    setFormError(null);

    if (field === "price") {
      setPriceError(null);
      const numValue = Number(value);

      if (value !== "" && numValue < 0) {
        setPriceError("Цена не может быть отрицательной");
        return;
      }

      if (numValue > MAX_PRICE) {
        setPriceError("Максимальная цена — 100 млн ₽");
      }
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
      setAiError("Ошибка: убедитесь, что Ollama запущена.");
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
      setFormError("Не удалось улучшить описание через AI.");
    } finally {
      setIsDescLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Валидация основных полей
    if (
      priceError ||
      !formData.title ||
      !formData.price ||
      Number(formData.price) < 0
    ) {
      setTouchedFields({ title: true, price: true });
      return;
    }

    const numericKeys = currentFieldsConfig
      .filter((f) => f.type === "number")
      .map((f) => f.key);

    // ФИКС: Очистка объекта от пустых значений
    const preparedParams = Object.entries(formData.params).reduce(
      (acc, [key, value]) => {
        // Если значение пустое, null или undefined — пропускаем итерацию (не добавляем в acc)
        if (value === "" || value === null || value === undefined) {
          return acc;
        }

        // Если значение есть, приводим к числу если нужно и сохраняем
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
        params: preparedParams, // Здесь теперь только заполненные ключи
      } as Partial<AdItem>;

      await updateAd({ id: id!, body }).unwrap();
      localStorage.removeItem(`edit_ad_${id}`);

      api.success({
        message: "Изменения сохранены",
        placement: "topRight",
        duration: 3,
      });

      setTimeout(() => navigate(`/ads/${id}`), 1000);
    } catch (err: any) {
      api.error({
        message: "Ошибка сохранения",
        description: "При попытке сохранить изменения произошла ошибка.",
        placement: "topRight",
      });
      setFormError(err.data?.error || "Ошибка сохранения");
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
      {contextHolder}
      <div className={`ad-edit ${isUpdating ? "ad-edit--updating" : ""}`}>
        <header
          className="ad-edit__header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h1 style={{ margin: 0 }}>Редактирование объявления</h1>
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={() => setIsChatOpen(true)}
            style={{ background: "#6e8efb", borderColor: "#6e8efb" }}
          >
            Помощник ИИ
          </Button>
        </header>

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
                className={
                  touchedFields.category && !formData.category
                    ? "input-error"
                    : ""
                }
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                onBlur={() => handleBlur("category")}
              >
                <option value="">Выберите категорию</option>
                <option value="electronics">Электроника</option>
                <option value="auto">Авто</option>
                <option value="real_estate">Недвижимость</option>
              </select>
              {touchedFields.category && !formData.category && (
                <span className="error-message">
                  Категория должна быть выбрана
                </span>
              )}
            </div>

            <div className="input-group">
              <label>
                <span className="required">*</span> Название
              </label>
              <input
                type="text"
                className={
                  touchedFields.title && !formData.title ? "input-error" : ""
                }
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                onBlur={() => handleBlur("title")}
                required
              />
              {touchedFields.title && !formData.title && (
                <span className="error-message">
                  Название должно быть заполнено
                </span>
              )}
            </div>

            <div className="input-group price-group">
              <label>
                <span className="required">*</span> Цена (₽)
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "+") {
                      e.preventDefault();
                    }
                  }}
                  className={
                    priceError || (touchedFields.price && !formData.price)
                      ? "input-error"
                      : ""
                  }
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  onBlur={() => handleBlur("price")}
                  required
                />
              </div>
              {(priceError || (touchedFields.price && !formData.price)) && (
                <span className="error-message">
                  {priceError || "Цена должна быть заполнена"}
                </span>
              )}
              <button
                type="button"
                className={`ai-btn ${isPriceLoading ? "ai-btn--loading" : ""}`}
                onClick={handleGetPriceAI}
                disabled={isPriceLoading || isDescLoading || !formData.title}
              >
                {isPriceLoading ? "Думаю..." : "Узнать рыночную цену"}
              </button>
            </div>
            {priceError && (
              <div
                style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "4px" }}
              >
                {priceError}
              </div>
            )}
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
                        onChange={(e) =>
                          updateParam(field.key, e.target.value ?? "")
                        }
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
                        min={field.type === "number" ? "0" : ""}
                        onKeyDown={
                          field.type === "number"
                            ? (e) => {
                                if (
                                  e.key === "-" ||
                                  e.key === "e" ||
                                  e.key === "+"
                                )
                                  e.preventDefault();
                              }
                            : undefined
                        }
                        value={formData.params[field.key] ?? ""}
                        onChange={(e) =>
                          updateParam(field.key, e.target.value ?? "")
                        }
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
                {isDescLoading ? "Улучшаю..." : "Улучшить описание"}
              </button>
            </div>
            <div className="textarea-wrapper">
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                maxLength={1000}
                placeholder="Введите описание товара чтобы ИИ могла помочь его улучшить..."
              />
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
              onClick={() => {
                localStorage.removeItem(`edit_ad_${id}`);
                navigate(-1);
              }}
            >
              Отменить
            </button>
          </div>
        </form>

        <Drawer
          title={
            <Space>
              <RobotOutlined style={{ color: "#6e8efb" }} />
              <span>Помощник по объявлению</span>
            </Space>
          }
          placement="right"
          onClose={() => setIsChatOpen(false)}
          open={isChatOpen}
          width={450}
          className="ai-chat-drawer"
          styles={{ body: { padding: 0, overflow: "hidden" } }}
        >
          <AIChat ad={{ ...formData, id }} />
        </Drawer>

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
                          setAiError("Цена не найдена в ответе.");
                        }
                      }}
                    >
                      Применить цену
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
