import { useState } from "react";
import { getBaseUrl } from "../../http/globalUrl";
import { getRequiredHeaders } from "../../services/userService";

const BASE_URL = getBaseUrl();
const GET_LOGIN_URL = 'users/login';

const loginRequest = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<any> => {
  const requestOptions = {
    method: 'POST',
    headers: await getRequiredHeaders(),
    body: JSON.stringify({ email, password })
  };
  const data = await (await fetch(`${BASE_URL}${GET_LOGIN_URL}`, requestOptions)).json();
  return data;
};

export function useLogin() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = async (params: { email: string; password: string }) => {
    try {
      setIsLoggingIn(true);
      const result = await loginRequest(params);
      return result;
    } finally {
      setIsLoggingIn(false);
    }
  };

  return { isLoggingIn, login };
}
