"use client";

import {
  useMutation,
  useQuery,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { AxiosRequestConfig } from "axios";
import type { z } from "zod";
import { apiRequest } from "@/lib/api/request";
import "@/lib/query/meta";

type ApiQueryOptions<TSchema extends z.ZodTypeAny> = {
  queryKey: QueryKey;
  request: AxiosRequestConfig;
  schema: TSchema;
  options?: Omit<
    UseQueryOptions<z.infer<TSchema>, Error, z.infer<TSchema>, QueryKey>,
    "queryKey" | "queryFn"
  >;
};

type ApiMutationOptions<TSchema extends z.ZodTypeAny, TVariables> = {
  schema: TSchema;
  request: (variables: TVariables) => AxiosRequestConfig;
  options?: Omit<
    UseMutationOptions<z.infer<TSchema>, Error, TVariables>,
    "mutationFn"
  >;
};

export function useApiQuery<TSchema extends z.ZodTypeAny>({
  queryKey,
  request,
  schema,
  options,
}: ApiQueryOptions<TSchema>) {
  return useQuery<z.infer<TSchema>, Error, z.infer<TSchema>, QueryKey>({
    ...options,
    queryKey,
    queryFn: () => apiRequest(request, schema),
  });
}

export function useApiMutation<TSchema extends z.ZodTypeAny, TVariables>({
  schema,
  request,
  options,
}: ApiMutationOptions<TSchema, TVariables>) {
  return useMutation<z.infer<TSchema>, Error, TVariables>({
    ...options,
    mutationFn: (variables) => apiRequest(request(variables), schema),
  });
}
