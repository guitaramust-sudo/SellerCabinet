// 1. Добавляем явную типизацию для словаря
const PARAM_LABELS: Record<string, string | Record<string, string>> = {
  brand: "Бренд",
  model: "Модель",
  condition: "Состояние",
  color: "Цвет",
  yearOfManufacture: "Год выпуска",
  transmission: "Коробка передач",
  enginePower: "Мощность двигателя (л.с.)",
  mileage: "Пробег (км)",
  address: "Адрес",
  area: "Площадь (м²)",
  floor: "Этаж",

  type: {
    electronics: "Тип устройства",
    real_estate: "Тип жилья",
    auto: "Тип кузова",
  },
};

export const getParamLabel = (key: string, category?: string): string => {
  const label = PARAM_LABELS[key];

  if (!label) return key;

  // Если нашли объект (сложный лейбл)
  if (typeof label === "object") {
    // 1. Пытаемся взять по категории
    // 2. Если категории нет или в объекте нет такого ключа — берем 'electronics' как дефолт
    // 3. Если и там пусто — возвращаем сам ключ 'type'
    const contextLabel = category ? label[category] : label["electronics"];
    return contextLabel || key;
  }

  // Если это обычная строка
  return label;
};

// Словарь для ПЕРЕВОДА ЗНАЧЕНИЙ
const VALUE_LABELS: Record<string, string> = {
  // Типы недвижимости
  flat: "Квартира",
  house: "Дом",
  cottage: "Коттедж",

  // Состояние
  new: "Новое",
  used: "Б/У",

  // Коробка передач
  manual: "Механика",
  automatic: "Автомат",

  // Типы кузова (если нужно)
  sedan: "Седан",
  hatchback: "Хэтчбек",
};

export const getValueLabel = (
  value: string | number | undefined | null,
): string => {
  if (value === undefined || value === null) return "—";
  const strValue = String(value);
  return VALUE_LABELS[strValue] || strValue;
};
