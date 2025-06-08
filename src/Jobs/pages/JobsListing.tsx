import {
  DataGrid,
  GridApi,
  GridCellValue,
  GridColDef,
  GridRenderCellParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { useState } from "react";
import AdminAppBar from "../../admin/components/AdminAppBar";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Skeleton,
  TextField,
} from "@material-ui/core";
import Empty from "../../core/components/Empty";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import AdminToolbar from "../../admin/components/AdminToolbar";
import { DatePicker, LoadingButton } from "@material-ui/lab";
import { FetchJobsDataService, StopJobsService } from "../hooks/useJobsList";
import moment from "moment";
import SearchIcon from "@mui/icons-material/Search";
import StopCircleIcon from '@mui/icons-material/StopCircle';

const JobsListing = () => {
  const [dpDate, setDPDate] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [jobsData, setJobsData] = useState<any>([]);
  const [isDataFetching, setIsDataFetching] = useState(false);
  const snackbar = useSnackbar();
  const [data, setData] = useState<any>();
  const [selectedStateValue, setSelectedStateValue] = React.useState("");

  const fetchRecords = async () => {
    try {
      setIsDataFetching(true);
      const [jobsResult] = await Promise.all([
        FetchJobsDataService(dpDate!,selectedStateValue, page, pageSize),
      ]);
      setJobsData(jobsResult);
      setData(jobsResult.jobData);
      setRowCount(jobsResult.rowCount);
      setIsDataFetching(false);
    } catch (error: any) {
      snackbar.error(error.message);
      setIsDataFetching(false);
    }
  };

  const stopJob = async (id:string) => {
    try {
      
      const [result] = await Promise.all([
        StopJobsService(id)
      ]);
      result.status === true ? snackbar.success(result.message) : snackbar.error(result.message);
      fetchRecords();
    } catch (error: any) {
      snackbar.error(error.message);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, pageSize, dpDate]);

  const columns: GridColDef[] = [
    { field: "jobId", headerName: "Job Id", align: "center" },
    { field: "title", headerName: "Title", align: "left", width: 280 },
    { field: "state", headerName: "State", align: "center" },
    {
      field: "ordeDate",
      headerName: "Order Date",
      headerAlign: "center",
      align: "left",
      width: 100,
      valueFormatter: (params) =>
        moment(params?.value).format("DD/MM/YYYY hh:mm A"),
    },
    {
      field: "startDate",
      headerName: "Start Date",
      headerAlign: "center",
      align: "left",
      width: 100,
      valueFormatter: (params) =>
        moment(params?.value).format("DD/MM/YYYY hh:mm A"),
    },
    {
      field: "endDate",
      headerName: "End Date",
      headerAlign: "center",
      align: "left",
      width: 100,
      valueFormatter: (params) =>
        moment(params?.value).format("DD/MM/YYYY hh:mm A"),
    },
    {
        field: "action",
        align: "center",
        headerName: "Action",
        sortable: false,
        renderCell: (params) => {
          const onClick = (id:string) => {
            stopJob(id);
          };
            if(params.row.state === 'active' || params.row.state === 'queued'){
                return <Button onClick={() => onClick(params.row.id)}><StopCircleIcon/></Button>;
            }else{
                return '-'
            }
        }
      },
  ];

  const handleSubmit = async (date: Date) => {
    setDPDate(date);
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ padding: "1px" }}>
        <GridToolbarColumnsButton
          sx={{ padding: "14px" }}
          onResize={undefined}
          nonce={undefined}
          onResizeCapture={undefined}
        />
        <GridToolbarFilterButton
          sx={{ padding: "14px" }}
          onResize={undefined}
          nonce={undefined}
          onResizeCapture={undefined}
        />
        <GridToolbarDensitySelector
          sx={{ padding: "14px" }}
          onResize={undefined}
          nonce={undefined}
          onResizeCapture={undefined}
        />
        <GridToolbarExport sx={{ padding: "14px" }} />
      </GridToolbarContainer>
    );
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPage(1); // Reset page to 0 when pageSize changes
    setPageSize(newPageSize);
  };

  const handleSelectedStateValue = (event: any) => {
    setSelectedStateValue(event.target.value);
  };

  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Jobs List"}></AdminToolbar>
      </AdminAppBar>
      <Grid container spacing={2}>
        <Grid item sm={2} sx={{ marginLeft: "10px" }}>
          <DatePicker
            label={"Date"}
            onChange={(date: Date | null) => handleSubmit(date!)}
            inputFormat="dd/MM/yyyy"
            value={dpDate}
            disableFuture={true}
            renderInput={(params: any) => (
              <TextField {...params} id="date" margin="normal" name="start" />
            )}
          />
        </Grid>
        <Grid item sm={4} sx={{ marginLeft: "10px" }}>
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
            label={"All"}
            name="generateData"
            value={selectedStateValue}
            onChange={handleSelectedStateValue}
          >
            <MenuItem selected={true} value={""}>All</MenuItem>
            <MenuItem value={"new"}>NEW</MenuItem>
            <MenuItem value={"queued"}> QUEUED </MenuItem>
            <MenuItem value={"cancelled"}> CANCELLED </MenuItem>
            <MenuItem value={"cancelling"}>CANCELLING</MenuItem>
            <MenuItem value={"completed"}>COMPLETED</MenuItem>
            <MenuItem value={"failed"}>FAILED</MenuItem>
            <MenuItem value={"active"}>ACTIVE</MenuItem>
          </TextField>
            <LoadingButton
              loading={isDataFetching}
              sx={{
                marginLeft: "10px",
                marginTop: "15px",
                height: "fit-content",
              }}
              onClick={fetchRecords}
            >
              <SearchIcon />
            </LoadingButton>
        </Grid>
      </Grid>
      <Box sx={{ width: "100%", marginTop: "10px", marginBottom: "10px" }}>
        {isDataFetching && <LinearProgress />}
      </Box>
      <Grid container spacing={2}>
        <Grid item sm={12} sx={{ paddingLeft: "20px !important" }}>
          <Card variant="outlined" sx={{ padding: "20px" }}>
            <CardContent sx={{ padding: "10px !important" }}>
              {isDataFetching ? (
                <Skeleton animation="wave" />
              ) : (
                <Box
                  sx={{
                    height: "580px",
                    width: "100%",
                    "& .super-app-theme--cell": {
                      backgroundColor: "rgba(224, 183, 60, 0.55)",
                      color: "#1a3e72",
                      fontWeight: "600",
                    },
                    "& .super-app.negative": {
                      backgroundColor: "#d47483",
                      fontWeight: "600",
                    },
                    "& .super-app.positive": {
                      backgroundColor: "rgba(157, 255, 118, 0.49)",
                      fontWeight: "600",
                    },
                  }}
                >
                  {!data || data.length === 0 ? (
                    <Empty title="No Data Found" />
                  ) : (
                    <DataGrid
                      sx={{
                        "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell":
                          {
                            py: 1,
                          },
                        "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell":
                          {
                            py: "15px",
                          },
                        "&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell":
                          {
                            py: 3,
                          },
                      }}
                      rows={data}
                      columns={columns}
                      components={{
                        Toolbar: CustomToolbar,
                      }}
                      getRowHeight={() => "auto"}
                      pagination
                      paginationMode="server"
                      pageSize={pageSize}
                      rowCount={rowCount}
                      page={page - 1}
                      onPageChange={handlePageChange}
                      onPageSizeChange={handlePageSizeChange}
                      getRowId={(row: any) => row.id}
                      rowsPerPageOptions={[5, 10, 20, 50, 100]}
                    />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default JobsListing;
