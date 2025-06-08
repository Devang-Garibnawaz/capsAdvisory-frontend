import React, { useState } from "react";
import Empty from "../../core/components/Empty";
import moment from "moment";
import { DataGrid, GridCellParams, GridColDef, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton, GridValueGetterParams } from "@mui/x-data-grid";
import Box from '@mui/material/Box';
import clsx from "clsx";
import { Logs } from "../types/logs";

type LogsTableProps = {
  logsData?: Logs[];
};

const LogsTable = ({
  logsData = [],
}: LogsTableProps) => {

  const [pageSize, setPageSize] = React.useState<number>(10);

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Title',align:'left' },
    { field: 'description', headerName: 'Description',width: 680, headerAlign:'center',align:'center' },
    { 
      field: 'date', 
      headerName: 'Log Time', 
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
    }
  ];

  if (logsData.length === 0) {
    return <Empty title="No Data Found" />;
  }

  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{padding:'1px'}}>
        <GridToolbarColumnsButton sx={{padding:'14px'}} onResize={undefined} nonce={undefined} onResizeCapture={undefined} />
        <GridToolbarFilterButton sx={{padding:'14px'}} onResize={undefined} nonce={undefined} onResizeCapture={undefined} />
        <GridToolbarDensitySelector sx={{padding:'14px'}} onResize={undefined} nonce={undefined} onResizeCapture={undefined} />
        <GridToolbarExport sx={{padding:'14px'}} />
      </GridToolbarContainer>
    );
  }
  return (
    
      <Box sx={{
                  height: '580px', 
                  width: '100%',
                  '& .super-app-theme--cell': {
                    backgroundColor: 'rgba(224, 183, 60, 0.55)',
                    color: '#1a3e72',
                    fontWeight: '600',
                  },
                  '& .super-app.negative': {
                    backgroundColor: '#d47483',
                    fontWeight: '600',
                  },
                  '& .super-app.positive': {
                    backgroundColor: 'rgba(157, 255, 118, 0.49)',
                    fontWeight: '600',
                  }
                }}>
        <DataGrid
          rows={logsData}
          disableColumnSelector={true}
          columns={columns}
          isRowSelectable={(row:any)=>row.id}
          components={{
            Toolbar: CustomToolbar,
          }}
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)} 
          getRowId={(row: any) =>  row.id}
          rowsPerPageOptions={[5,10,20]}
        />
      </Box>
    
  );
};


export default LogsTable;
