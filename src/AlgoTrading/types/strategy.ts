export interface IndicatorParameter {
    name: string;
    label: string;
    type: string;
    default: number;
    min?: number;
    max?: number;
    step?: number;
    description: string;
}

export interface Indicator {
    name: string;
    description: string;
    parameters: IndicatorParameter[];
}

export interface IndicatorsResponse {
    status: boolean;
    message: string;
    indicators: {
        [key: string]: Indicator;
    };
}

export interface StrategyData {
    name: string;
    description: string;
    indicator: string;
    parameters: Record<string, number | null>;
}

export interface Strategy extends StrategyData {
    id: string;
    createdAt: string;
    isActive: boolean;
    parameters: Record<string, number | null>;
    indicator: string;
    created_time: string;
    modified_time: string;
}

export interface StrategyWsData {
    type: string;
    superTrend: any;
    symbol: string;
    exchange: string;
    interval: string;
    tikData: any;
    timestamp: number;
}
