import Fastify from "fastify";
import cors from "@fastify/cors";
import middie from "@fastify/middie";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Импорт типов и схем из твоего проекта
import { Item } from "./src/types";
import { ItemsGetInQuerySchema, ItemUpdateInSchema } from "./src/validation";
import { treeifyError, ZodError } from "zod";
import { doesItemNeedRevision } from "./src/utils";

// Настройка путей (чтобы сервер всегда находил JSON)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "data", "items.json");

// Переменная для хранения данных в памяти
let ITEMS: Item[] = [];

const fastify = Fastify({
  logger: true,
});

/**
 * 1. Инициализация данных при старте
 */
const loadDatabase = async () => {
  try {
    const rawData = await fs.readFile(DB_PATH, "utf-8");
    ITEMS = JSON.parse(rawData);
    console.log("✅ База данных загружена");
  } catch (err) {
    console.error("❌ Ошибка чтения items.json. Проверь путь:", DB_PATH);
    process.exit(1); // Останавливаем, если данных нет
  }
};

/**
 * 2. Регистрация плагинов
 */
await fastify.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

await fastify.register(middie);

// Искусственная задержка для проверки лоадеров
fastify.use((_req, _res, next) => {
  const delay = 300 + Math.random() * 500;
  setTimeout(next, delay);
});

/**
 * 3. Роуты
 */

// GET: Список объявлений
fastify.get("/items", async (request, reply) => {
  try {
    const {
      q,
      limit,
      skip,
      needsRevision,
      categories,
      sortColumn,
      sortDirection,
    } = ItemsGetInQuerySchema.parse(request.query);

    const filtered = ITEMS.filter((item) => {
      const matchesSearch =
        !q || item.title.toLowerCase().includes(q.toLowerCase());
      const matchesRevision = !needsRevision || doesItemNeedRevision(item);
      const matchesCategory =
        !categories?.length || categories.includes(item.category);
      return matchesSearch && matchesRevision && matchesCategory;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (!sortColumn || !sortDirection) return 0;
      let result = 0;
      if (sortColumn === "price") result = (a.price ?? 0) - (b.price ?? 0);
      else if (sortColumn === "title") result = a.title.localeCompare(b.title);
      else if (sortColumn === "createdAt") {
        result =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDirection === "desc" ? -result : result;
    });

    return {
      items: sorted.slice(skip, skip + limit).map((item) => ({
        id: item.id,
        category: item.category,
        title: item.title,
        price: item.price,
        params: item.params, // ОБЯЗАТЕЛЬНО ДОБАВЬ ЭТУ СТРОЧКУ
        description: item.description,
        needsRevision: doesItemNeedRevision(item),
      })),
      total: filtered.length,
    };
  } catch (error) {
    if (error instanceof ZodError)
      return reply.status(400).send({ error: treeifyError(error) });
    return reply.status(500).send({ error: "Internal Server Error" });
  }
});

// GET: Одно объявление
fastify.get<{ Params: { id: string } }>(
  "/items/:id",
  async (request, reply) => {
    const itemId = Number(request.params.id);
    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) return reply.status(404).send({ error: "Item not found" });

    return { ...item, needsRevision: doesItemNeedRevision(item) };
  },
);

// PATCH: Обновление (с записью в файл)
fastify.patch<{ Params: { id: string } }>(
  "/items/:id",
  async (request, reply) => {
    const itemId = Number(request.params.id);
    const itemIndex = ITEMS.findIndex((i) => i.id === itemId);

    if (itemIndex === -1) return reply.status(404).send({ error: "Not found" });

    try {
      const parsedData = ItemUpdateInSchema.parse({
        ...ITEMS[itemIndex],
        ...(request.body as object),
      });

      // Обновляем в памяти
      ITEMS[itemIndex] = {
        ...ITEMS[itemIndex],
        ...parsedData,
        updatedAt: new Date().toISOString(),
      };

      // Сохраняем на диск
      await fs.writeFile(DB_PATH, JSON.stringify(ITEMS, null, 2), "utf-8");

      return { success: true };
    } catch (error) {
      console.error("Save error:", error);
      return reply.status(500).send({ error: "Failed to save data" });
    }
  },
);

/**
 * 4. Запуск
 */
const start = async () => {
  await loadDatabase();
  try {
    const PORT = 8080;
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
