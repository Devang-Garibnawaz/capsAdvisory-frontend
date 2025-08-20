import { getBaseUrl } from "../../http/globalUrl";
import { getRequiredHeaders } from "../../services/userService";

const BASE_URL = getBaseUrl();
const GET_GROUPS = 'groups/getGroups';
const CREATE_GROUP = 'groups/createGroup';
const UPDATE_GROUP = 'groups/updateGroup';
const DELETE_GROUP = 'groups/deleteGroup';
const TOGGLE_MASTER = 'groups/toggleMaster';
const TOGGLE_TRADING = 'groups/toggleTrading';
const ADD_CHILD = 'groups/addChild';
const REMOVE_CHILD = 'groups/removeChild';
const GET_GROUP_CHILDREN = 'groups/getChildren';
const SQUARE_OFF_ALL_BY_GROUP = 'groups/squareOffAll';
const POST_PLACE_MANNUAL_ORDER = 'orders/placeMannualOrder';
export interface Group {
  id: string;
  name: string;
  members: string[];
  masterAccountId?: string;
  isTradeEnabled: boolean;
  stats?: {
    orders: number;
    qty: number;
    child: number;
    totalChild: number;
    pending: number;
    completed: number;
    rejected: number;
    cancelled: number;
    failed: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  members?: string[];
}

export interface UpdateGroupRequest {
  groupId: string;
  name?: string;
  members?: string[];
}

export interface ToggleMasterRequest {
  groupId: string;
  accountId: string;
}

export interface ToggleTradingRequest {
  groupId: string;
  isTrading: boolean;
}

export interface ChildAccount {
  accountId: string;
  multiplier: number;
  fixLot: boolean;
}

export interface GroupChild {
  id: string;
  accountId: string;
  multiplier: number;
  fixLot: boolean;
  name: string;
  status: 'active' | 'inactive';
  stats: {
    inGroup: number;
    pnl: number;
    margin: number;
    pos: number;
    position?: any;
    orders?: {
      orders?: any;
      total?: number;
      cancelled?: number;
      complete?: number;
      pending?: number;
      rejected?: number;
    };
    trades?: any;
  };
}

export async function getGroups() {
  try {
    const headers = await getRequiredHeaders();
    const response = await fetch(`${BASE_URL}${GET_GROUPS}`, {
      method: 'GET',
      headers: headers
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log('Error fetching groups:', error);
    throw new Error('Failed to fetch groups');
  }
}

export async function createGroup(groupData: CreateGroupRequest) {
  try {
    const headers = await getRequiredHeaders();
    const response = await fetch(`${BASE_URL}${CREATE_GROUP}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData)
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log('Error creating group:', error);
    throw new Error('Failed to create group');
  }
}

export async function updateGroup(groupData: UpdateGroupRequest) {
  try {
    const headers = await getRequiredHeaders();
    const response = await fetch(`${BASE_URL}${UPDATE_GROUP}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData)
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log('Error updating group:', error);
    throw new Error('Failed to update group');
  }
}

export async function deleteGroup(groupId: string) {
  try {
    const headers = await getRequiredHeaders();
    const response = await fetch(`${BASE_URL}${DELETE_GROUP}`, {
      method: 'DELETE',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupId })
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log('Error deleting group:', error);
    throw new Error('Failed to delete group');
  }
}

export async function toggleMaster(data: ToggleMasterRequest) {
  try {
    const headers = await getRequiredHeaders();
    const response = await fetch(`${BASE_URL}${TOGGLE_MASTER}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log('Error toggling master status:', error);
    throw new Error('Failed to toggle master status');
  }
}

export async function toggleTrading(data: ToggleTradingRequest) {
  try {
    const headers = await getRequiredHeaders();
    const response = await fetch(`${BASE_URL}${TOGGLE_TRADING}`, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log('Error toggling trading status:', error);
    throw new Error('Failed to toggle trading status');
  }
}

export async function addChildToGroup(groupId: string, childData: ChildAccount) {
  try {
    const headers = await getRequiredHeaders();
    const response = await fetch(`${BASE_URL}${ADD_CHILD}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupId, ...childData })
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log('Error adding child to group:', error);
    throw new Error('Failed to add child to group');
  }
}

export async function removeChildFromGroup(groupId: string, accountId: string) {
  try {
    const headers = await getRequiredHeaders();
    const response = await fetch(`${BASE_URL}${REMOVE_CHILD}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupId, accountId })
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log('Error removing child from group:', error);
    throw new Error('Failed to remove child from group');
  }
}

export async function getGroupChildren(groupId: string) {
  try {
    const headers = await getRequiredHeaders();
    const response = await fetch(`${BASE_URL}${GET_GROUP_CHILDREN}/${groupId}`, {
      method: 'GET',
      headers: headers
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log('Error fetching group children:', error);
    throw new Error('Failed to fetch group children');
  }
} 

export async function squareOffAllByGroup(groupId: string) {
  try {
    const response = await fetch(`${BASE_URL}${SQUARE_OFF_ALL_BY_GROUP}/${groupId}`, {
      method: 'POST',
      headers: await getRequiredHeaders(),
    });

    const json = await response.json();
    return json;
  } catch (error) {
    console.log('Error square off all by group:', error);
    throw new Error('Failed to square off all by group');
  }
}

export async function placeMannulOrder(orderDetails: any){
  try {
    const response = await fetch(`${BASE_URL}${POST_PLACE_MANNUAL_ORDER}`, {
      method: 'POST',
      headers: await getRequiredHeaders(),
      body: JSON.stringify(orderDetails)
    });

    const json = await response.json();
    return json;
  } catch (error) {
    throw new Error('Failed to place mannual order: '+ error);
  }
}
