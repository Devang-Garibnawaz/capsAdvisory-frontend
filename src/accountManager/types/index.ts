export interface BrokerAccount {
  id: string;
  name: string;
  isMaster?: boolean;
}

export interface GroupStats {
  orders: number;
  qty: number;
  child: number;
  totalChild: number;
  pending: number;
  completed: number;
  rejected: number;
  cancelled: number;
  failed: number;
} 