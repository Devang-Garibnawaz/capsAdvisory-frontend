import { getBaseUrl } from "../../http/globalUrl";

const BASE_URL = getBaseUrl();
const GET_LOGIN_USERS_LIST ='users/getLoginUsers';
const POST_TRADE_ON_OFF ='users/tradeToggle';
const POST_CHANGE_USER_STATUS ='users/updateUserStatus';
const POST_AUTO_LOGIN_USERS ='users/autoLoginAngel';

export async function FetchLoginUsersDataService(date:Date){

    try {
        let strDate = date.getFullYear()+'-'+(date.getMonth() + 1) +'-'+date.getDate();
        const response = await fetch(`${BASE_URL}${GET_LOGIN_USERS_LIST}?date=${strDate}`);
        const json = await response.json();
        return json.usersData;
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function tradeToggle(clientCode:string,status:boolean){

    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({clientCode:clientCode,trade:status})
        };
        const response = await fetch(`${BASE_URL}${POST_TRADE_ON_OFF}`,requestOptions);
        return await response.json();
    } catch (error) {
        console.log('Error trade toggle:', error);
        throw new Error('Failed to toggle trade for user');
    }
}

export async function updateUserStatus(clientCode:string,status:boolean){

    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({clientCode:clientCode,isActive:status})
        };
        const response = await fetch(`${BASE_URL}${POST_CHANGE_USER_STATUS}`,requestOptions);
        return await response.json();
    } catch (error) {
        console.log('Error trade toggle:', error);
        throw new Error('Failed to toggle trade for user');
    }
}

export async function autoLoginAngel(){
    
    try {
        const response = await fetch(`${BASE_URL}${POST_AUTO_LOGIN_USERS}`,{method:'POST'});
        const json = await response.json();
        return json;
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}





