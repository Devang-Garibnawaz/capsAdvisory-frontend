import { getBaseUrl } from "../../http/globalUrl";
import { getRequiredHeaders } from "../../services/userService";

const BASE_URL = getBaseUrl();
const GET_CLIENT_ORDERS_DATA = 'orders/getClientOrders';
const GET_EXPIRY_LIST = 'orders/getNiftyExpiryList';
const GET_NIFTY_OPTION_CHAIN_DATA = 'orders/getNFOOptionChainData';
const POST_NFO_ORDER_PLACE = 'orders/placeNFOOrder';
const POST_NFO_NIFTY_WEBSOCKET = 'orders/niftyWebsocketConnect';
const POST_CANCEL_ORDERS = 'orders/cancelOrders'
const POST_EXIT_POSTIONS = 'orders/squareOffPositions'

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

export async function getNiftyStrikePriceList(expiryDate: string, symbol: string = 'NIFTY') {

    try {
        const response = await fetch(`${BASE_URL}${GET_NIFTY_OPTION_CHAIN_DATA}?symbol=${symbol}&expiryDate=${expiryDate}`);
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


export async function postNFOOrderPlace(symbolToken: string, quantity: number, buyingPrice: number, target: number, stopLoss: number, expiryDate: string, niftyOption:string, isSimpleTrade:boolean, symbol: string = 'NIFTY') {

    try {
        const requestBody = {
            symbolToken: symbolToken,
            quantity: quantity,
            buyingPrice: buyingPrice,
            target: target,
            stopLoss: stopLoss,
            expiryDate: expiryDate,
            niftyOption: niftyOption,
            simpleTrade: isSimpleTrade,
            symbol: symbol
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        };
        const response = await fetch(`${BASE_URL}${POST_NFO_ORDER_PLACE}`, requestOptions);
        return await response.json();
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function connectWebSocket(){
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        };
        const response = await fetch(`${BASE_URL}${POST_NFO_NIFTY_WEBSOCKET}`, requestOptions);
        return await response.json();
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed websocket connection');
    }
}

export async function CancelClientOrdersNiftyService(data:any) {
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

export async function ExitAllPostions(){
    try {
        const requestOptions = {
            method: 'POST',
            headers: await getRequiredHeaders()
        };
        const response = await fetch(`${BASE_URL}${POST_EXIT_POSTIONS}`, requestOptions);
        return await response.json();
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}