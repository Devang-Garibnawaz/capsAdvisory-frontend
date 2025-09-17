import { useState } from "react";
import axios from "axios";

const forgotPasswordSubmitRequest = async ({
  code,
  newPassword,
}: {
  code: string;
  newPassword: string;
}) => {
  const { data } = await axios.post("/api/forgot-password-submit", {
    code,
    newPassword,
  });
  return data;
};

export function useForgotPasswordSubmit() {
  const [isLoading, setIsLoading] = useState(false);

  const forgotPasswordSubmit = async (params: {
    code: string;
    newPassword: string;
  }) => {
    try {
      setIsLoading(true);
      const result = await forgotPasswordSubmitRequest(params);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, forgotPasswordSubmit };
}
