import axios from "axios";
import { useMutation, useQuery } from "react-query";
import { getBaseUrl } from "../../http/globalUrl";

const BASE_URL = getBaseUrl();
const POST_ANGEL_BROKING_LOGIN_URL = "users/loginAngel";
const GET_ANGEL_BROKING_STATUS_URL = "users/checkBroker";
    
const angelBrokingLogin = async ({
  clientCode,
  password,
  totp
}: {
  clientCode: string;
  password: string;
  totp:string;
}): Promise<string> => {
  
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientCode, password,totp })
  };
  let data = await (await fetch(`${BASE_URL}${POST_ANGEL_BROKING_LOGIN_URL}`, requestOptions)).json();
  return data;
};

export function useAngelbrokingLogin() {
  const { isLoading, mutateAsync } = useMutation(angelBrokingLogin);

  return { isAngelbrokingLoggingIn: isLoading, angelBrokingLogin: mutateAsync };
}

export const CheckBrokerStatusService = async (): Promise<any> => {
  try {
    let response = await fetch(`${BASE_URL}${GET_ANGEL_BROKING_STATUS_URL}`);
    if (!response.ok) // or check for response.status
        throw new Error(response.statusText);
    return await response.json(); // or .json() or whatever
    // process body
  } catch (err) {
    throw new Error("Something went wrong. Please contact developer team.");
  }
};
