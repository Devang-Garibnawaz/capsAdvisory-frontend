import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { getScriptData } from "../hooks/accountManagementService";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import { number } from "yup";
import { placeMannulOrder } from "../hooks/groupManagementService";

const CreateOrder = ({group, open, onClose }: {group: any; open: boolean; onClose: () => void; }) => {

  const [indexType, setIndexType] = useState("NIFTY");
  const [scriptType, setScriptType] = useState("");
  const [script, setScript] = useState("");
  const [product, setProduct] = useState("INTRADAY");
  const [quantity, setQuantity] = useState(75);
  const [orderType, setOrderType] = useState('Market');
  const [orderAction, setOrderAction] = useState("BUY");
  const [scriptList, setScriptList] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const snackbar = useSnackbar();

    const fetchScriptList = async (index = '') =>{
        setIsLoading(true);
        const result = await getScriptData(index || indexType);
        if(!result || !result.data || !result.data.optionsData){
            snackbar.error('No Stikeprice Found!');
            setIsLoading(false);
            setIndexType('NIFTY');
            onClose();
            return;
        }
        const formattedList = formatStikeList(result.data.optionsData);
        setScriptList(formattedList);
        setIsLoading(false);
    };

    useEffect(() =>{
        open && fetchScriptList();
    },[open]);


    function formatDate(dateStr: string) {
        const months:any = {
            Jan: "JAN", Feb: "FEB", Mar: "MAR", Apr: "APR",
            May: "MAY", Jun: "JUN", Jul: "JUL", Aug: "AUG",
            Sep: "SEP", Oct: "OCT", Nov: "NOV", Dec: "DEC"
        };

        const [day, monthStr, year] = dateStr.split("-");
        const shortYear = year.slice(-2); // Get last 2 digits of year
        const month = months[monthStr];

        return `${day}${month}${shortYear}`;
    }


    const formatStikeList = (stikePriceData: any) =>{
        const result:any = [];
        stikePriceData.forEach((item:any) => {
        const strike = item.strikePrice;

        if (item.CE) {
            const expiryDate = formatDate(item.CE.expiryDate);
            result.push(`NIFTY${expiryDate}${strike}CE`);
        }

        if (item.PE) {
            const expiryDate = formatDate(item.PE.expiryDate);
            result.push(`NIFTY${expiryDate}${strike}PE`);
        }
        });

        return result;
    }

    const handleIndexTypeChange = (e: any) =>{
        const value = e.target.value;
        setScriptType('');
        setScript('');
        setIndexType(value);
        fetchScriptList(value);
    }

    const handleScriptTypeChange = (e: any) =>{
        const value = e.target.value;
        setScript('');
        setScriptType(value);

    }


  const handlePlaceOrder = async () => {
    
    if(!script){
        snackbar.warning('Please select script!');
        return;
    }

    const orderDetails = {
      index: indexType,
      scriptType,
      script,
      product,
      quantity,
      orderType,
      orderAction,
      groupId: group.id
    };
    try {
        const result = await placeMannulOrder(orderDetails);
        if(result.status){
            snackbar.success('Order placed!');
        }else{
            snackbar.error('Order not placed: '+ result.message);
        }
    } catch (error) {
        snackbar.error('Error occured: '+error);
    }
    onClose();
  };



  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Place Order</DialogTitle>
      <DialogContent>
        {isLoading ? 
        <CircularProgress/> : 
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Index</InputLabel>
              <Select
                value={indexType}
                label="Index"
                onChange={handleIndexTypeChange}
              >
                <MenuItem value="NIFTY">NIFTY</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Script Type</InputLabel>
              <Select
                value={scriptType}
                label="Script Type"
                onChange={handleScriptTypeChange}
              >
                <MenuItem value="">Select Script Type</MenuItem>
                <MenuItem value="CE">CE</MenuItem>
                <MenuItem value="PE">PE</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Script</InputLabel>
              <Select
                value={script}
                label="Script"
                disabled={!scriptType}
                onChange={(e) => setScript(e.target.value)}
              >
                <MenuItem value="" selected>Select Script</MenuItem>
                {scriptList.filter((x:string) => x.includes(scriptType)).map((item) => (
                    <MenuItem key={item} value={item}>
                        {item}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Product</InputLabel>
              <Select
                value={product}
                label="Product"
                onChange={(e) => setProduct(e.target.value)}
              >
                <MenuItem value="INTRADAY">INTRADAY</MenuItem>
                <MenuItem value="CARRYFORWARD">CARRYFORWARD</MenuItem>
                <MenuItem value="DELIVERY">DELIVERY</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Quantity</InputLabel>
              <Select
                value={quantity}
                label="Quantity"
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                <MenuItem key={'75'} value='75'>1</MenuItem>
                <MenuItem key={'150'} value="150">2</MenuItem>
                <MenuItem key={'225'} value="225">3</MenuItem>
                <MenuItem key={'300'} value="300">4</MenuItem>
                <MenuItem key={'375'} value="375">5</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={orderType}
                label="Order Type"
                onChange={(e) => setOrderType(e.target.value)}
              >
                <MenuItem value="Market">Market</MenuItem>
                <MenuItem value="Limit">Limit</MenuItem>
                <MenuItem value="SL">SL</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
           <ToggleButtonGroup
                value={orderAction}
                exclusive
                onChange={(e, val) => val && setOrderAction(val)}
                fullWidth
                >
                <ToggleButton
                    value="BUY"
                    color="success"
                    sx={{
                    '&.Mui-selected': {
                        backgroundColor: 'green',
                        color: 'white',
                        '&:hover': {
                        backgroundColor: '#006400', // dark green
                        },
                    },
                    }}
                >
                    BUY
                </ToggleButton>
                <ToggleButton
                    value="SELL"
                    color="error"
                    sx={{
                    '&.Mui-selected': {
                        backgroundColor: '#EF4444',
                        color: 'white',
                        '&:hover': {
                        backgroundColor: '#8B0000', // dark red
                        },
                    },
                    }}
                >
                    SELL
                </ToggleButton>
            </ToggleButtonGroup>

          </Grid>
        </Grid>
        }
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" color="error" onClick={onClose}>
          Close
        </Button>
        <Button variant="contained" color="primary" onClick={handlePlaceOrder}>
          Place Order
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateOrder;
