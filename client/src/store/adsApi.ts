import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AdItem, FiltersState } from "../types/types";

interface ItemsResponse {
  items: AdItem[];
  total: number;
}

export interface AIRequest {
  action: "improve" | "price";
  text?: string;
  title?: string;
}

export const adsApi = createApi({
  reducerPath: "adsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8080/" }),
  tagTypes: ["Ads"], // Тег для синхронизации данных
  endpoints: (builder) => ({
    // 1. Получение списка объявлений
    getAds: builder.query<ItemsResponse, FiltersState & { page: number }>({
      query: (filters) => {
        const sortMap: Record<string, { col: string; dir: string }> = {
          newest: { col: "createdAt", dir: "desc" },
          "price-asc": { col: "price", dir: "asc" },
          "price-desc": { col: "price", dir: "desc" },
          "title-asc": { col: "title", dir: "asc" },
          "title-desc": { col: "title", dir: "desc" },
        };

        const { col, dir } =
          sortMap[filters.sortBy as string] || sortMap["newest"];
        const limit = 10;
        const skip = (filters.page - 1) * limit;

        return {
          url: "items",
          params: {
            q: filters.searchQuery || undefined,
            // Если сервер ждет массив в формате string, оставляем join
            categories: filters.categories?.length
              ? filters.categories.join(",")
              : undefined,
            needsRevision: filters.onlyRequiresRevision ? "true" : undefined,
            sortColumn: col,
            sortDirection: dir,
            limit,
            skip,
          },
        };
      },
      // Привязываем список к тегу "Ads" с ID "LIST"
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "Ads" as const, id })),
              { type: "Ads", id: "LIST" },
            ]
          : [{ type: "Ads", id: "LIST" }],
    }),

    // 2. Получение одного объявления
    getAdById: builder.query<AdItem, string | number>({
      query: (id) => `items/${id}`,
      providesTags: (_result, _error, id) => [
        { type: "Ads", id: id ?? "UNKNOWN" },
      ],
    }),

    // 3. Обновление объявления (PATCH — меняет только присланные поля)
    updateAd: builder.mutation<
      AdItem,
      { id: string | number; body: Partial<AdItem> }
    >({
      query: ({ id, body }) => ({
        url: `items/${id}`,
        method: "PATCH", // PATCH надежнее для Partial данных
        body,
      }),
      // Инвалидируем конкретный ID и список LIST, чтобы всё перерисовывалось
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Ads", id },
        { type: "Ads", id: "LIST" },
      ],
    }),

    // 4. Генерация через ИИ
    generateAI: builder.mutation<string, AIRequest>({
      query: (body) => ({
        // Оставляем полный URL, если ИИ живет на другом порту/сервере
        url: "http://localhost:3001/api/generate-ai",
        method: "POST",
        body,
      }),
      transformResponse: (response: { result: string }) => response.result,
    }),
  }),
});

export const {
  useGetAdsQuery,
  useGetAdByIdQuery,
  useUpdateAdMutation,
  useGenerateAIMutation,
} = adsApi;
