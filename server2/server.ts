import Fastify from "fastify";
import cors from "@fastify/cors";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RequestGenericInterface } from "fastify";

import { Item } from "./src/types.ts";
import { ItemsGetInQuerySchema, ItemUpdateInSchema } from "./src/validation.ts";
import { treeifyError, ZodError } from "zod";
import { doesItemNeedRevision } from "./src/utils.ts";

// --- Настройка путей и БД ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "data", "items.json");

let ITEMS: Item[] = [];

const fastify = Fastify({
  logger: true,
});

const loadDatabase = async () => {
  const rawData = await fs.readFile(DB_PATH, "utf-8");
  ITEMS = JSON.parse(rawData);
};

await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
await fastify.register((await import("@fastify/middie")).default);

fastify.use((_req, _res, next) => {
  const delay = 300 + Math.random() * 700;
  setTimeout(next, delay);
});

interface ItemParams {
  id: string;
}

interface ItemsGetRequest extends RequestGenericInterface {
  Querystring: {
    q?: string;
    limit?: string;
    skip?: string;
    categories?: string;
    needsRevision?: string;
    sortColumn?: string;
    sortDirection?: string;
  };
}

fastify.get<ItemsGetRequest>("/items", async (request) => {
  const {
    q,
    limit,
    skip,
    needsRevision,
    categories,
    sortColumn,
    sortDirection,
  } = ItemsGetInQuerySchema.parse(request.query);

  const filteredItems = ITEMS.filter((item) => {
    const matchesSearch =
      !q || item.title.toLowerCase().includes(q.toLowerCase());
    const matchesRevision = !needsRevision || doesItemNeedRevision(item);
    const matchesCategory =
      !categories?.length || categories.includes(item.category);
    return matchesSearch && matchesRevision && matchesCategory;
  });

  const items = filteredItems
    .toSorted((a, b) => {
      if (!sortDirection || !sortColumn) return 0;

      let diff = 0;
      if (sortColumn === "price") diff = (a.price ?? 0) - (b.price ?? 0);
      else if (sortColumn === "title") diff = a.title.localeCompare(b.title);
      else if (sortColumn === "createdAt") {
        diff =
          new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf();
      }

      return sortDirection === "desc" ? -diff : diff;
    })
    .slice(skip, skip + limit)
    .map((item) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      price: item.price,
      params: item.params,
      description: item.description,
      needsRevision: doesItemNeedRevision(item),
    }));

  return { items, total: filteredItems.length };
});

fastify.get<{ Params: ItemParams }>("/items/:id", async (request, reply) => {
  const itemId = Number(request.params.id);

  if (!Number.isFinite(itemId)) {
    return reply
      .status(400)
      .send({ success: false, error: "ID must be a number" });
  }

  const item = ITEMS.find((i) => i.id === itemId);
  if (!item) {
    return reply.status(404).send({ success: false, error: "Item not found" });
  }

  return { ...item, needsRevision: doesItemNeedRevision(item) };
});

fastify.patch<{ Params: ItemParams }>("/items/:id", async (request, reply) => {
  const itemId = Number(request.params.id);
  const itemIndex = ITEMS.findIndex((i) => i.id === itemId);

  if (itemIndex === -1) {
    return reply.status(404).send({ success: false, error: "Not found" });
  }

  try {
    const parsedData = ItemUpdateInSchema.parse({
      ...ITEMS[itemIndex],
      ...(request.body as object),
    });

    ITEMS[itemIndex] = {
      ...ITEMS[itemIndex],
      ...parsedData,
      updatedAt: new Date().toISOString(),
    };

    // Пишем в файл
    await fs.writeFile(DB_PATH, JSON.stringify(ITEMS, null, 2), "utf-8");

    return { success: true };
  } catch (error) {
    if (error instanceof ZodError) {
      return reply
        .status(400)
        .send({ success: false, error: treeifyError(error) });
    }
    return reply
      .status(500)
      .send({ success: false, error: "Internal Server Error" });
  }
});

const start = async () => {
  try {
    await loadDatabase();
    const port = Number(process.env.PORT) || 8080;
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`Server ready at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
