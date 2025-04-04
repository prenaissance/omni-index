import { createContext, useContext } from "react";
import type { paths } from "~/lib/api-types";

type ProfileType =
  paths["/api/profile"]["get"]["responses"]["200"]["content"]["application/json"];

type AuthContextType = {
  user: ProfileType | null;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
