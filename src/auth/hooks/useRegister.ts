import axios from "axios";
import { useMutation } from "react-query";
import { UserInfo } from "../types/userInfo";
import { getBaseUrl } from "../../http/globalUrl";

const BASE_URL = getBaseUrl();
const GET_LOGIN_URL = 'users/register';
// const register = async (userInfo: UserInfo): Promise<UserInfo> => {
//   const { data } = await axios.post("/api/register", userInfo);
//   return data;
// };

const register = async (userInfo: UserInfo): Promise<UserInfo> => {
  userInfo.role = 'user'; // default role assign as user
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userInfo)
  };
  const data  = await (await fetch(`${BASE_URL}${GET_LOGIN_URL}`,requestOptions)).json();//await axios.post(`${BASE_URL}${GET_LOGIN_URL}`, { email, password });
  return data;
};

export function useRegister() {
  const { isLoading, mutateAsync } = useMutation(register);
  return { isRegistering: isLoading, register: mutateAsync };
}
