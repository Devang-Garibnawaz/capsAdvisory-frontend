import axios from "axios";
import { useState } from "react";

const updatePasswordRequest = async ({
  oldPassword,
  newPassword,
}: {
  oldPassword: string;
  newPassword: string;
}) => {
  const { data } = await axios.put("/api/password", {
    oldPassword,
    newPassword,
  });
  return data;
};

export function useUpdatePassword() {
  const [isLoading, setIsLoading] = useState(false);

  const updatePassword = async (params: { oldPassword: string; newPassword: string }) => {
    try {
      setIsLoading(true);
      const result = await updatePasswordRequest(params);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { isUpdating: isLoading, updatePassword };
}
