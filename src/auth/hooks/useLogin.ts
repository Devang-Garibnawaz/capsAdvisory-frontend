import axios from "axios";
import { useMutation } from "react-query";
import { getBaseUrl } from "../../http/globalUrl";

const BASE_URL = getBaseUrl();
const GET_LOGIN_URL = 'users/login';

const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<any> => {
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  };
  const data  = await (await fetch(`${BASE_URL}${GET_LOGIN_URL}`,requestOptions)).json();//await axios.post(`${BASE_URL}${GET_LOGIN_URL}`, { email, password });
  return data;
};

export function useLogin() {
  const { isLoading, mutateAsync } = useMutation(login);

  return { isLoggingIn: isLoading, login: mutateAsync };
}
