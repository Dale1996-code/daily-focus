import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./api";

export interface AuthUser {
  id: string;
  username: string;
}

export interface AuthSessionResponse {
  authenticated: boolean;
  needsSetup: boolean;
  user?: AuthUser;
}

export function useAuthSession() {
  return useQuery<AuthSessionResponse>({
    queryKey: ["/api/auth/session"],
    queryFn: () => apiRequest<AuthSessionResponse>("GET", "/api/auth/session"),
    retry: false,
  });
}
