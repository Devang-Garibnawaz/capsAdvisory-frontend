import { getBaseUrl } from "../../http/globalUrl";
import { getRequiredHeaders } from "../../services/userService";

const BASE_URL = getBaseUrl();
const GET_AVAILABLE_BROKERS_LIST = 'users/getExistBrokersList';
const ADD_DEMAT_ACCOUNT = 'users/addDematAccount';
const GET_DEMAT_ACCOUNTS = 'users/getDematAccounts';
const UPDATE_DEMAT_ACCOUNT_TRADE_TOGGLE = 'users/updateDematAccountTradeToggle';
const DELETE_DEMAT_ACCOUNT = 'users/deleteDematAccount';
const AUTO_LOGIN_USERS = 'users/autoLoginUsers';
const CANCEL_ALL_ORDERS_Group = 'groups/cancelAllOrders';
const CANCEL_ALL_ORDERS_User = 'users/cancelAllOrders';
const CANCEL_ORDER_BY_ORDER_ID = 'users/cancelOrder';
const SQUARE_OFF_BY_ID = 'users/squareOff';

export async function getAvailableBrokersList() {
    try {
        
        const headers = getRequiredHeaders();
        const response = await fetch(`${BASE_URL}${GET_AVAILABLE_BROKERS_LIST}`, {
            method: 'GET',
            headers: headers
        });

        const json = await response.json();
        return json;
    } catch (error) {
        console.log('Error fetching data:', error);
        throw new Error('Failed to fetch data');
    }
}

export async function addDematAccount(brokerDetails: any) {
    try {
        const headers = getRequiredHeaders();
        const response = await fetch(`${BASE_URL}${ADD_DEMAT_ACCOUNT}`, {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(brokerDetails)
        });

        const json = await response.json();
        return json;
    } catch (error) {
        console.log('Error adding demat account:', error);
        throw new Error('Failed to add demat account');
    }
}

export async function getDematAccounts() {
    try {
        const headers = getRequiredHeaders();
        const response = await fetch(`${BASE_URL}${GET_DEMAT_ACCOUNTS}`, {
            method: 'GET',
            headers: headers
        });

        const json = await response.json();
        return json;
    } catch (error) {
        console.log('Error fetching demat accounts:', error);
        throw new Error('Failed to fetch demat accounts');
    }
}

export async function updateDematAccountTradeToggle(dematAccountId: string, isTradeEnable: boolean) {
    try {
        const headers = getRequiredHeaders();
        const response = await fetch(`${BASE_URL}${UPDATE_DEMAT_ACCOUNT_TRADE_TOGGLE}`, {
            method: 'PUT',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dematAccountId,
                isTradeEnable
            })
        });

        const json = await response.json();
        return json;
    } catch (error) {
        console.log('Error updating trade toggle:', error);
        throw new Error('Failed to update trade toggle');
    }
}

export const deleteDematAccount = async (accountId: string) => {
  try {
    const response = await fetch(`${BASE_URL}${DELETE_DEMAT_ACCOUNT}/${accountId}`, {
      method: 'DELETE',
      headers: getRequiredHeaders()
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting demat account:', error);
    throw error;
  }
};

export const autoLoginUsers = async () => {
  try {
    const response = await fetch(`${BASE_URL}${AUTO_LOGIN_USERS}`, {
      method: 'POST',
      headers: getRequiredHeaders()
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in autoLoginUsers:', error);
    throw error;
  }
};

export const cancelAllOrders = async (groupId ='', dematAccountId = ''): Promise<any> => {
  try {
    const url = groupId 
      ? `${BASE_URL}${CANCEL_ALL_ORDERS_Group}/${groupId}`
      : `${BASE_URL}${CANCEL_ALL_ORDERS_User}/${dematAccountId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getRequiredHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelling orders:', error);
    return {
      status: false,
      message: 'Failed to cancel orders',
    };
  }
};

export const cancelOrderByOrderId = async (orderId: string) => {
  try {
    const response = await fetch(`${BASE_URL}${CANCEL_ORDER_BY_ORDER_ID}/${orderId}`, {
      method: 'POST',
      headers: getRequiredHeaders(),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    return {
      status: false,
      message: 'Failed to cancel order',
    };
  }
};

export const squareOffById = async (positionId: string, position: any) => {
  try {
    const response = await fetch(`${BASE_URL}${SQUARE_OFF_BY_ID}/${positionId}`, {
      method: 'POST',
      headers: getRequiredHeaders(),
      body: JSON.stringify(position)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error squaring off position:', error);
    return {
      status: false,
      message: 'Failed to square off position',
    };
  }
};
