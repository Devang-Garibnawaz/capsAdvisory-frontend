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

export const getRequiredHeaders = async () => {
    const token = localStorage.getItem("authkey") || null;
    // It's not possible to get the user's IP address directly from the browser using JavaScript due to security restrictions.
    // You can use a third-party service to fetch the public IP address, e.g., https://api.ipify.org?format=json
    // Example (async, so you need to handle this outside of a sync function):
    const ip = await fetch('https://api.ipify.org?format=json').then(res => res.json()).then(data => data.ip);

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.toString()}`,
        "x-forwarded-for": ip // You need to fetch the IP asynchronously before calling this function
    };
};
