import { createContext, useContext } from "react";
import type { paths } from "~/lib/api-types";

type ProfileType =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type AuthContextType = ProfileType | null;

export const AuthContext = createContext<AuthContextType>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
