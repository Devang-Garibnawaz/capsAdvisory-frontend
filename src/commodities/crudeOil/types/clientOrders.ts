export interface ClientOrders {
    id: string;
    clientId: string,
    orderData:any,
    orderType:string;
    symbol?: string;
    entryPrice: number;
    stopLoss:number;
    profitAndLoss:number;
    result: number;
    candleTime: Date;
    date:Date;
  }