import React, { useState, useRef, useEffect } from "react";
import AdminAppBar from "../../admin/components/AdminAppBar";
import AdminToolbar from "../../admin/components/AdminToolbar";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  IconButton,
  Skeleton,
  TextField,
} from "@material-ui/core";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import LoginUsersTable from "../components/LoginUsersTable";
import { GridColDef } from "@mui/x-data-grid";
import {
  autoLoginAngel,
  FetchLoginUsersDataService,
  tradeToggle,
  updateUserStatus,
} from "../hooks/userServices";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DatePicker, LoadingButton } from "@material-ui/lab";
import { ArrowBackIos, ArrowForwardIos } from "@material-ui/icons";

const LoginUsersManagement = () => {
  const orderDataColumns: GridColDef[] = [
    {
      field: "isTradeEnabled",
      headerName: "Trading",
      width: 250,
      renderCell: (params) =>
        params.row.isTradeEnabled ? (
          <Button
            sx={{
              padding: "1px 6px",
              borderRadius: "5px",
              backgroundColor: "#1fa91f",
              color: "#ffff",
              borderColor: "ffff",
            }}
            variant="outlined"
            onClick={() => handleTradeOnOff(params.row)}
          >
            Trading is On
          </Button>
        ) : (
          <Button
            sx={{
              padding: "1px 6px",
              borderRadius: "5px",
              backgroundColor: "#e33838",
              color: "#ffff",
              borderColor: "ffff",
            }}
            variant="outlined"
            onClick={() => handleTradeOnOff(params.row)}
          >
            Trading is Off
          </Button>
        ),
    },
    { field: "clientId", headerName: "Client Code", width: 250, align: "left" },
    { field: "name", headerName: "Client Name", width: 250, align: "left" },
    {
      field: "loginDateAndTime",
      headerName: "Login Date Time",
      headerAlign: "center",
      width: 310,
      align: "left",
      valueGetter: (params) => {
        const date = new Date(params.row.loginDateAndTime);
        let hours = date.getHours();
        let minutes = date.getMinutes();
        var ampm = hours >= 12 ? "pm" : "am";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? 0 + minutes : minutes;
        var strTime =
          date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDate() +
          "  " +
          hours +
          ":" +
          (minutes < 10 ? "0" : "") +
          minutes +
          " " +
          ampm;
        return strTime;
      },
    },
  ];

  const snackbar = useSnackbar();
  const [loginUsersData, setLoginUsersData] = useState<any>();
  const [isDataFetching, setIsDataFetching] = useState(false);
  const [dpDate, setDPDate] = useState<Date>(new Date());
  const [nextDisable, setNextDisable] = useState<boolean>(false);

  const fetchRecords = async () => {
    const loginUsersData = await FetchLoginUsersDataService(dpDate!);
    setLoginUsersData(loginUsersData);
  };

  const autoLoginUsers = async () => {
    try {
      setIsDataFetching(true);
      const result = await autoLoginAngel();
      if (result?.status) {
        snackbar.success("Auto Login Users Completed!");
        fetchRecords();
      }
    } catch (error) {
      snackbar.error("Something went wrong:");
    } finally {
      setIsDataFetching(false);
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

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataFetching(true);
        await fetchRecords();
        setIsDataFetching(false);
      } catch (error: any) {
        setIsDataFetching(false);
        snackbar.error(error.message);
      }
    };

    fetchData();
    const selectedDate = `${dpDate.getDate()}-${dpDate.getMonth()}-${dpDate.getFullYear()}`;
    const currDate = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}`;
    if (selectedDate == currDate) setNextDisable(true);
    else setNextDisable(false);
  }, [dpDate]);

  const handleTradeOnOff = async (rowData: any) => {
    try {
      const result = await tradeToggle(
        rowData.clientId,
        !rowData.isTradeEnabled
      );
      if (result?.status) {
        snackbar.success("Trade toggle done!");
        fetchRecords();
      } else {
        snackbar.error(result?.message);
      }
      console.log(result);
    } catch (error: any) {
      snackbar.error("Something went wrong: " + error?.message);
    }
  };

  const handleUserStatus = async (rowData: any) => {
    try {
      const result = await updateUserStatus(
        rowData.clientId,
        !rowData.isActive
      );
      if (result?.status) {
        snackbar.success("User status updated!");
        fetchRecords();
      } else {
        snackbar.error(result?.message);
      }
    } catch (error: any) {
      snackbar.error("Something went wrong: " + error?.message);
    }
  };

  return (
    <React.Fragment>
      <AdminAppBar>
        <AdminToolbar title={"Login Users"}></AdminToolbar>
      </AdminAppBar>
      <Grid container spacing={4}>
        <Grid item sm={8}>
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
          <LoadingButton
            sx={{
              marginLeft: "10px",
              marginTop: "15px",
              width: "fit-content",
            }}
            variant="outlined"
            loading={isDataFetching}
            onClick={autoLoginUsers}
          >
            Auto Login Users
          </LoadingButton>
        </Grid>
        <Grid item sm={12} sx={{ display: "content" }}>
          <Grid item sm={12} sx={{ paddingLeft: "20px !important" }}>
            <Card variant="outlined" sx={{ padding: "20px" }}>
              <CardHeader
                title={"Login Users List"}
                sx={{ padding: "5px 24px 0 24px" }}
              ></CardHeader>
              <CardContent sx={{ padding: "10px !important" }}>
                {isDataFetching ? (
                  <Skeleton animation="wave" />
                ) : (
                  <LoginUsersTable
                    columns={orderDataColumns}
                    loginUsersData={loginUsersData}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default LoginUsersManagement;
