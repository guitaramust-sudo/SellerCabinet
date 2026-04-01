// src/utils/paramsMapper.ts

// Словарь для перевода ТЕХНИЧЕСКИХ ключей в ЧЕЛОВЕЧЕСКИЕ
const PARAM_LABELS: Record<string, string> = {
  // Общие
  brand: "Бренд",
  model: "Модель",
  condition: "Состояние",
  color: "Цвет",

  // Авто
  yearOfManufacture: "Год выпуска",
  transmission: "Коробка передач",
  mileage: "Пробег (км)",
  enginePower: "Мощность двигателя (л.с.)",

  // Электроника
  type: "Тип устройства",
  processor: "Процессор",
  ram: "Оперативная память (ГБ)",

  // Недвижимость
  address: "Адрес",
  area: "Площадь (м²)",
  floor: "Этаж",
};

// Функция для получения красивого лейбла
export const getParamLabel = (key: string): string => {
  // Тут даже .toLowerCase() не нужен, так как ключи camelCase,
  // но лучше проверить на всякий случай
  const normalizedKey = key.trim();

  return PARAM_LABELS[normalizedKey] || key;
  // Если ключа нет в словаре, выведем его как есть, чтобы поле не пропало
};
