import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AdItem, FiltersState } from "../types/types";
import { getServiceCategory } from "../utils/categoryHelper";

interface ItemsResponse {
  items: AdItem[];
  total: number;
}

export const adsApi = createApi({
  reducerPath: "adsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:8080/" }),
  tagTypes: ["Ads"], // Тэги нужны для авто-обновления данных после мутаций
  endpoints: (builder) => ({
    getAds: builder.query<ItemsResponse, FiltersState>({
      query: (filters) => {
        const params = new URLSearchParams();
        if (filters.categories.length) {
          const serverCats = filters.categories
            .map(getServiceCategory) // Используем общую логику
            .join(",");
          params.append("categories", serverCats);
        }
        // ... остальное без изменений
        return `items?${params.toString()}`;
      },
      providesTags: ["Ads"],
    }),

    // Получение одного объявления
    getAdById: builder.query<ItemsResponse, string>({
      query: (id) => `items/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Ads", id }],
    }),

    // Обновление (PUT)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateAd: builder.mutation<AdItem, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `items/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Ads"],
    }),
  }),
});

// RTK Query сам сгенерировал эти хуки:
export const { useGetAdsQuery, useGetAdByIdQuery, useUpdateAdMutation } =
  adsApi;
