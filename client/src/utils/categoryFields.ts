export interface FieldConfig {
  key: string;
  type: "text" | "number" | "select";
  options?: { label: string; value: string }[];
}

export const CATEGORY_FIELDS: Record<string, FieldConfig[]> = {
  auto: [
    { key: "brand", type: "text" },
    { key: "model", type: "text" },
    { key: "yearOfManufacture", type: "number" },
    {
      key: "transmission",
      type: "select",
      options: [
        { label: "Автомат", value: "automatic" },
        { label: "Механика", value: "manual" },
      ],
    },
    { key: "mileage", type: "number" },
    { key: "enginePower", type: "number" },
  ],
  real_estate: [
    {
      key: "type",
      type: "select",
      options: [
        { label: "Квартира", value: "flat" },
        { label: "Дом", value: "house" },
        { label: "Комната", value: "room" },
      ],
    },
    { key: "address", type: "text" },
    { key: "area", type: "number" },
    { key: "floor", type: "number" },
  ],
  electronics: [
    {
      key: "type",
      type: "select",
      options: [
        { label: "Телефон", value: "phone" },
        { label: "Ноутбук", value: "laptop" },
        { label: "Другое", value: "misc" },
      ],
    },
    { key: "brand", type: "text" },
    { key: "model", type: "text" },
    {
      key: "condition",
      type: "select",
      options: [
        { label: "Новый", value: "new" },
        { label: "Б/у", value: "used" },
      ],
    },
    { key: "color", type: "text" },
  ],
};
