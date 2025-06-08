import React, { useState } from "react";
import Empty from "../../../core/components/Empty";
import { ClientOrders } from "../types/clientOrders";
import moment from "moment";
import { DataGrid, GridColDef, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from "@mui/x-data-grid";
import Box from '@mui/material/Box';
import { useMemo } from "react";

type ClientOrdersTableProps = {
  ordersData?: ClientOrders[];
  columns: GridColDef[];
};

const ClientOrdersTable = ({
  ordersData = [],
  columns=[]
}: ClientOrdersTableProps) => {

  const [pageSize, setPageSize] = React.useState<number>(20);
  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedRows = useMemo(() => ordersData, [ordersData]);
  
  if (ordersData.length === 0) {
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
                    color: '#f35631',
                    fontWeight: '600',
                  },
                  '& .super-app.positive': {
                    color: '#10b983',
                    fontWeight: '600',
                  }
                }}>
        <DataGrid
          rows={memoizedRows}
          disableColumnSelector={true}
          columns={memoizedColumns}
          isRowSelectable={(row:any)=>row.id}
          components={{
            Toolbar: CustomToolbar,
          }}
          density="compact"
          pageSize={pageSize}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)} 
          getRowId={(row: any) =>  row.id}
          rowsPerPageOptions={[5,10,20,100]}
        />
      </Box>
    
  );
};


export default ClientOrdersTable;