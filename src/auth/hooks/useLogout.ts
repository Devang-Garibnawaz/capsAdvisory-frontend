import axios from "axios";
import { useState } from "react";

const logoutRequest = async (): Promise<string> => {
  const { data } = await axios.post("/api/logout");
  return data;
};

export function useLogout() {
  const [isLoading, setIsLoading] = useState(false);

  const logout = async () => {
    try {
      setIsLoading(true);
      const result = await logoutRequest();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoggingOut: isLoading, logout };
}
