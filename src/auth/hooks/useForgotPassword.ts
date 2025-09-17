import { useState } from "react";
import axios from "axios";

const forgotPasswordRequest = async ({ email }: { email: string }) => {
  const { data } = await axios.post("/api/forgot-password", { email });
  return data;
};

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);

  const forgotPassword = async (params: { email: string }) => {
    try {
      setIsLoading(true);
      const result = await forgotPasswordRequest(params);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, forgotPassword };
}
