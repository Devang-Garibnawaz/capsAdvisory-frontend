export interface StrategyWsData {
    type: string;
    data: {
        supertrend: {
            upperBand: string;
            lowerBand: string;
            superTrend: string;
            trend: "PUT" | "CALL";
            trendChanged: boolean;
            previousClose: string;
            currentClose: string;
            timestamp: string;
            period: number;
            multiplier: number;
            totalCandles: number;
        };
        symbol: string;
        exchange: string;
        interval: string;
        tikData: {
            subscription_mode: string;
            exchange_type: string;
            token: string;
            sequence_number: string;
            exchange_timestamp: string;
            last_traded_price: string;
            last_traded_quantity: string;
            avg_traded_price: string;
            vol_traded: string;
            total_buy_quantity: string;
            total_sell_quantity: string;
            open_price_day: string;
            high_price_day: string;
            low_price_day: string;
            close_price: string;
            last_traded_timestamp: string;
            open_interest: string;
            open_interest_change: string;
            upper_circuit: string;
            lower_circuit: string;
            fiftytwo_week_high: string;
            fiftytwo_week_low: string;
            best_5_buy_data: Array<{
                flag: string;
                quantity: string;
                price: string;
                no_of_orders: string;
            }>;
            best_5_sell_data: Array<{
                flag: string;
                quantity: string;
                price: string;
                no_of_orders: string;
            }>;
        };
        timestamp: number;
    };
}
