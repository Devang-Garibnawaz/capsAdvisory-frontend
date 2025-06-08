import React, { useState } from "react";
import Empty from "../../core/components/Empty";
import { Orders } from "../types/orders";
import moment from "moment";
import { DataGrid, GridColDef, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from "@mui/x-data-grid";
import Box from '@mui/material/Box';

type OrdersTableProps = {
  ordersData?: Orders[];
  columns: GridColDef[];
};

const OrdersTable = ({
  ordersData = [],
  columns=[]
}: OrdersTableProps) => {

  const [pageSize, setPageSize] = React.useState<number>(20);

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
          rows={ordersData}
          disableColumnSelector={true}
          columns={columns}
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


export default OrdersTable;