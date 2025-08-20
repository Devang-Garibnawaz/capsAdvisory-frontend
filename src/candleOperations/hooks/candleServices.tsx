import { getBaseUrl } from '../../http/globalUrl';
import { getRequiredHeaders } from '../../services/userService';

const BASE_URL = getBaseUrl();
const FETCH_SYMBOL_LIST = 'candles/fetchSymbolList';
const GET_SYMBOL_DETAILS = 'candles/getSymbolDetails';
const POST_OPTION_CONTRACTS = 'candles/fetchOptionContracts'

export const fetchOptionContracts = async () =>{
    try {
        const response = await fetch(`${BASE_URL}${POST_OPTION_CONTRACTS}`, {
        method: 'POST',
        headers: await getRequiredHeaders(),
        body: JSON.stringify({index: 'NIFTY'})
    });
        const json = await response.json();
        return json;
    } catch (error) {
        throw new Error('Failed to fetch symbol list');
    }
}

export async function fetchSymbolList() {
    try {
        const response = await fetch(`${BASE_URL}${FETCH_SYMBOL_LIST}`, {
            method: 'POST',
            headers: await getRequiredHeaders(),
        });
        const json = await response.json();
        return json;
    } catch (error) {
        console.log('Error fetching symbol list:', error);
        throw new Error('Failed to fetch symbol list');
    }
}

export async function getSymbolDetails(symbol: string) {
    try {
        const response = await fetch(`${BASE_URL}${GET_SYMBOL_DETAILS}`, {
            method: 'POST',
            headers: await getRequiredHeaders(),
            body: JSON.stringify({symbol: symbol}),
        });
        const json = await response.json();
        return json;
    } catch (error) {
        console.log('Error fetching symbol details:', error);
    }
}
