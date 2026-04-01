const express = require("express");
const cors = require("cors");

const app = express();
// Настройки порта из переменных окружения или 8080 по умолчанию
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// --- Моковая "База данных" ---
let itemsDB = [
  {
    id: "1",
    category: "electronics",
    title: 'MacBook Pro 16"',
    description: "Отличный ноут, почти не греется.",
    price: 64000,
    createdAt: new Date("2023-10-01T10:00:00Z").getTime(),
    params: {
      type: "laptop",
      brand: "Apple",
      model: "M1 Pro",
      condition: "used",
      color: "Space Gray",
    },
  },
  {
    id: "2",
    category: "auto",
    title: "Volkswagen Polo",
    description: "", // Пустое описание -> needsRevision будет true
    price: 1100000,
    createdAt: new Date("2023-10-02T12:00:00Z").getTime(),
    params: {
      brand: "Volkswagen",
      model: "Polo",
      yearOfManufacture: 2018,
      transmission: "automatic",
      mileage: 60000,
      enginePower: 110,
    },
  },
  {
    id: "3",
    category: "real_estate",
    title: "Студия, 25м²",
    description: "Уютная студия в центре.",
    price: 15000000,
    createdAt: new Date("2023-10-03T15:30:00Z").getTime(),
    params: {
      type: "flat",
      address: "ул. Пушкина, д. Колотушкина",
      area: 25,
      floor: "",
    }, // Пустой этаж -> needsRevision будет true
  },
];

// --- Вспомогательная функция: проверка на доработки ---
// Объявление требует доработки, если нет description или любое из полей params пустое/отсутствует
const calculateNeedsRevision = (item) => {
  if (!item.description || item.description.trim() === "") {
    return true;
  }
  if (!item.params || Object.keys(item.params).length === 0) {
    return true;
  }

  for (const key in item.params) {
    const val = item.params[key];
    if (val === undefined || val === null || val === "") {
      return true;
    }
  }
  return false;
};

// --- КОНЕЧНЫЕ ТОЧКИ ---

// 1. GET /items - Получение всех объявлений с фильтрацией
app.get("/items", (req, res) => {
  const {
    q,
    limit,
    skip,
    needsRevision,
    categories,
    sortColumn,
    sortDirection,
  } = req.query;

  // Клонируем базу и сразу вычисляем needsRevision для каждого элемента
  let result = itemsDB.map((item) => ({
    ...item,
    needsRevision: calculateNeedsRevision(item),
  }));

  // Фильтрация по строке поиска (q)
  if (q) {
    const searchStr = q.toLowerCase();
    result = result.filter((item) =>
      item.title.toLowerCase().includes(searchStr),
    );
  }

  // Фильтрация по категориям (categories)
  if (categories) {
    const catsArray = categories.split(",").map((c) => c.trim());
    result = result.filter((item) => catsArray.includes(item.category));
  }

  // Фильтрация по needsRevision
  if (needsRevision === "true") {
    result = result.filter((item) => item.needsRevision === true);
  }

  // Сортировка (sortColumn, sortDirection)
  if (sortColumn) {
    const dir = sortDirection === "desc" ? -1 : 1;
    result.sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return -1 * dir;
      if (a[sortColumn] > b[sortColumn]) return 1 * dir;
      return 0;
    });
  }

  // Запоминаем общее количество подходящих записей ДО пагинации
  const total = result.length;

  // Пагинация (skip, limit)
  const skipCount = skip ? parseInt(skip, 10) : 0;
  if (skipCount > 0) {
    result = result.slice(skipCount);
  }

  const limitCount = limit ? parseInt(limit, 10) : result.length;
  if (limitCount > 0) {
    result = result.slice(0, limitCount);
  }

  // Возвращаем контракт
  res.json({
    items: result,
    total: total,
  });
});

// 2. GET /items/:id - Получение конкретного объявления
app.get("/items/:id", (req, res) => {
  const { id } = req.params;
  const item = itemsDB.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: "Объявление не найдено" });
  }

  // По контракту даже один элемент возвращается в массиве items
  const itemWithRevision = {
    ...item,
    needsRevision: calculateNeedsRevision(item),
  };

  res.json({
    items: [itemWithRevision],
    total: 1,
  });
});

// 3. PUT /items/:id - Полная замена объявления
app.put("/items/:id", (req, res) => {
  const { id } = req.params;
  const itemIndex = itemsDB.findIndex((i) => i.id === id);

  if (itemIndex === -1) {
    return res.status(404).json({ error: "Объявление не найдено" });
  }

  const { category, title, description, price, params } = req.body;

  // Создаем обновленный объект, сохраняя старый ID и createdAt
  const updatedItem = {
    id,
    createdAt: itemsDB[itemIndex].createdAt, // Дата создания не меняется
    category,
    title,
    description: description || "",
    price,
    params: params || {},
  };

  // Заменяем в "базе"
  itemsDB[itemIndex] = updatedItem;

  // Возвращаем обновленный элемент (с вычисленным needsRevision для удобства фронта)
  res.json({
    ...updatedItem,
    needsRevision: calculateNeedsRevision(updatedItem),
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
