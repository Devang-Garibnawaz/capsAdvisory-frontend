export interface Orders {
    id: string;
    orderType:string;
    symbol?: string;
    entryPrice: number;
    stopLoss:number;
    profitAndLoss:number;
    result: number;
    candleTime: Date;
    date:Date;
  }