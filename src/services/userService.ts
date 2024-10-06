import { getBaseUrl } from "../http/globalUrl";

const BASE_URL = getBaseUrl();
const GET_USER_INFO_URL = "users/getUserInfo";

export const FetchUserInfo = async (email:string) => {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({email:email})
      };
    const userInfo = await (await fetch(`${BASE_URL}${GET_USER_INFO_URL}`,requestOptions)).json();
    return userInfo;
};
