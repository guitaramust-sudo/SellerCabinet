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
  tagTypes: ["Ads"],
  endpoints: (builder) => ({
    // 1. Получение списка объявлений
    // Внутри adsApi.ts -> getAds

    getAds: builder.query<ItemsResponse, FiltersState & { page: number }>({
      query: (filters) => {
        const sortMap: Record<string, { col: string; dir: string }> = {
          newest: { col: "createdAt", dir: "desc" },
          "price-asc": { col: "price", dir: "asc" },
          "price-desc": { col: "price", dir: "desc" },
          "title-asc": { col: "title", dir: "asc" },
          "title-desc": { col: "title", dir: "desc" },
        };

        const { col, dir } = sortMap[filters.sortBy] || sortMap["newest"];
        const limit = 10;
        const skip = (filters.page - 1) * limit;

        return {
          url: "items",
          params: {
            q: filters.searchQuery || undefined,
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
      providesTags: ["Ads"],
    }),
    // 2. Получение одного объявления
    getAdById: builder.query<AdItem, string>({
      query: (id) => `items/${id}`,
      providesTags: (result, error, id) => [{ type: "Ads", id }],
    }),

    // 3. Обновление объявления
    updateAd: builder.mutation<
      { success: boolean },
      { id: string; body: Partial<AdItem> }
    >({
      query: ({ id, body }) => ({
        url: `items/${id}`,
        method: "PUT",
        body,
      }),
      // Инвалидируем и список, и конкретную запись
      invalidatesTags: (result, error, { id }) => [{ type: "Ads", id }, "Ads"],
    }),

    // 4. Генерация через ИИ
    generateAI: builder.mutation<string, AIRequest>({
      query: (body) => ({
        // Используем полный URL, так как baseUrl другой
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
