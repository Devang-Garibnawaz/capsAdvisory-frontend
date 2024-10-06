
import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Box,
  Stack
} from '@mui/material';
import { formatTime } from '../helper/formatDateHelper';

const FRVPPivotTable = (props:any) => {
    return (
    <TableContainer component={Paper}>
        <Stack direction='row' spacing={2}>
            <Typography><b>Counted FRVP: </b> {props.data.countedFRVP}</Typography>
            <Typography><b>Symbol Token: </b> {props.data.symboltoken}</Typography>
        </Stack>
        <Stack direction='row' spacing={2}>
            <Typography><b>From Date: </b> {props.data.fromDateTime}</Typography>
            <Typography><b>To Date: </b> {props.data.toDateTime}</Typography>
        </Stack>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Candle Time</TableCell>
            {props.data?.candelData?.map((item:any, index:any) => (
              <TableCell key={index} align="center">{formatTime(item.bankNiftyTime)}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {['volume', 'open', 'high', 'low', 'close'].map((field) => (
            <TableRow key={field}>
              <TableCell style={{fontWeight:'bold'}}>{field}</TableCell>
              {props.data?.candelData?.map((item:any, index:any) => (
                <TableCell key={index} align="center">{item[field.toLowerCase()]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FRVPPivotTable;