import { useState } from "react";
import { UserInfo } from "../types/userInfo";
import { getBaseUrl } from "../../http/globalUrl";

const BASE_URL = getBaseUrl();
const GET_LOGIN_URL = 'users/register';

const registerRequest = async (userInfo: UserInfo): Promise<UserInfo> => {
  userInfo.role = 'admin'; // default role assign as admin
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInfo)
  };
  const data = await (await fetch(`${BASE_URL}${GET_LOGIN_URL}`, requestOptions)).json();
  return data;
};

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);

  const register = async (userInfo: UserInfo) => {
    try {
      setIsLoading(true);
      const result = await registerRequest(userInfo);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { isRegistering: isLoading, register };
}
