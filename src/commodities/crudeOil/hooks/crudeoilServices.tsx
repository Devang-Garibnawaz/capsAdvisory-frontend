import { getBaseUrl } from "../../../http/globalUrl";

const BASE_URL = getBaseUrl();
const GET_EXPIRY_LIST = 'orders/getCrudeOilExpiryList';
const GET_STRIKE_PRICE_LIST = 'orders/getStrikePriceList';
const POST_ORDER_PLACE = 'orders/placeOrder';
const GET_CLIENT_ORDERS_DATA = 'orders/getClientOrders';
const POST_CANCEL_ORDERS = 'orders/cancelOrders'
export async function getExpiryList(symbol: string = 'CRUDEOIL') {

    try {
        const response = await fetch(`${BASE_URL}${GET_EXPIRY_LIST}?symbol=${symbol}`);
        const json = await response.json();
        return json.data?.expiryDates;
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function getStrikePriceList(expiryDate: string, symbol: string = 'CRUDEOIL') {

    try {
        const response = await fetch(`${BASE_URL}${GET_STRIKE_PRICE_LIST}?symbol=${symbol}&expiryDate=${expiryDate}`);
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function postOrderPlace(symbolToken: string, quantity: number, buyingPrice: number, targetPrice: number, stoplossPrice: number, expiryDate: string, symbol: string = 'CRUDEOIL') {

    try {
        const requestBody = {
            symbolToken: symbolToken,
            quantity: quantity,
            buying: buyingPrice,
            target: targetPrice,
            stopLoss: stoplossPrice,
            expiryDate: expiryDate,
            symbol: symbol
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        };
        const response = await fetch(`${BASE_URL}${POST_ORDER_PLACE}`, requestOptions);
        return await response.json();
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function FetchClientOrdersDataService(date:Date) {
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

export async function CancelClientOrdersService(data:any) {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
        const response = await fetch(`${BASE_URL}${POST_CANCEL_ORDERS}`, requestOptions);
        return await response.json();
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}



