import React, { useEffect, useState } from "react";

const LiveMarketData = () => {
    const [marketData, setMarketData] = useState<{ index: number; last_traded_price: number; exchange_timestamp: string, token: string }[]>([]);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5000");

        ws.onmessage = (event) => {
            let data = JSON.parse(event.data);
            setMarketData((prevData) => {
                const dt = new Date(Number(data.exchange_timestamp)).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
                const updatedData = prevData.filter((item:any) => item.index !== data.index);
                return [...updatedData, data];
            });
        };

        ws.onclose = () => console.log("WebSocket disconnected");

        return () => ws.close();
    }, []);

    return (
        <div>
            <h2>Live Market Data</h2>
            {marketData.map((item) => (
                <div key={item.index}>
                    <strong>{item.token}</strong>: {item.last_traded_price/100} at {new Date(item.exchange_timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </div>
            ))}
        </div>
    );
};

export default LiveMarketData;
