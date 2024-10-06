import { getBaseUrl } from "../../http/globalUrl";

const BASE_URL = getBaseUrl();
const GET_JOB_DATA_URL = "jobs";
const POST_JOBS_STOP_URL = "stop";

export const FetchJobsDataService = async (date:Date, state:string, page:number,perPage:number) => {
  
    let jobsData: any = [];
  
    let strDate = date.getFullYear()+'-'+(date.getMonth() + 1) +'-'+date.getDate();
    jobsData = await (await fetch(`${BASE_URL}${GET_JOB_DATA_URL}?date=${strDate}&perPage=${perPage}&page=${page}${state ? `&state=${state}` : ''}`)).json();
    return jobsData;
};

export const StopJobsService = async (jobId:string) => {
  
    return await (await fetch(BASE_URL+GET_JOB_DATA_URL+"/"+POST_JOBS_STOP_URL+"/"+jobId,{method:'PUT'})).json();
};