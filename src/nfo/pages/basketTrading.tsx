import React, { useEffect, useState } from "react";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import {
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import LiveMarketData from "../components/LiverMarketData";
import { set } from "date-fns";

const BasketTrading = () => {
  const [selectedIndexOption, setSelectedIndexOption] = React.useState("");
  const [marketData, setMarketData] = useState<any[]>([]);
  const [niftyLTP, setNiftyLTP]= useState(0);
  const [sensexLTP, setSensexLTP]= useState(0);

  const onIndexOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIndexOption(event.target.value);
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");

    ws.onmessage = (event) => {
      let data = JSON.parse(event.data);
      setMarketData((prevData) => {
        data.nse.exchange_timestamp = new Date(Number(data.nse.exchange_timestamp)).toLocaleString(
          "en-IN",
          { timeZone: "Asia/Kolkata" }
        );
        data.bse.exchange_timestamp = new Date(Number(data.bse.exchange_timestamp)).toLocaleString(
          "en-IN",
          { timeZone: "Asia/Kolkata" }
        );
        setNiftyLTP(parseFloat(((data.nifty.last_traded_price)/100).toFixed(2)));
        setSensexLTP(parseFloat(((data.sensex.last_traded_price)/100).toFixed(2)));
        const updatedData = prevData.filter(
          (item: any) => item.index !== data.index
        );
        return [...updatedData, data];
      });
    };

    ws.onclose = () => console.log("WebSocket disconnected");

    return () => ws.close();
  }, []);

  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Basket Trading"}></AdminToolbar>
      </AdminAppBar>
      <Grid container spacing={4}>
        <Grid item sm={12} sx={{ display: "content" }}>
          <TextField
            sx={{
              marginLeft: "10px",
              marginTop: "15px",

              width: "250px",
            }}
            margin="normal"
            fullWidth
            select
            label={"Select Option"}
            name="expiry"
            value={selectedIndexOption}
            onChange={onIndexOptionChange}
          >
            <MenuItem value={""}>None</MenuItem>
            <MenuItem key={"842068"} value={"sensex"}>
              {`SENSEX`}&nbsp;<span>{sensexLTP}</span>
            </MenuItem>
            <MenuItem key={"35001"} value={"nifty"}>
              {`NIFTY`}&nbsp;<span>{niftyLTP}</span>
            </MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default BasketTrading;
