import React, { useState } from "react";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import { Card, CardContent, CardHeader, CircularProgress, Grid, IconButton, Skeleton, TextField } from "@mui/material";
import OrdersTable from "../components/OrdersTable";
import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import clsx from "clsx";
import { DatePicker, LoadingButton } from "@material-ui/lab";
import { ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";
import { FetchOrdersDataService } from "../hooks/bankNiftyServices";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import RefreshIcon from "@mui/icons-material/Refresh";

const BankNiftyOrders = () => {

    const orderDataColumns: GridColDef[] = [
        { field: 'symbol', headerName: 'Symbol', width: 250,align:'left' },
        { field: 'orderType', headerName: 'Order Type', width: 130,headerAlign:'center',align:'center' },
        { field: 'interval', headerName: 'Interval', width: 130,headerAlign:'center',align:'center' },
        {
          field: 'entryPrice',
          headerName: 'Entry Price',
          headerAlign:'center',
          type: 'number',
          align:'center',
          width: 130,
        },
        {
          field: 'stopLoss',
          headerName: 'Stop Loss',
          headerAlign:'center',
          type: 'number',
          align:'center',
          width: 130,
        },
        {
            field: 'target',
            headerName: 'Target',
            headerAlign:'center',
            type: 'number',
            align:'center',
            width: 130,
        },
        // {
        //   field: 'profitAndLoss',
        //   headerName: 'Profit & Loss',
        //   headerAlign:'center',
        //   type: 'number',
        //   align:'center',
        //   width: 130,
        //   cellClassName: (params: GridCellParams<number>) =>
        //   clsx('super-app', {
        //     negative: params.row.profitAndLoss < 0,
        //     positive: params.row.profitAndLoss > 0,
        //   }), 
        //   valueGetter: (params) =>{
        //     return params.row.profitAndLoss.toFixed(2); 
        //   }
        // },
        // {
        //   field: 'netpnl',
        //   headerName: 'Net PnL',
        //   headerAlign:'center',
        //   type: 'number',
        //   align:'center',
        //   width: 130,
        //   cellClassName: (params: GridCellParams<number>) =>
        //   clsx('super-app', {
        //     negative: params.row.netpnl < 0,
        //     positive: params.row.netpnl > 0,
        //   }), 
        //   valueGetter: (params) =>{
        //     return params.row.netpnl.toFixed(2); 
        //   }
        // },
        // {
        //   field: 'charges',
        //   headerName: 'Charges',
        //   headerAlign:'center',
        //   type: 'number',
        //   align:'center',
        //   width: 110,
        //   valueGetter: (params) =>{
        //     return params.row.charges.toFixed(2); 
        //   }
        // },
        // {
        //   field: 'brokerage',
        //   headerName: 'Brokerage',
        //   headerAlign:'center',
        //   type: 'number',
        //   align:'center',
        //   width: 110,
        //   valueGetter: (params) =>{
        //     return params.row.brokerage.toFixed(2); 
        //   }
        // },
        // {
        //   field: 'result',
        //   headerName: 'Result',
        //   headerAlign:'center',
        //   type: 'number',
        //   align:'center',
        //   width: 110,
        // },
        {
          field: 'quantity',
          headerName: 'Quantity',
          headerAlign:'center',
          type: 'number',
          align:'center',
          width: 130,
          valueGetter: (params) =>{
            return params.row.quantity > 0 ? params.row.quantity : '-'; 
          } 
        },
        { 
          field: 'date', 
          headerName: 'Entry Time', 
          headerAlign:'center',
          width: 110,
          align:'left',
          valueGetter: (params) =>{
            const date = new Date(params.row.date);
            let hours = date.getHours();
            let minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? (0 + minutes) : minutes;
            var strTime = hours + ':' + (minutes< 10 ? '0' : '')+minutes + ' ' + ampm;
            return strTime;
          } 
        },
        { 
          field: 'candleTime', 
          headerName: 'Exit Time', 
          headerAlign:'center',
          width: 110,
          align:'left',
          valueGetter: (params) =>{
            const date = new Date(params.row.candleTime);
            let hours = date.getHours();
            let minutes = date.getMinutes();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? (0 + minutes) : minutes;
            var strTime = hours + ':' + (minutes< 10 ? '0' : '')+minutes + ' ' + ampm;
            return strTime;
          }
        }
    ];

    const [dpDate, setDPDate] = useState<Date>(new Date());
    const [isDataFetching, setIsDataFetching] = useState(false);
    const [nextDisable,setNextDisable] = useState<boolean>(false);
    const [ordersData, setOrdersData] = useState<any>();
    const snackbar = useSnackbar();
    
    React.useEffect(() => {
        const fetchData = async () => {
          try {
            setIsDataFetching(true);
            await fetchRecords();
            setIsDataFetching(false);
          } catch (error: any) {
            setIsDataFetching(false);
            snackbar.error(error.message);
          }
        };
    
        fetchData(); 
        const selectedDate = `${dpDate.getDate()}-${dpDate.getMonth()}-${dpDate.getFullYear()}`;
        const currDate = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`;
        if(selectedDate == currDate)
            setNextDisable(true);
          else
          setNextDisable(false);
    }, [dpDate]);

    const fetchRecords = async () => {
        const ordersData = await FetchOrdersDataService(dpDate!);
        setOrdersData(ordersData);
    };

    const saveDate = (date: Date) => {
        setDPDate(date);
    };

    const toggleDate = (action:string) => {
        if(action === 'prev'){
            const newDate = new Date(dpDate.getTime() - 24 * 60 * 60 * 1000);
            setDPDate(newDate);
        }else if(action === 'next'){
            const newDate = new Date(dpDate.getTime() + 24 * 60 * 60 * 1000);
            setDPDate(newDate);
        }
    };

    return(
        <React.Fragment>
          <AdminAppBar>
            <AdminToolbar title={"Bank Orders"}></AdminToolbar>
          </AdminAppBar>
          <Grid container spacing={2}>
            <Grid item sm={6}>
            <DatePicker
                label={"Date"}
                onChange={(date: Date | null) => saveDate(date!)}
                inputFormat="dd/MM/yyyy"
                disableFuture={true}
                shouldDisableDate={(date:any) => date.getDay() === 0 || date.getDay() === 6}
                value={dpDate}
                renderInput={(params: any) => (
                <><IconButton onClick={() => toggleDate('prev')} aria-label="previous" style={{height:'fit-content',width:'fit-content',marginTop:'25px',marginRight:'2px',paddingRight:'0px',borderRadius:'10px'}}>
                    {
                        isDataFetching ? <CircularProgress style={{height:'15px',width:'15px'}}/> : <ArrowBackIos style={{height:'15px',width:'15px'}}/>
                    }
                    </IconButton>
                    <TextField {...params} id="date" margin="normal" name="start"/>
                    <IconButton disabled={nextDisable} onClick={() => toggleDate('next')} aria-label="next" style={{height:'fit-content',width:'fit-content',marginTop:'25px',marginLeft:'0px',paddingLeft:'4px',borderRadius:'10px'}}>
                    {
                        isDataFetching ? <CircularProgress style={{height:'15px',width:'15px'}}/> : <ArrowForwardIos style={{height:'15px',width:'15px'}}/>
                    }
                    </IconButton>
                </>
                )}
            />
            <LoadingButton
                      sx={{
                        marginLeft: "10px",
                        marginTop: "15px",
                        width: "fit-content",
                      }}
                      loading={isDataFetching}
                      onClick={fetchRecords}>
                      <RefreshIcon />
              </LoadingButton>
            </Grid>
            <Grid item sm={12} sx={{ paddingLeft: "20px !important" }}>
                <Card variant="outlined" sx={{ padding: "20px" }}>
                    <CardHeader
                    title={'Orders Data'}
                    sx={{ padding: "5px 24px 0 24px" }}
                    ></CardHeader>
                    <CardContent sx={{ padding: "10px !important" }}>
                    {isDataFetching ? (
                        <Skeleton animation="wave" />
                    ) : (
                        <OrdersTable columns={orderDataColumns} ordersData={ordersData} />
                    )}
                    </CardContent>
                </Card>
            </Grid>
          </Grid>
        </React.Fragment>
    );
}

export default BankNiftyOrders