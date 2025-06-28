import React, { useEffect, useRef, useState } from 'react';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Box,
    alpha,
    CardHeader,
    Stack,
    CircularProgress,
} from '@mui/material';
import { StrategyData } from '../types/strategy';
import moment from 'moment';

interface StrategyWebsocketDataProps {
    isVisible: boolean;
    strategyId: string;
    strategyData: any;
}

const StrategyWebsocketData: React.FC<StrategyWebsocketDataProps> = ({ isVisible, strategyId, strategyData }) => {
    const [wsData, setWsData] = useState<any>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (isVisible && strategyId) {
            const token = localStorage.getItem('authkey');
            if (ws.current) {
                ws.current.close();
            }

            ws.current = new WebSocket(`ws://localhost:5001/ws/strategy?token=${token}&strategy=${strategyId}`);

            ws.current.onopen = () => console.log('Connected to strategy websocket');
            ws.current.onmessage = (event: MessageEvent) => {
                const data = JSON.parse(event.data);
                if (data.type === 'strategy_update') {
                    setWsData(data);
                }
            };
            ws.current.onclose = () => {
                console.log('Disconnected from strategy websocket');
                setWsData(null);
            };
        }

        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [isVisible, strategyId]);

    const priceChangePercent = () => {
        if (!wsData?.data?.tikData?.last_traded_price || !wsData?.data?.supertrend?.previousDayClose) {
            return 0;
        }

        const lastPrice = wsData.data.tikData?.last_traded_price / 100;
        const openPrice = wsData.data.supertrend?.previousDayClose;
        const priceChangePercent =
            typeof openPrice === 'number' &&
            typeof lastPrice === 'number' &&
            openPrice !== 0
                ? +(((lastPrice - openPrice) / openPrice) * 100).toFixed(2)  // “+” turns the string from toFixed into a number
                : null;

        return priceChangePercent !== null ? priceChangePercent : 0;
    };

    if (!isVisible || !wsData?.data?.supertrend) {

        return (
            <Box sx={{
                backgroundColor: (theme) => theme.palette.background.paper,
                borderRadius: 2,
                padding: 2,
                mt: 3,
                textAlign: 'center'
                    }}>
                {isVisible ? (
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                        <CircularProgress size={20} color="primary" />
                        <Typography variant='h6' color='textSecondary'>
                            Waiting for strategy data...
                        </Typography>
                    </Stack>
                ) : (
                    <Typography variant='h6' color='textSecondary'>
                        Select a strategy to view data
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <Box sx={{ 
            backgroundColor: (theme) => theme.palette.background.paper,
            borderRadius: 2,
            padding: 2,
            mt: 3
        }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                    <Typography variant='h4' sx={{
                            color: theme => theme.palette.primary.main,
                            alignItems: 'center',
                            ml: 3,
                            mt: 2,
                        }}>
                            Strategy: {strategyData?.name || ''} 
                        </Typography>
                </Grid>
            </Grid>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 2,
                        border: theme => `1px solid ${theme.palette.divider}`,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme => theme.palette.mode === 'dark' 
                                ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                                : '0 4px 20px rgba(0, 0, 0, 0.1)'
                        }
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{
                                color: theme => theme.palette.primary.main,
                                fontWeight: 600,
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <Box component="span" sx={{
                                    width: 4,
                                    height: 20,
                                    backgroundColor: 'primary.main',
                                    borderRadius: 1,
                                    mr: 1
                                }} />
                                Supertrend Analysis
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                    }}>
                                        <Typography variant="body2" color="textSecondary">Super Trend</Typography>
                                        <Typography variant="h6">{wsData.data.supertrend.superTrend}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{
                                        mt: 0.5,
                                        p: 2,
                                        borderRadius: 1,
                                        backgroundColor: theme => 
                                            wsData.data.supertrend.trend === 'PUT' 
                                                ? alpha(theme.palette.error.main, 0.1)
                                                : alpha(theme.palette.success.main, 0.1),
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <Box>
                                            <Typography variant="body2" color="textSecondary">Trend</Typography>
                                            <Typography variant="h6" sx={{
                                                color: wsData.data.supertrend.trend === 'PUT' ? 'error.main' : 'success.main',
                                                fontWeight: 'bold'
                                            }}>
                                                {wsData.data.supertrend.trend}
                                            </Typography>
                                        </Box>
                                        <Typography sx={{
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 1,
                                            backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                                            fontSize: '0.875rem'
                                        }}>
                                            {wsData.data.supertrend.trendChanged ? 'Changed' : 'Stable'}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ mt: 0.5, ml: 0.8 }}>
                                        <Typography variant="body2" color="textSecondary">Previous Close</Typography>
                                        <Typography variant="h6">{wsData.data.supertrend.previousClose}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="textSecondary">Current Close</Typography>
                                        <Typography variant="h6">{wsData.data.supertrend.currentClose}</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={4}>
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="textSecondary">Last Update</Typography>
                                        <Typography variant="h6">{moment(wsData.data.supertrend.timestamp).format("DD-MM-YYYY hh:mm A")}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 2,
                        border: theme => `1px solid ${theme.palette.divider}`,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme => theme.palette.mode === 'dark' 
                                ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                                : '0 4px 20px rgba(0, 0, 0, 0.1)'
                        }
                    }}>
                        <CardContent>
                            <Typography variant="h6" sx={{
                                color: theme => theme.palette.primary.main,
                                fontWeight: 600,
                                mb: 2,
                                height: 50,
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <Box component="span" sx={{
                                    width: 4,
                                    height: 20,
                                    backgroundColor: 'primary.main',
                                    borderRadius: 1,
                                    mr: 1
                                }} />
                                Market Data
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Box sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                    }}>
                                        <Typography variant="body2" color="textSecondary">Last Price</Typography>
                                        <Typography variant="h6">
                                            {(wsData.data.tikData?.last_traded_price) / 100 || 'N/A'}
                                            {priceChangePercent() !== null && (
                                                <Typography
                                                component="span"
                                                variant="body2"
                                                color={priceChangePercent() >= 0 ? 'success.main' : 'error.main'}
                                                sx={{ ml: 1 }}
                                                >
                                                ({priceChangePercent()}%)
                                                </Typography>
                                            )}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{
                                        mt: 0.5,
                                        p: 2,
                                        borderRadius: 1,
                                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                    }}>
                                        <Typography variant="body2" color="textSecondary" gutterBottom>Day Range</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="error.main">Low: {(wsData.data.tikData?.low_price_day)/100 || 'N/A'}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="success.main">High: {(wsData.data.tikData?.high_price_day)/100 || 'N/A'}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={12}>
                    <Card elevation={0} sx={{
                        backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 2,
                        border: theme => `1px solid ${theme.palette.divider}`,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme => theme.palette.mode === 'dark' 
                                ? '0 4px 20px rgba(0, 0, 0, 0.5)'
                                : '0 4px 20px rgba(0, 0, 0, 0.1)'
                        }
                    }}>
                        <CardContent>
                             <Typography variant="h6" sx={{
                                color: theme => theme.palette.primary.main,
                                fontWeight: 600,
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <Box component="span" sx={{
                                    width: 4,
                                    height: 20,
                                    backgroundColor: 'primary.main',
                                    borderRadius: 1,
                                    mr: 1
                                }} />
                                Strategy Parameters
                            </Typography>
                            <Grid container spacing={2}>
                                {Object.entries(strategyData?.parameters || {}).map(([key, value]:any) => (
                                    <Grid item xs={6} key={key}>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                        }}>
                                            <Typography variant="body2" color="textSecondary">{key}</Typography>
                                            <Typography variant="h6">{typeof value === 'boolean' ? (value ? 'True' : 'False') : value}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StrategyWebsocketData;
