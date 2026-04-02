import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// Добавляем импорт AIRequest, если он у тебя в types.ts,
// либо оставляем встроенное описание в мутации
import type { AdItem, FiltersState, AIResponse } from "../types/types";
import { getServiceCategory } from "../utils/categoryHelper";

interface ItemsResponse {
  items: AdItem[];
  total: number;
}

// Типизируем тело запроса для AI, чтобы не плодить inline-типы
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
    // 1. Получение списка (Query: FiltersState -> ItemsResponse)
    getAds: builder.query<ItemsResponse, FiltersState>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.categories.length) {
          const serverCats = filters.categories
            .map(getServiceCategory)
            .join(",");
          params.append("categories", serverCats);
        }
        // Добавь остальные фильтры (q, sort и т.д.) здесь, если нужно
        return `items?${params.toString()}`;
      },
      providesTags: ["Ads"],
    }),

    // 2. Получение одного объявления (Query: string (id) -> ItemsResponse)
    getAdById: builder.query<ItemsResponse, string>({
      query: (id) => `items/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Ads" as const, id }],
    }),

    // 3. Обновление объявления (Mutation: {id, body} -> AdItem)
    // Избавляемся от any, заменяем на Partial<AdItem>
    updateAd: builder.mutation<AdItem, { id: string; body: Partial<AdItem> }>({
      query: ({ id, body }) => ({
        url: `items/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Ads" as const, id },
        "Ads",
      ],
    }),

    // 4. Генерация через ИИ (Mutation: AIRequest -> string)
    generateAI: builder.mutation<string, AIRequest>({
      query: (body) => ({
        url: "items/generate-ai",
        method: "POST",
        body,
      }),
      // На сервере возвращается { result: string }, мы отдаем компоненту чистую строку
      transformResponse: (response: AIResponse) => response.result,
    }),
  }),
});

export const {
  useGetAdsQuery,
  useGetAdByIdQuery,
  useUpdateAdMutation,
  useGenerateAIMutation,
} = adsApi;
