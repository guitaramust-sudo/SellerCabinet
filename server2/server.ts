import Fastify from "fastify";
import cors from "@fastify/cors";
import middie from "@fastify/middie";

import items from "./data/items.json" with { type: "json" };
import { Item } from "./src/types";
import { ItemsGetInQuerySchema, ItemUpdateInSchema } from "./src/validation";
import { treeifyError, ZodError } from "zod";
import { doesItemNeedRevision } from "./src/utils";

const ITEMS = items as Item[];

const fastify = Fastify({
  logger: true,
});

// Регистрация плагинов
await fastify.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

await fastify.register(middie);

// Искусственная задержка (Middleware)
fastify.use((_req, _res, next) => {
  const delay = 300 + Math.random() * 700;
  setTimeout(next, delay);
});

/**
 * 1. Получение конкретного объявления
 */
interface ItemGetRequest {
  Params: { id: string };
}

fastify.get<ItemGetRequest>("/items/:id", async (request, reply) => {
  const itemId = Number(request.params.id);

  if (!Number.isFinite(itemId)) {
    return reply.status(400).send({
      success: false,
      error: "Item ID must be a valid number",
    });
  }

  const item = ITEMS.find((i) => i.id === itemId);

  if (!item) {
    return reply.status(404).send({
      success: false,
      error: "Item not found",
    });
  }

  return {
    ...item,
    needsRevision: doesItemNeedRevision(item),
  };
});

/**
 * 2. Получение списка с фильтрацией и сортировкой
 */
fastify.get("/items", async (request, reply) => {
  try {
    // Валидация через Zod
    const {
      q,
      limit,
      skip,
      needsRevision,
      categories,
      sortColumn,
      sortDirection,
    } = ItemsGetInQuerySchema.parse(request.query);

    // Фильтрация
    const filtered = ITEMS.filter((item) => {
      const matchesSearch =
        !q || item.title.toLowerCase().includes(q.toLowerCase());
      const matchesRevision = !needsRevision || doesItemNeedRevision(item);
      const matchesCategory =
        !categories?.length || categories.includes(item.category);

      return matchesSearch && matchesRevision && matchesCategory;
    });

    // Сортировка (создаем копию через [...filtered], чтобы не мутировать исходный массив)
    const sorted = [...filtered].sort((a, b) => {
      if (!sortColumn || !sortDirection) return 0;

      let result = 0;

      if (sortColumn === "price") {
        result = (a.price ?? 0) - (b.price ?? 0);
      } else if (sortColumn === "title") {
        result = a.title.localeCompare(b.title);
      } else if (sortColumn === "createdAt") {
        result =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortDirection === "desc" ? -result : result;
    });

    // Ответ
    return {
      items: sorted.slice(skip, skip + limit).map((item) => ({
        id: item.id,
        category: item.category,
        title: item.title,
        price: item.price,
        needsRevision: doesItemNeedRevision(item),
      })),
      total: filtered.length,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        error: treeifyError(error),
      });
    }
    fastify.log.error(error);
    return reply.status(500).send({
      success: false,
      error: "Internal Server Error",
    });
  }
});

/**
 * 3. Обновление объявления
 */
interface ItemUpdateRequest {
  Params: { id: string };
}

fastify.put<ItemUpdateRequest>("/items/:id", async (request, reply) => {
  const itemId = Number(request.params.id);
  const itemIndex = ITEMS.findIndex((i) => i.id === itemId);

  if (itemIndex === -1) {
    return reply.status(404).send({
      success: false,
      error: "Item not found",
    });
  }

  try {
    const parsedData = ItemUpdateInSchema.parse({
      ...ITEMS[itemIndex], // Прокидываем текущие данные для валидации
      ...(request.body as object),
    });

    // Обновляем данные
    ITEMS[itemIndex] = {
      ...ITEMS[itemIndex],
      ...parsedData,
      updatedAt: new Date().toISOString(),
    };

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        success: false,
        error: treeifyError(error),
      });
    }
    return reply.status(500).send({
      success: false,
      error: "Failed to update item",
    });
  }
});

// Запуск сервера
const PORT = Number(process.env.PORT) || 8080;

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Server is listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
