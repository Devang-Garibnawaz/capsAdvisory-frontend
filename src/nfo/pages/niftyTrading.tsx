import { ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";
import { DatePicker, LoadingButton } from "@material-ui/lab";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import ClientOrdersTable from "../../commodities/crudeOil/components/ClientOrdersTable";
import {
  CancelClientOrdersNiftyService,
  connectWebSocket,
  ExitAllPostions,
  FetchClientOrdersDataNiftyService,
  getNiftyExpiryList,
  getNiftyStrikePriceList,
  postNFOOrderPlace,
} from "../hooks/niftyServices";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";

const NiftyTrading = () => {
  const snackbar = useSnackbar();

  const [expiryDateList, setExpiryDateList] = useState<any>([]);
  const [selectedExpiryOption, setSelectedExpiryOption] = useState("");
  const [strikePriceList, setStrikePriceList] = useState<any>([]);
  const [updatedStrikePriceList, setUpdatedStrikePriceList] = useState<any>([]);
  const [selectedStrikePrice, setSelectedStrikePrice] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("75");
  const [selectedNiftyOption, setSelectedNiftyOption] = useState("");
  const [loading, setIsLoading] = useState(false);
  const [dpDate, setDPDate] = useState<Date>(new Date());
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [nextDisable, setNextDisable] = useState<boolean>(false);
  const [ordersData, setOrdersData] = useState<any>();
  const [simpleTrade, setSimpleTrade] = useState<boolean>(true);
  const [buyingPrice, setBuyingPrice] = useState<number>(0);
  const [stopLoss, setStopLoss] = useState<number>(0);
  const [target, setTarget] = useState<number>(0);

  const orderDataColumns: GridColDef[] = [
    { field: "clientId", headerName: "Client Code", width: 130, align: "left" },
    { field: "symbol", headerName: "Symbol", width: 250, align: "left" },
    {
      field: "orderType",
      headerName: "Order Type",
      width: 130,
      headerAlign: "center",
      align: "center",
    },
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
      field: "quantity",
      headerName: "Quantity",
      headerAlign: "center",
      type: "number",
      align: "center",
      width: 130,
      valueGetter: (params) => {
        return params.row.quantity > 0 ? params.row.quantity : "-";
      },
    },
    {
      field: "date",
      headerName: "Entry Time",
      headerAlign: "center",
      width: 110,
      align: "left",
      valueGetter: (params) => {
        const date = new Date(params.row.date);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        var ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? 0 + minutes : minutes;
        var strTime =
          hours + ":" + (minutes < 10 ? "0" : "") + minutes + " " + ampm;
        return strTime;
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) =>
        !params.row.activeOrder ? (
          "Canceld Order"
        ) : (
          <Button
            sx={{ padding: "1px 6px", borderRadius: "5px" }}
            variant="outlined"
            onClick={() => hancelCancelClick(params.row)}
          >
            Cancel Order
          </Button>
        ),
    },
  ];

  const hancelCancelClick = async (rowData: any) => {
    try {
      const payload = rowData.orderData;
      payload.clientId = rowData.clientId;
      const result = await CancelClientOrdersNiftyService(payload);
      if (result?.status) {
        snackbar.success("Order Canceled");
        fetchRecords();
      } else {
        snackbar.error(result?.message);
      }
      console.log(result);
    } catch (error: any) {
      snackbar.error("Something went wrong: " + error?.message);
    }
  };

  const sortExpiryDate = (dateString: string): Date => {
    const day = parseInt(dateString.substr(0, 2), 10);
    const month = dateString.substr(2, 3);
    const year = parseInt(dateString.substr(5, 4), 10);

    // Convert month abbreviation to a number
    const monthIndex: { [key: string]: number } = {
      JAN: 0,
      FEB: 1,
      MAR: 2,
      APR: 3,
      MAY: 4,
      JUN: 5,
      JUL: 6,
      AUG: 7,
      SEP: 8,
      OCT: 9,
      NOV: 10,
      DEC: 11,
    };

    return new Date(year, monthIndex[month], day);
  };

  const fetchRecords = async () => {
    const ordersData = await FetchClientOrdersDataNiftyService(dpDate!);
    setOrdersData(ordersData);
  };

  useEffect(() => {
    fetchRecords();
    const selectedDate = `${dpDate.getDate()}-${dpDate.getMonth()}-${dpDate.getFullYear()}`;
    const currDate = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`;
    if (selectedDate == currDate) setNextDisable(true);
    else setNextDisable(false);
  }, [dpDate]);

  useEffect(() => {
    fetchExpiryDates();
  }, []);

  const fetchExpiryDates = async () => {
    const expiryList = await getNiftyExpiryList();
    if (expiryList) {
      const sortedDates = [...expiryList].sort((a, b) => {
        const format = (dateStr: string): number => {
            const date = new Date(dateStr.replace(/-/g, ' '));
            return date.getTime(); // Convert Date to number (timestamp)
        };
        return format(a) - format(b);
      });
      setExpiryDateList(sortedDates);
    }
  };

  const onExpiryChange = async (event: any) => {
    const expiryDate = event.target.value;
    if (event.target.value) {
      const strikePriceData = await getNiftyStrikePriceList(expiryDate);
      const sortedData = strikePriceData.sort((a: any, b: any) => {
        if (a.symbol < b.symbol) {
          return -1; // a comes before b
        }
        if (a.symbol > b.symbol) {
          return 1; // a comes after b
        }
        return 0; // a and b are equal
      });
      setSelectedStrikePrice("");
      setSelectedNiftyOption("");
      setStrikePriceList(sortedData);
    }
    setSelectedExpiryOption(event.target.value);
  };

  const placeOrder = async () => {
    setIsLoading(true);
    if (!selectedExpiryOption) {
      snackbar.error("Please select expiry date!");
      setIsLoading(false);
      return;
    }
    if (!selectedStrikePrice) {
      snackbar.error("Please select strike price!");
      setIsLoading(false);
      return;
    }

    if (!selectedNiftyOption) {
      snackbar.error("Please select nifty option BUY or SELL!");
      setIsLoading(false);
      return;
    }

    if (!buyingPrice) {
      snackbar.error("Please enter buying price!");
      setIsLoading(false);
      return;
    }

    if (!stopLoss) {
      snackbar.error("Please enter stop loss!");
      setIsLoading(false);
      return;
    }

    if (!target) {
      snackbar.error("Please enter stoploss!");
      setIsLoading(false);
      return;
    }

    const symbolToken = selectedStrikePrice.split("*")[0];
    const symbol = selectedStrikePrice.split("*")[1];
    try {
      const result = await postNFOOrderPlace(
        symbolToken,
        Number(selectedQuantity),
        buyingPrice,
        target,
        stopLoss,
        selectedExpiryOption,
        selectedNiftyOption,
        simpleTrade,
        symbol
      );
      if (result.status) {
        snackbar.success(result.message);
        setTimeout(() => {
          fetchRecords();
        }, 100);
      } else {
        snackbar.error(result.message);
      }
    } catch (error) {
      snackbar.error(JSON.stringify(error));
    } finally {
      setIsLoading(false);
    }
  };

  const saveDate = (date: Date) => {
    setDPDate(date);
  };

  const toggleDate = (action: string) => {
    if (action === "prev") {
      const newDate = new Date(dpDate.getTime() - 24 * 60 * 60 * 1000);
      setDPDate(newDate);
    } else if (action === "next") {
      const newDate = new Date(dpDate.getTime() + 24 * 60 * 60 * 1000);
      setDPDate(newDate);
    }
  };

  const onNiftyOptionSelectionChange = (value: string) => {
    setSelectedNiftyOption(value);
    setSelectedStrikePrice("");
    let filteredStrikePriceList = [];
    if (value === "call") {
      filteredStrikePriceList = strikePriceList.filter(
        (item: any) => item.symbol.endsWith("CE")
      );
    }
    if (value === "put") {
      filteredStrikePriceList = strikePriceList.filter(
        (item: any) => item.symbol.endsWith("PE")
      );
    }
    setUpdatedStrikePriceList(filteredStrikePriceList);
  };

  const exitPosition = async () => {
    try {
      const result = await ExitAllPostions();
      if (result.status) {
        snackbar.success(result.message);
        fetchRecords();
      } else {
        snackbar.error(result.message);
      }
    } catch (error) {
      snackbar.error(JSON.stringify(error));
    }
  };

  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"NIFTY Trading"}>
          <FormControlLabel
            control={
              <Switch
                defaultChecked={true}
                onChange={(event) => setSimpleTrade(event.target.checked)}
              />
            }
            label="Simple Nifty Order"
          />
        </AdminToolbar>
      </AdminAppBar>
      <Grid container spacing={4}>
        <Grid item sm={12} sx={{ display: "content" }}>
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
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </TextField>

          {selectedExpiryOption && (
            <TextField
              sx={{
                marginLeft: "10px",
                marginTop: "15px",
                height: "fit-content",
                width: "150px",
              }}
              margin="normal"
              fullWidth
              label={"NIFTY Future"}
              name="BUY/SELL"
              select
              title={"NIFTY Fut BUY/SELL"}
              value={selectedNiftyOption}
              onChange={(e: any) =>
                onNiftyOptionSelectionChange(e.target.value)
              }
            >
              <MenuItem selected={true} value={""}>
                Select
              </MenuItem>
              <MenuItem value={"call"}>NIFTY CALL</MenuItem>
              <MenuItem value={"put"}>NIFTY PUT</MenuItem>
            </TextField>
          )}
          {selectedExpiryOption && selectedNiftyOption && (
            <TextField
              sx={{
                marginLeft: "10px",
                marginTop: "15px",
                height: "fit-content",
                width: "250px",
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
              {updatedStrikePriceList.map((item: any) => (
                <MenuItem
                  key={item.token}
                  value={item.token + "*" + item.symbol}
                >
                  {item.symbol}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Grid>

        <Grid item sm={12} sx={{ display: "content" }}>
          <TextField
            sx={{
              marginLeft: "10px",
              marginTop: "5px",
              height: "fit-content",
              width: "100px",
            }}
            margin="normal"
            fullWidth
            label={"Enter Quantity"}
            name="quantity"
            select
            title={"1 Lot size 75 QTY"}
            value={selectedQuantity}
            onChange={(e: any) => setSelectedQuantity(e.target.value)}
          >
            <MenuItem value={"75"}>1</MenuItem>
            <MenuItem value={"150"}>2</MenuItem>
            <MenuItem value={"225"}>3</MenuItem>
            <MenuItem value={"300"}>4</MenuItem>
            <MenuItem value={"375"}>5</MenuItem>
          </TextField>
          <TextField
            sx={{
              marginLeft: "10px",
              marginTop: "5px",
              height: "fit-content",
              width: "200px",
            }}
            margin="normal"
            fullWidth
            label={"Enter Buying At"}
            name="buyingAt"
            value={buyingPrice}
            onChange={(e: any) => setBuyingPrice(e.target.value)}
            inputProps={{
              step: 1,
              min: 0,
              type: "number",
            }}
          />
          <TextField
            sx={{
              marginLeft: "10px",
              marginTop: "5px",
              height: "fit-content",
              width: "200px",
            }}
            margin="normal"
            fullWidth
            label={"Enter Target"}
            name="target"
            value={target}
            onChange={(e: any) => setTarget(e.target.value)}
            inputProps={{
              step: 1,
              min: 0,
              type: "number",
            }}
          />
          <TextField
            sx={{
              marginLeft: "10px",
              marginTop: "5px",
              height: "fit-content",
              width: "200px",
            }}
            margin="normal"
            fullWidth
            label={"Enter Stoploss"}
            name="stoploss"
            value={stopLoss}
            onChange={(e: any) => setStopLoss(e.target.value)}
            inputProps={{
              step: 1,
              min: 0,
              type: "number",
            }}
          />

          <LoadingButton
            loading={loading}
            sx={{
              marginLeft: "10px",
              marginTop: "5px",
              height: "fit-content",
            }}
            variant="outlined"
            onClick={placeOrder}
          >
            Place Order
          </LoadingButton>
          <Button
            sx={{
              marginLeft: "10px",
              marginTop: "5px",
              height: "fit-content",
            }}
            variant="outlined"
            onClick={() => {}}
          >
            Cancel
          </Button>
        </Grid>

        <Grid item sm={8} sx={{ display: "content" }}>
          <DatePicker
            label={"Date"}
            onChange={(date: Date | null) => saveDate(date!)}
            inputFormat="dd/MM/yyyy"
            disableFuture={true}
            shouldDisableDate={(date: any) =>
              date.getDay() === 0 || date.getDay() === 6
            }
            value={dpDate}
            renderInput={(params: any) => (
              <>
                <IconButton
                  onClick={() => toggleDate("prev")}
                  aria-label="previous"
                  style={{
                    height: "fit-content",
                    width: "fit-content",
                    marginTop: "25px",
                    marginRight: "2px",
                    paddingRight: "0px",
                    borderRadius: "10px",
                  }}
                >
                  {isDataFetching ? (
                    <CircularProgress
                      style={{ height: "15px", width: "15px" }}
                    />
                  ) : (
                    <ArrowBackIos style={{ height: "15px", width: "15px" }} />
                  )}
                </IconButton>
                <TextField {...params} id="date" margin="normal" name="start" />
                <IconButton
                  disabled={nextDisable}
                  onClick={() => toggleDate("next")}
                  aria-label="next"
                  style={{
                    height: "fit-content",
                    width: "fit-content",
                    marginTop: "25px",
                    marginLeft: "0px",
                    paddingLeft: "4px",
                    borderRadius: "10px",
                  }}
                >
                  {isDataFetching ? (
                    <CircularProgress
                      style={{ height: "15px", width: "15px" }}
                    />
                  ) : (
                    <ArrowForwardIos
                      style={{ height: "15px", width: "15px" }}
                    />
                  )}
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
            onClick={fetchRecords}
          >
            <RefreshIcon />
          </LoadingButton>
          {/* <LoadingButton
                  loading={loading}
                  sx={{
                    marginLeft: "10px",
                    marginTop: "15px",
                    height: "fit-content",
                  }}
                  variant="outlined"
                  onClick={connectWebSocket}
                >
                  Connect Web Socket
              </LoadingButton> */}
        </Grid>
        <Grid container spacing={2}>
          <Grid item sm={12} sx={{ paddingLeft: "20px !important" }}>
            <Card variant="outlined" sx={{ padding: "20px" }}>
              <CardHeader
                title={
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <span>Client Orders:</span>
                    <Button
                      sx={{ padding: "3px 6px", borderRadius: "5px" }}
                      variant="outlined"
                      disabled={
                        ordersData && ordersData.length > 0 ? false : true
                      }
                      onClick={exitPosition}
                    >
                      Exit Position All
                    </Button>
                  </Box>
                }
                sx={{ padding: "5px 24px 0 24px" }}
              ></CardHeader>
              <CardContent>
                <ClientOrdersTable
                  ordersData={ordersData}
                  columns={orderDataColumns}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default NiftyTrading;
