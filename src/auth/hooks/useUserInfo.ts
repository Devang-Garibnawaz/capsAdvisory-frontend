import axios from "axios";
import { useQuery } from "react-query";
import { UserInfo } from "../types/userInfo";
import { getBaseUrl } from "../../http/globalUrl";

const GET_USER_INFO_URL = "users/getUserInfo";
const BASE_URL = getBaseUrl();
const fetchUserInfo = async (key?: string): Promise<UserInfo> => {
  const data:any = await (await fetch(`${BASE_URL}${GET_USER_INFO_URL}`, {method: 'GET',headers: {'token':key!}})).json();
  // const data:any = await fetch(`${BASE_URL}${GET_USER_INFO_URL}?key=${key}`);
  // const userInfo:UserInfo = {
  //   id: "1dxyjubasuhkjbeiue",
  //   email: "tredcode@success.com",
  //   fullName: "Angel",
  //   progress: 5,
  //   role: "user",
  //   password: "",
  //   pinNumber: "",
  //   clientId: "",
  //   status: "",
  //   message: ""
  // };
  return data.userInfo;
};

export function useUserInfo(key?: string) {
  return useQuery(["user-info", key], () => fetchUserInfo(key), {
    enabled: !!key,
  });
}
