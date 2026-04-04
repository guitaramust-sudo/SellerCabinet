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

  if (typeof label === "object") {
    const contextLabel = category ? label[category] : label["electronics"];
    return contextLabel || key;
  }

  return label;
};

const VALUE_LABELS: Record<string, string> = {
  phone: "Смартфон",
  laptop: "Ноутбук",
  tablet: "Планшет",
  camera: "Фотоаппарат",
  console: "Игровая приставка",

  flat: "Квартира",
  house: "Дом",
  cottage: "Коттедж",
  room: "Комната",

  new: "Новое",
  used: "Б/У",

  manual: "Механика",
  automatic: "Автомат",
  robot: "Робот",
  variator: "Вариатор",

  sedan: "Седан",
  hatchback: "Хэтчбек",
  suv: "Внедорожник",
  coupe: "Купе",
};

export const getValueLabel = (
  value: string | number | undefined | null,
): string => {
  if (value === undefined || value === null) return "—";
  const strValue = String(value);
  return VALUE_LABELS[strValue] || strValue;
};
