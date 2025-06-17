import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Authentication bypassed - always return authenticated state
  return {
    user: { id: "demo-user", name: "Demo User" },
    isLoading: false,
    isAuthenticated: true,
  };
}