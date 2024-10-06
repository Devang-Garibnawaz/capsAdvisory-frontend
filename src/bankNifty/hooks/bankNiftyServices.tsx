import {getBaseUrl} from '../../http/globalUrl'

const BASE_URL = getBaseUrl();
const GET_SYMBOL_TOKEN_LIST ='orders/getSymbolToken';
const GET_OPTION_CHAIN_LIST ='orders/getOptionChainData';
const GET_FRVP_COUNT = 'orders/getPrevData';
const GET_ORDERS_DATA = 'orders';

export async function getSymbolTokenList(){

    try {
        const response = await fetch(`${BASE_URL}${GET_SYMBOL_TOKEN_LIST}`);
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function getBankNiftyExpiryList(){

    try {
        const response = await fetch(`${BASE_URL}${GET_OPTION_CHAIN_LIST}?symbol=BANKNIFTY`);
        const json = await response.json();
        return [...json.data?.expiryDates?.monthEnd,...json.data?.expiryDates?.week];
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function getFRVPCount(fromDate:string, toDate:string, interval:string, symbolToken:string){
    const query = `?fromDate=${fromDate}&toDate=${toDate}&interval=${interval}&symbolToken=${symbolToken}`;
    try {
        const response = await fetch(`${BASE_URL}${GET_FRVP_COUNT}${query}`);
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export const FetchOrdersDataService = async (date:Date,symbol:string = '') => {
    try {
      let ordersDataFinal: any = []; 
      const query='?date=';
      let strDate = date.getFullYear()+'-'+(date.getMonth() + 1) +'-'+date.getDate();
        const response = await fetch(`${BASE_URL}${GET_ORDERS_DATA}${query}${strDate}`);
        const json = await response.json();
        
        if(symbol != ""){
          json.orderData.filter((item:any)=>{
            if(item.symbol?.toUpperCase().includes(symbol.toUpperCase())){
              ordersDataFinal.push(item);
            }
          });
        }
        else{
          ordersDataFinal = json.orderData;
        }
        return ordersDataFinal;

      } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
      }
  };




