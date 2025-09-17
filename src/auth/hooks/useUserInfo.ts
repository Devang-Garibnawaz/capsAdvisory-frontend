import { useEffect, useState } from "react";
import { UserInfo } from "../types/userInfo";
import { getBaseUrl } from "../../http/globalUrl";

const GET_USER_INFO_URL = "users/getUserInfo";
const BASE_URL = getBaseUrl();

const fetchUserInfo = async (key?: string): Promise<UserInfo> => {
  const data: any = await (await fetch(`${BASE_URL}${GET_USER_INFO_URL}`, {
    method: 'GET',
    headers: { 'token': key! }
  })).json();
  return data.userInfo;
};

export function useUserInfo(key?: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<UserInfo | null>(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      if (!key) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const userInfo = await fetchUserInfo(key);
        setData(userInfo);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user info'));
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, [key]);

  return { 
    isLoading, 
    error, 
    data,
    refetch: async () => {
      if (!key) return;
      try {
        setIsLoading(true);
        setError(null);
        const userInfo = await fetchUserInfo(key);
        setData(userInfo);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch user info'));
      } finally {
        setIsLoading(false);
      }
    }
  };
}
