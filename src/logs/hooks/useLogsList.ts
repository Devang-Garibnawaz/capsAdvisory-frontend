import { getBaseUrl } from "../../http/globalUrl";

const BASE_URL = getBaseUrl();
const GET_LOGS_DATA_URL = "logs";

export const FetchLogsDataService = async (date:Date,page:number,perPage:number) => {
  
    let logsData: any = [];
  
    let strDate = date.getFullYear()+'-'+(date.getMonth() + 1) +'-'+date.getDate();
    logsData = await (await fetch(`${BASE_URL}${GET_LOGS_DATA_URL}?date=${strDate}&perPage=${perPage}&page=${page}`)).json();
    return logsData;
};
