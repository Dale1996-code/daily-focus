import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiGet } from "./api";

type UnauthorizedBehavior = "returnNull" | "throw";

export function getQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> {
  const unauthorizedBehavior = options.on401;
  return async ({ queryKey }) => {
    try {
      return await apiGet<T>(queryKey.join("/") as string);
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error?.status === 401) {
        return null as T;
      }
      throw error;
    }
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
