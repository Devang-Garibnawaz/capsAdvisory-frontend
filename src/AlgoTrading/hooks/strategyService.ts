import { IndicatorsResponse } from '../types/strategy';
import { getBaseUrl } from '../../http/globalUrl';
import { getRequiredHeaders } from '../../services/userService';


const BASE_URL = getBaseUrl();
const GET_INDICATOS = 'strategies/indicators';
const POST_CREATE_STRATEGY = 'strategies/createStrategy';
const GET_STRATEGIES = 'strategies/getStrategies';
const DELETE_STRATEGY = 'strategies/deleteStrategy';
const DEPLOY_STRATEGY = 'strategies/deployStrategy';
const STOP_STRATEGY = 'strategies/stopStrategy';
const UPDATE_STRATEGY = 'strategies/updateStrategy';

export const fetchIndicators = async (): Promise<IndicatorsResponse> => {
    const response = await fetch(`${BASE_URL}${GET_INDICATOS}`,{
        method: 'GET',
        headers: await getRequiredHeaders()
    });
    return response.json();
};

export const createStrategy = async (strategyData: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}${POST_CREATE_STRATEGY}`, {
        method: 'POST',
        headers: await getRequiredHeaders(),
        body: JSON.stringify(strategyData)
    });
    return response.json();
};

export const fetchStrategies = async () => {
    const response = await fetch(`${BASE_URL}${GET_STRATEGIES}`, {
        method: 'GET',
        headers: await getRequiredHeaders()
    });

    return response.json();
};

export const deleteStrategy = async (id: string) => {
    const response = await fetch(`${BASE_URL}${DELETE_STRATEGY}/${id}`, {
        method: 'DELETE',
        headers: await getRequiredHeaders()
    });
    
    return response.json();
};

export const deployStrategy = async (id: string) => {
    const response = await fetch(`${BASE_URL}${DEPLOY_STRATEGY}/${id}`, {
        method: 'POST',
        headers: await getRequiredHeaders()
    });

    return response.json();
};

export const stopStrategy = async (id: string) => {
    const response = await fetch(`${BASE_URL}${STOP_STRATEGY}/${id}`, {
        method: 'POST',
        headers: await getRequiredHeaders()
    });
    
    if (!response.ok) {
        throw new Error('Failed to stop strategy');
    }

    return response.json();
};

export const updateStrategy = async (id: string, strategyData: any): Promise<any> => {
    const response = await fetch(`${BASE_URL}${UPDATE_STRATEGY}/${id}`, {
        method: 'PUT',
        headers: await getRequiredHeaders(),
        body: JSON.stringify(strategyData)
    });
    
    if (!response.ok) {
        throw new Error('Failed to update strategy');
    }

    return response.json();
};