import { getBaseUrl } from "../../http/globalUrl";

const BASE_URL = getBaseUrl();
const GET_CLIENT_ORDERS_DATA = 'orders/getClientOrders';
const GET_EXPIRY_LIST = 'orders/getNiftyExpiryList';
const GET_NIFTY_OPTION_CHAIN_DATA = 'orders/getOptionChainData';
export async function getNiftyExpiryList(symbol: string = 'NIFTY') {

    try {
        const response = await fetch(`${BASE_URL}${GET_EXPIRY_LIST}?symbol=${symbol}`);
        const json = await response.json();
        return [...json.data?.expiryDates.monthEnd, ...json.data?.expiryDates.week];
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function getNiftyStrikePriceList(expiryDate: string, symbol: string = 'NIFTY', index: string = 'NFO') {

    try {
        const response = await fetch(`${BASE_URL}${GET_NIFTY_OPTION_CHAIN_DATA}?symbol=${symbol}&expiryDate=${expiryDate}&index=${index}`);
        const json = await response.json();
        return json.data?.optionsData;
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function FetchClientOrdersDataNiftyService(date: Date) {
    try {
        const query = '?date=';
        let strDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
        const response = await fetch(`${BASE_URL}${GET_CLIENT_ORDERS_DATA}${query}${strDate}`);
        const json = await response.json();

        return json.orderData;
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}