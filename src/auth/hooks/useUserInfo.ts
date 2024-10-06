import axios from "axios";
import { useQuery } from "react-query";
import { UserInfo } from "../types/userInfo";

const fetchUserInfo = async (key?: string): Promise<UserInfo> => {
  //const { data } = await axios.get("/api/user-info", { params: { key } });
  const userInfo:UserInfo = {
    id: "1dxyjubasuhkjbeiue",
    email: "tredcode@success.com",
    fullName: "Angel",
    progress: 5,
    role: "user",
    password: "",
    pinNumber: "",
    clientId: "",
    status: "",
    message: ""
  };
  return userInfo;
};

export function useUserInfo(key?: string) {
  return useQuery(["user-info", key], () => fetchUserInfo(key), {
    enabled: !!key,
  });
}
