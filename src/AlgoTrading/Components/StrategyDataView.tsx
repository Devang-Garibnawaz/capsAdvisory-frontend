import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  alpha,
} from '@mui/material';

interface StrategyDataViewProps {
  data: any;
}

export const StrategyDataView: React.FC<StrategyDataViewProps> = ({ data }) => {
  if (!data?.data?.supertrend) return null;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.9)",
            borderRadius: 2,
            border: (theme) =>
              `1px solid ${theme.palette.divider}`,
            transition:
              "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 4px 20px rgba(0, 0, 0, 0.5)"
                  : "0 4px 20px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: (theme) =>
                  theme.palette.primary.main,
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 4,
                  height: 20,
                  backgroundColor: "primary.main",
                  borderRadius: 1,
                  mr: 1,
                }}
              />
              Supertrend Analysis
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: (theme) =>
                      data.data.supertrend.trend === "PUT"
                        ? alpha(theme.palette.error.main, 0.1)
                        : alpha(theme.palette.success.main, 0.1),
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Trend
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        color: data.data.supertrend.trend === "PUT"
                          ? "error.main"
                          : "success.main",
                        fontWeight: "bold",
                      }}
                    >
                      {data.data.supertrend.trend}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      backgroundColor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.05)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {data.data.supertrend.trendChanged
                      ? "Changed"
                      : "Stable"}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Previous Close
                  </Typography>
                  <Typography variant="h6">
                    {data.data.supertrend.previousClose}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    Current Close
                  </Typography>
                  <Typography variant="h6">
                    {data.data.supertrend.currentClose}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card
          elevation={0}
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.05)"
                : "rgba(255, 255, 255, 0.9)",
            borderRadius: 2,
            border: (theme) =>
              `1px solid ${theme.palette.divider}`,
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 4px 20px rgba(0, 0, 0, 0.5)"
                  : "0 4px 20px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: (theme) => theme.palette.primary.main,
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 4,
                  height: 20,
                  backgroundColor: "primary.main",
                  borderRadius: 1,
                  mr: 1,
                }}
              />
              Market Data
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                    mb: 2,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Symbol
                      </Typography>
                      <Typography variant="h6">
                        {data.data.symbol}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Exchange
                      </Typography>
                      <Typography variant="h6">
                        {data.data.exchange}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Last Price
                  </Typography>
                  <Typography variant="h6">
                    {(Number(data.data.tikData.last_traded_price) / 100).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <Typography variant="body2" color="textSecondary">
                    Open
                  </Typography>
                  <Typography variant="h6">
                    {(Number(data.data.tikData.open_price_day) / 100).toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.02)",
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        High Of The Day
                      </Typography>
                      <Typography variant="subtitle1" color="success.main">
                        {(Number(data.data.tikData.high_price_day) / 100).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Low Of The Day
                      </Typography>
                      <Typography variant="subtitle1" color="error.main">
                        {(Number(data.data.tikData.low_price_day) / 100).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Close Of The Day
                      </Typography>
                      <Typography variant="subtitle1">
                        {(Number(data.data.tikData.close_price) / 100).toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
