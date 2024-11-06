
import React, { useState, useRef, useEffect } from "react";
import AdminAppBar from "../../../admin/components/AdminAppBar";
import AdminToolbar from "../../../admin/components/AdminToolbar";
import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Grid, IconButton, MenuItem, TextField } from "@material-ui/core";
import { useSnackbar } from "../../../core/contexts/SnackbarProvider";
import { CancelClientOrdersService, FetchClientOrdersDataService, getExpiryList, getStrikePriceList, postOrderPlace } from "../hooks/crudeoilServices";
import ClientOrdersTable from "../components/ClientOrdersTable";
import { GridColDef } from "@mui/x-data-grid";
import { DatePicker, LoadingButton } from "@material-ui/lab";
import { ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";
import RefreshIcon from "@mui/icons-material/Refresh";

const CrudeOilTrading = () => {

  const snackbar = useSnackbar();
  const [expiryDateList, setExpiryDateList] = useState<any>([]);
  const [strikePriceList, setStrikePriceList] = useState<any>([]);
  const [selectedExpiryOption, setSelectedExpiryOption] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState('100');
  const [buyingAt, setBuyingAt] = useState('0');
  const [stoplossPrice, setStoplossPrice] = useState('0');
  const [targetPrice, setTargetPrice] = useState('0');
  const [loading, setIsLoading] = useState(false);
  const [selectedStrikePrice, setSelectedStrikePrice] = useState('');
  const [ordersData, setOrdersData] = useState<any>();
  const [dpDate, setDPDate] = useState<Date>(new Date());
  const [nextDisable,setNextDisable] = useState<boolean>(false);
  const [isDataFetching, setIsDataFetching] = useState(false);

  const orderDataColumns: GridColDef[] = [
    { field: 'symbol', headerName: 'Symbol', width: 250, align: 'center' },
    { field: 'clientId', headerName: 'Client Code', width: 130, align: 'center' },
    { field: 'orderType', headerName: 'Order Type', width: 130, headerAlign: 'center', align: 'center' },
    // { field: 'interval', headerName: 'Interval', width: 130, headerAlign: 'center', align: 'center' },
    {
      field: 'entryPrice',
      headerName: 'Entry Price',
      headerAlign: 'center',
      type: 'number',
      align: 'center',
      width: 130,
    },
    {
      field: 'stopLoss',
      headerName: 'Stop Loss',
      headerAlign: 'center',
      type: 'number',
      align: 'center',
      width: 130,
    },
    {
      field: 'target',
      headerName: 'Target',
      headerAlign: 'center',
      type: 'number',
      align: 'center',
      width: 130,
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      headerAlign: 'center',
      type: 'number',
      align: 'center',
      width: 130,
      valueGetter: (params) => {
        return params.row.quantity > 0 ? params.row.quantity : '-';
      }
    },
    {
      field: 'date',
      headerName: 'Entry Time',
      headerAlign: 'center',
      width: 110,
      align: 'left',
      valueGetter: (params) => {
        const date = new Date(params.row.date);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? (0 + minutes) : minutes;
        var strTime = hours + ':' + (minutes < 10 ? '0' : '') + minutes + ' ' + ampm;
        return strTime;
      }
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      renderCell: (params) => (
        params.row.cancelOrder ? 'Canceld Order' :
        <Button 
          sx={{padding:"1px 6px", borderRadius:"5px"}}
          variant="outlined" 
          onClick={() => hancelCancelClick(params.row)}
        >
          Cancel Order
        </Button>
      )
    },

  ];

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

  const onExpiryChange = async (event: any) => {
    const expiryDate = event.target.value;
    if (event.target.value) {
      const strikePriceData = await getStrikePriceList(expiryDate);
      const sortedData = strikePriceData.sort((a: any, b: any) => {
        if (a.symbol < b.symbol) {
          return -1; // a comes before b
        }
        if (a.symbol > b.symbol) {
          return 1; // a comes after b
        }
        return 0; // a and b are equal
      });
      setStrikePriceList(sortedData);
    }
    setSelectedExpiryOption(event.target.value);
  }

  const fetchExpiryDates = async () => {
    const expiryList = await getExpiryList();
    if (expiryList) {
      const sortedDates = [...expiryList].sort((a, b) => sortExpiryDate(a).getTime() - sortExpiryDate(b).getTime());
      setExpiryDateList(sortedDates);
    }
  }

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

  const fetchRecords = async () => {
    const ordersData = await FetchClientOrdersDataService(dpDate!);
    setOrdersData(ordersData);
  };

  const sortExpiryDate = (dateString: string): Date => {
    const day = parseInt(dateString.substr(0, 2), 10);
    const month = dateString.substr(2, 3);
    const year = parseInt(dateString.substr(5, 4), 10);

    // Convert month abbreviation to a number
    const monthIndex: { [key: string]: number } = {
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3,
      'MAY': 4, 'JUN': 5, 'JUL': 6, 'AUG': 7,
      'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };

    return new Date(year, monthIndex[month], day);
  };

  useEffect(() => {
    fetchExpiryDates();
  }, []);

  const placeOrder = async () => {
    setIsLoading(true);
    if (!selectedExpiryOption) {
      snackbar.error('Please select expiry date!');
      setIsLoading(false);
      return;
    }
    if (!selectedStrikePrice) {
      snackbar.error('Please select strike price!');
      setIsLoading(false);
      return;
    }
    if (Number(buyingAt) <= 0) {
      snackbar.error('Please enter buying price!');
      setIsLoading(false);
      return;
    }
    if (Number(targetPrice) <= 0) {
      snackbar.error('Please enter target price!');
      setIsLoading(false);
      return;
    }
    if (Number(stoplossPrice) <= 0) {
      snackbar.error('Please enter stoploss price!');
      setIsLoading(false);
      return;
    }

    const result = await postOrderPlace(selectedStrikePrice, Number(selectedQuantity), Number(buyingAt), Number(targetPrice), Number(stoplossPrice), selectedExpiryOption);
    if (result.status) {
      snackbar.success(result.message);
      fetchRecords();
    } else {
      snackbar.error(result.message);
    }
    setIsLoading(false);
  }

  const hancelCancelClick = async (rowData:any) => {
    try {
      const payload = rowData.orderData;
      payload.clientId = rowData.clientId;
      const result = await CancelClientOrdersService(payload);
      if(result?.status){
        snackbar.success("Order Canceled");
        fetchRecords();
      }else{
        snackbar.error(result?.message);
      }
      console.log(result)
    } catch (error:any) {
      snackbar.error("Something went wrong: "+error?.message);
    }
  };
  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Crude Oil"}></AdminToolbar>
      </AdminAppBar>
      <Grid container spacing={4}>
        <Grid item sm={8} sx={{ display: "content" }}>
          <TextField
            sx={{
              marginLeft: "10px",
              marginTop: "15px",
              height: "fit-content",
              width: "150px",
            }}
            margin="normal"
            fullWidth
            select
            label={"Select Expiry"}
            name="expiry"
            value={selectedExpiryOption}
            onChange={onExpiryChange}
          >
            <MenuItem value={""}>None</MenuItem>
            {expiryDateList.map((item: any) => (
              <MenuItem key={item} value={item}>{item}</MenuItem>
            ))}

          </TextField>
          {selectedExpiryOption &&
            <TextField
              sx={{
                marginLeft: "10px",
                marginTop: "15px",
                height: "fit-content",
                width: "300px",
              }}
              margin="normal"
              fullWidth
              select
              label={"Select Strike Price"}
              name="interval"
              value={selectedStrikePrice}
              onChange={(e: any) => setSelectedStrikePrice(e.target.value)}
            >
              <MenuItem value={""}>None</MenuItem>
              {strikePriceList.map((item: any) => (
                <MenuItem key={item.token} value={item.token}>{item.symbol.replace(/(\d{2}[A-Z]{3}\d{2})/, '$1 - ')}</MenuItem>
              ))}
            </TextField>
          }
          <TextField
            sx={{
              marginLeft: "10px",
              marginTop: "15px",
              height: "fit-content",
              width: "150px",
            }}
            margin="normal"
            fullWidth
            label={"Enter Quantity"}
            name="quantity"
            select
            title={'1 Lot size 100 BBL'}
            value={selectedQuantity}
            onChange={(e: any) => setSelectedQuantity(e.target.value)}
          >
            <MenuItem value={"100"}>1</MenuItem>
            <MenuItem value={"200"}>2</MenuItem>
            <MenuItem value={"300"}>3</MenuItem>
            <MenuItem value={"400"}>4</MenuItem>
            <MenuItem value={"500"}>5</MenuItem>
          </TextField>
        </Grid>
        <Grid item sm={12} sx={{ display: "content" }}>
          <TextField
            sx={{
              marginLeft: "10px",
              marginTop: "15px",
              height: "fit-content",
              width: "200px",
            }}
            margin="normal"
            fullWidth
            label={"Enter Buying At"}
            name="buyingAt"
            value={buyingAt}
            onChange={(e: any) => setBuyingAt(e.target.value)}
            inputProps={{
              step: 1,
              min: 0,
              type: 'number',
            }}
          />
          <TextField
            sx={{
              marginLeft: "10px",
              marginTop: "15px",
              height: "fit-content",
              width: "200px",
            }}
            margin="normal"
            fullWidth
            label={"Enter Target"}
            name="target"
            value={targetPrice}
            onChange={(e: any) => setTargetPrice(e.target.value)}
            inputProps={{
              step: 1,
              min: 0,
              type: 'number',
            }}
          />
          <TextField
            sx={{
              marginLeft: "10px",
              marginTop: "15px",
              height: "fit-content",
              width: "200px",
            }}
            margin="normal"
            fullWidth
            label={"Enter Stoploss"}
            name="stoploss"
            value={stoplossPrice}
            onChange={(e: any) => setStoplossPrice(e.target.value)}
            inputProps={{
              step: 1,
              min: 0,
              type: 'number',
            }}
          />

          <LoadingButton
            loading={loading}
            sx={{
              marginLeft: "10px",
              marginTop: "15px",
              height: "fit-content",
            }}
            variant="outlined"
            onClick={placeOrder}
          >
            Buy
          </LoadingButton>
          <Button
            sx={{
              marginLeft: "10px",
              marginTop: "15px",
              height: "fit-content",
            }}
            variant="outlined"
            onClick={() => { }}>Cancel</Button>
        </Grid>
        <Grid item sm={6} sx={{display: "content"}}>
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
        <Grid container spacing={2}>
          <Grid item sm={12} sx={{ paddingLeft: "20px !important" }}>
          
            <Card variant="outlined" sx={{ padding: "20px" }}>
              <CardHeader
                title={
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span>Client Orders:</span>
                    <Button 
                      sx={{ padding: "3px 6px", borderRadius: "5px" }} 
                      variant="outlined"
                      disabled={true}
                    >
                      Cancel All
                    </Button>
                  </Box>
                }
                sx={{ padding: "5px 24px 0 24px" }}
              >
              </CardHeader>
              <CardContent>
                <ClientOrdersTable ordersData={ordersData} columns={orderDataColumns} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default CrudeOilTrading;