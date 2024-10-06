
import React, { useState, useRef, useEffect } from "react";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import { Button, Card, CardContent, CardHeader, Grid, MenuItem, TextField } from "@material-ui/core";
import { getBankNiftyExpiryList, getFRVPCount, getSymbolTokenList } from "../hooks/bankNiftyServices";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import { SymbolTokens } from "../types/symbolTokens";
import { formatDate,formatTime, formatExpiryDate } from "../helper/formatDateHelper";
import SearchIcon from "@mui/icons-material/Search";
import { LoadingButton, TimePicker } from "@material-ui/lab";
import FRVPPivotTable from "../components/FRVPPivotTable";
import {LocalizationProvider, DatePicker} from "@material-ui/lab";
import AdapterDateFns from "@material-ui/lab/AdapterDateFns";

const BankNiftyTrading = () =>{

    const snackbar = useSnackbar();
    const [symbolTokenList, setSymbolTokenList] = useState<any>([]);
    const [selectedMarketOption, setSelectedMarketOption] = useState('');
    const [expiryDateList, setExpiryDateList] = useState<any>([]);
    const [selectedExpiryOption, setSelectedExpiryOption] = useState('');

    const [filteredSymbolTokenList, setFilteredSymbolTokenList] = useState<any>([]);
    const [selectedOption, setSelectedOption] = useState('');
    const [frvpData, setFRVPData] = useState([]);
    const [loading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedFromTime, setSelectedFromTime] = useState(new Date(0, 0, 0, 9, 15));
    const [selectedToTime, setSelectedToTime] = useState(new Date(0, 0, 0, 9, 25));
    const [selectedInterval, setSelectedInterval] = useState('');

    const fetchSymbolTokens = async () => {
      try {
          const lsSymbolTokenList = JSON.parse(localStorage.getItem('symbolTokenList')!);
          const symbolTokenList = lsSymbolTokenList ? lsSymbolTokenList : await getSymbolTokenList();
          setSymbolTokenList(symbolTokenList);
          localStorage.setItem('symbolTokenList',JSON.stringify(symbolTokenList));
          console.log(symbolTokenList.find((item:any) => item.tradingsymbol.includes('FUT')));
          setFilteredSymbolTokenList(symbolTokenList.filter((record:any) => record.tradingsymbol.endsWith("FUT")));
      } catch (error: any) {
        snackbar.error(error.message);
      }
    };

    const fetchExpiryDates = async() =>{
      const expiryList = await getBankNiftyExpiryList();
      setExpiryDateList(expiryList);
    } 

    useEffect(()=>{
      fetchSymbolTokens();
    },[]);

    useEffect(()=>{
      try {
        if(selectedMarketOption === 'FUT'){
          setFilteredSymbolTokenList([]);
          setFilteredSymbolTokenList(symbolTokenList.filter((record:any) => record.tradingsymbol.endsWith("FUT")));
        }
        else if(selectedMarketOption === 'STRIKE'){
          fetchExpiryDates();
        }  
      } catch (error:any) {
        snackbar.error(error.message);
      }
      
    },[selectedMarketOption]);

    const onExpiryChange=(event:any)=>{
      const expiryDate = event.target.value;
      const targetDate = formatExpiryDate(expiryDate);
      const filteredRecords = symbolTokenList.filter((record:any) => record.tradingsymbol.includes(`BANKNIFTY${targetDate}`));
      setSelectedExpiryOption(event.target.value);
      console.log(filteredRecords);
      setFilteredSymbolTokenList(filteredRecords);
    }

    const onFRVPsearch = async () =>{
      try {
        setIsLoading(true);
        const fromDate:string = `${formatDate(selectedDate.toDateString())} ${formatTime(selectedFromTime.toString())}`;
        const toDate:string = `${formatDate(selectedDate.toDateString())} ${formatTime(selectedToTime.toString())}`;
        const result = await getFRVPCount(fromDate, toDate, selectedInterval,selectedOption);
        setFRVPData(result);
      } catch (error:any) {
        snackbar.error(error.message);
      }finally{
        setIsLoading(false);
      }
    }

  return(
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Bank Nifty"}></AdminToolbar>
      </AdminAppBar>
      <Grid container spacing={2}>
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
            label={"Select Market"}
            name="bankNiftyF&O"
            value={selectedMarketOption}
            onChange={(e:any) => setSelectedMarketOption(e.target.value)}
          >
            <MenuItem value={""}>None</MenuItem>
            <MenuItem key={"FUT"} value={'FUT'}>Futures</MenuItem>
            <MenuItem key={"STRIKE"} value={'STRIKE'}>Strikes</MenuItem>
          </TextField>
          {selectedMarketOption === 'STRIKE' && 
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
              {expiryDateList.map((item:any)=>(
                <MenuItem key={item} value={item}>{item}</MenuItem>
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
              select
              label={"Select interval"}
              name="interval"
              value={selectedInterval}
              onChange={(e:any) => setSelectedInterval(e.target.value)}
            >
              <MenuItem value={""}>None</MenuItem>
              <MenuItem value={"ONE_MINUTE"}>1 Minute</MenuItem>
              <MenuItem value={"FIVE_MINUTE"}>5 Minute</MenuItem>
            </TextField>
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
            label={"Select Option"}
            name="bankNiftyTokens"
            value={selectedOption}
            onChange={(event:any) => setSelectedOption(event.target.value)}
          >
            <MenuItem value={""}>None</MenuItem>
            {filteredSymbolTokenList?.map((item:any) => (
            <MenuItem
              key={item.symboltoken}
              value={item.symboltoken}
            >
              {item.tradingsymbol}
            </MenuItem>
          ))}
          </TextField>
        </Grid>
        <Grid item sm={8} sx={{ display: "content" }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newValue:any) => {
                setSelectedDate(newValue);
              }}
              renderInput={(params:any) => 
              <TextField sx={{
                marginLeft: "10px",
                marginTop: "15px",
                height: "fit-content",
                width: "150px",
              }} {...params} />}
            />
            <TimePicker
              label="From"
              value={selectedFromTime}
              onChange={(newValue:any) => {
                setSelectedFromTime(newValue);
              }}
              renderInput={(params:any) => 
              <TextField
                sx={{
                marginLeft: "10px",
                marginTop: "15px",
                height: "fit-content",
                width: "150px",
                }} 
              {...params} />}
            />
            <TimePicker
              label="To"
              value={selectedToTime}
              onChange={(newValue:any) => {
                setSelectedToTime(newValue);
              }}
              renderInput={(params:any) => 
              <TextField 
                sx={{
                marginLeft: "10px",
                marginTop: "15px",
                height: "fit-content",
                width: "150px",
                }}
              {...params} />}
            />
          </LocalizationProvider>
          <LoadingButton
              loading={loading}
              sx={{
                marginLeft: "10px",
                marginTop: "15px",
                height: "fit-content",
              }}
              variant="outlined"
              onClick={onFRVPsearch}
            >
              <SearchIcon />
          </LoadingButton>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item sm={12} sx={{ paddingLeft: "20px !important" }}>
          <Card variant="outlined" sx={{ padding: "20px" }}>
            <CardHeader
              title={`Fixed Range Volume Profile:`}
              sx={{ padding: "5px 24px 0 24px" }}
            ></CardHeader>
            <CardContent>
              { frvpData && <FRVPPivotTable data={frvpData}/>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default BankNiftyTrading;