import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import LoadingButton from "@material-ui/lab/LoadingButton";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import BoxedLayout from "../../core/components/BoxedLayout";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import { useLocalStorage } from "../../core/hooks/useLocalStorage";
import { useAuth } from "../contexts/AuthProvider";
import CheckIcon from '@mui/icons-material/Check';
import { GridCheckCircleIcon, GridCloseIcon } from "@mui/x-data-grid";
import { getBaseUrl } from "../../http/globalUrl";
import { CheckBrokerStatusService } from "../hooks/useAngelBrokingLogin";


const AngelBrokingLogin = () => {

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isStatusLoading,setIsStatusLoading] = useState(false);
  const snackbar = useSnackbar();
  const { isAngelbrokingLoggingIn, angelBrokingLogin } = useAuth();
  const [loginStatus, setLoginStatus] = useState(false);
  const BASE_URL = getBaseUrl();

  useEffect(() => {
    fetchBrokerStatus();
  },[])

  const handleAuthentication = (clientCode: string, password: string,tOtp:string) => {
    angelBrokingLogin(clientCode, password,tOtp)
      .then((data) =>{
        if(data?.status){
            snackbar.success(data.message);
            setLoginStatus(data.status);
            window.localStorage.setItem("angelBrokingStatus",data.status);
        }
        else{
          snackbar.error(data.message);
        }
      }).catch(() => snackbar.error("Error"));
  };

  const formik = useFormik({
    initialValues: {
      clientCode: localStorage.getItem('clientId'),
      password: localStorage.getItem('pinNumber'),
      tOtp:"",
    },
    validationSchema: Yup.object({
      clientCode: Yup.string()
        .required("Required"),
      password: Yup.string()
        .required("Required"),
      tOtp: Yup.string().required("Required"),
    }),
    onSubmit: (values) => handleAuthentication(values.clientCode!, values.password!, values.tOtp),
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  
  const fetchBrokerStatus = async () => {
    try {
      const [
        brokerStatus
      ] = await Promise.all([
        CheckBrokerStatusService()
      ]);

      setLoginStatus(brokerStatus.status);
      window.localStorage.setItem("angelBrokingStatus",brokerStatus.status);
    } catch (error: any) {
      snackbar.error(error.message);
    }
  };

  const checkBrokerConnection = async () =>{
    fetchBrokerStatus();
    handleClickOpen();
  }

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
      <DialogTitle >
        {"Angle Broking Connection Status"}
      </DialogTitle>
      <DialogContent sx={{width: "300px", height: "100px",display: "contents"}}>
        {loginStatus ? <GridCheckCircleIcon color="success" sx={{fontSize:"70px",display: "block", margin: "auto"}} /> : <GridCloseIcon color="error" sx={{fontSize:"70px",display: "block", margin: "auto"}} />}
        <Typography sx={{display: "table-cell",textAlign:"center"}}>{loginStatus? "Connected" : "Not Connected"} </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClose}>Close</Button>
      </DialogActions>
      </Dialog>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: "url(./img/startup.svg)",
          backgroundRepeat: "no-repeat",
          bgcolor: "background.default",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} square>
        <BoxedLayout>
          <Typography component="h1" variant="h5">
            {'Angel Broking Authentication'}
          </Typography>
          <Box
            component="form"
            marginTop={3}
            noValidate
            onSubmit={formik.handleSubmit}
          >
            <TextField
              margin="normal"
              variant="filled"
              required
              fullWidth
              id="clientCode"
              value={formik.values.clientCode}
              onChange={formik.handleChange}
              label={'Client Code'}
              name="clientCode"
              disabled={isAngelbrokingLoggingIn}
              error={formik.touched.clientCode && Boolean(formik.errors.clientCode)}
              helperText={formik.touched.clientCode && formik.errors.clientCode}
            />
            <TextField
              margin="normal"
              variant="filled"
              required
              fullWidth
              name="password"
              label={'Password'}
              type="password"
              id="password"
              disabled={isAngelbrokingLoggingIn}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <TextField
              margin="normal"
              variant="filled"
              required
              fullWidth
              name="tOtp"
              label={'T-OTP'}
              type="numeric"
              id="tOtp"
              disabled={isAngelbrokingLoggingIn}
              value={formik.values.tOtp}
              onChange={formik.handleChange}
              error={formik.touched.tOtp && Boolean(formik.errors.tOtp)}
              helperText={formik.touched.tOtp && formik.errors.tOtp}
            />
            <LoadingButton
              type="submit"
              fullWidth
              loading={isAngelbrokingLoggingIn}
              variant="contained"
              sx={{ mt: 3 }}
            >
              {'Submit'}
            </LoadingButton> 
            <Button variant="outlined" onClick={() => navigate(-1)} sx={{mt:3}}>{'Back'}</Button>
            <LoadingButton loading={isStatusLoading} variant="outlined" onClick={checkBrokerConnection} sx={{mt:3,ml:2}}>{'Check Status'}</LoadingButton>
          </Box>
        </BoxedLayout>
      </Grid>
    </Grid>
  );
};

export default AngelBrokingLogin;
