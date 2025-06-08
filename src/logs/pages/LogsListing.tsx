import { Box, Card, CardContent, CardHeader, Grid, Skeleton, TextField } from "@material-ui/core";
import React, { useState,useRef, useEffect } from "react";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import LinearProgress from '@mui/material/LinearProgress';
import { FetchLogsDataService } from "../hooks/useLogsList";
import { DatePicker, LoadingButton } from "@material-ui/lab";
import LogsTable from "../components/LogsTable";
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarExport, GridToolbarFilterButton } from "@mui/x-data-grid";
import { Logs, LogsRoot } from "../types/logs";
import Empty from "../../core/components/Empty";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import { Link } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const LogsListingManagement = () => {
    const [dpDate,setDPDate] = useState<Date>(new Date());
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [rowCount, setRowCount] = useState(0);
    const [rows, setRows] = useState([]);
    const [logsData, setLogsData] = useState<any>([]);
    const [isDataFetching, setIsDataFetching] = useState(false);
    const snackbar = useSnackbar();
    const [data, setData] = useState<any>();
    
    // React.useEffect(() => {
    //     fetchRecords();
    //   }, [dpDate]);

    const fetchRecords = async () => {
        try {
          setIsDataFetching(true);
          const [
            logsResult
          ] = await Promise.all([
            FetchLogsDataService(dpDate!,page,pageSize)
          ]);
          setLogsData(logsResult);
          setData( logsResult.logData);
          setRowCount(logsResult.rowCount);    
          setIsDataFetching(false);
        } catch (error: any) {
          snackbar.error(error.message);
          setIsDataFetching(false);
        }
    }

    useEffect(() => {
        fetchRecords();
    }, [page, pageSize,dpDate]);


    function ExpandableCell({ value }: GridRenderCellParams) {
        const [expanded, setExpanded] = React.useState(false);
      
        return (
          <div>
            {expanded ? value : value.slice(0, 200)}&nbsp;
            {value.length > 200 && (
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <Link
                type="button"
                component="button"
                sx={{ fontSize: 'inherit' }}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'view less' : 'view more'}
              </Link>
            )}
          </div>
        );
      }

    const columns: GridColDef[] = [
        { field: 'title', headerName: 'Title',align:'left' },
        { 
            field: 'description', 
            headerName: 'Description',
            flex: 1,
            minWidth: 200,
            headerAlign:'center',
            align:'left',
            renderCell: (params: GridRenderCellParams) => <ExpandableCell {...params} /> 
        },
        { 
          field: 'date', 
          headerName: 'Log Time', 
          headerAlign:'center',
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

    const handleSubmit = async (date: Date) => {
        setDPDate(date);
    };
      
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

    const handlePageChange = (newPage:number) => {
        setPage(newPage+1);
      };
    
      const handlePageSizeChange = (newPageSize:number) => {
        setPage(1); // Reset page to 0 when pageSize changes
        setPageSize(newPageSize);
      };
    return (
        <React.Fragment>
            <AdminAppBar>
                <AdminToolbar title={'Logs List'}>
                </AdminToolbar>
            </AdminAppBar>
            <Grid container spacing={2}>
                <Grid item sm={6} sx={{marginLeft:'10px'}}>
                    <DatePicker
                    label={'Date'}
                    onChange={(date: Date | null) =>
                        handleSubmit(date!)
                    }
                    disableFuture={true}
                    inputFormat="dd/MM/yyyy"
                    value={dpDate}
                    renderInput={(params:any) => (
                        <TextField
                        {...params}
                        id="date"
                        margin="normal"
                        name="start"
                        />
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
            </Grid>
            <Box sx={{ width: '100%',marginTop:'10px',marginBottom:'10px' }}>
                {isDataFetching && <LinearProgress/>}
            </Box>
            <Grid container spacing={2}>
            <Grid item sm={12} sx={{paddingLeft:'20px !important'}}>
                <Card variant="outlined" sx={{padding:'20px'}}>
                    <CardContent sx={{padding:'10px !important'}}>
                    {isDataFetching ? (
                        <Skeleton animation="wave" />
                    ) : (
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
                            
                            {!data || data.length === 0 ?
                                <Empty title="No Data Found" />
                                :
                            <DataGrid
                                sx={{
                                    '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': {
                                    py: 1,
                                    },
                                    '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': {
                                    py: '15px',
                                    },
                                    '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': {
                                    py: 3,
                                    },
                                }}
                                rows={data}
                                columns={columns}
                                components={{
                                    Toolbar: CustomToolbar,
                                }}
                                getRowHeight={() => 'auto'}
                                pagination
                                paginationMode="server"
                                pageSize={pageSize}
                                rowCount={rowCount}
                                page={page - 1}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                                getRowId={(row: any) =>  row.id}   
                                rowsPerPageOptions={[5,10,20,50,100]}
                            />
                        }
                        </Box>
                    )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        </React.Fragment>
    );

};

export default LogsListingManagement;