import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import LoadingButton from "@material-ui/lab/LoadingButton";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import BoxedLayout from "../../core/components/BoxedLayout";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import { useRegister } from "../hooks/useRegister";
import { UserInfo } from "../types/userInfo";


const Register = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbar();
  const { t } = useTranslation();

  const { isRegistering, register } = useRegister();

  const formik = useFormik({
    initialValues: {
      email: "",
      fullName: "",
      clientId: "",
      pinNumber: "",
      password:""
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required(t("common.validations.required")),
      fullName: Yup.string()
        .max(20, t("common.validations.max", { size: 20 }))
        .required(t("common.validations.required")),
      clientId: Yup.string()
      .max(20, t("common.validations.max", { size: 20 }))
      .required(t("common.validations.required")),
      pinNumber: Yup.string()
      .max(20, t("common.validations.max", { size: 20 }))
      .required(t("common.validations.required")),
      password: Yup.string()
        .min(8, t("common.validations.min", { size: 8 }))
        .required(t("common.validations.required")),
    }),
    onSubmit: (values) => handleRegister(values),
  });

  const handleRegister = async (values: Partial<UserInfo>) => {
    register(values as UserInfo)
      .then((result) => {
        console.log('reg result:', result);
        if(result?.status){
          snackbar.success(t("auth.register.notifications.success"));
          navigate(`/`);
        }else{
          snackbar.error(result.message);
        }
        
      })
      .catch(() => {
        snackbar.error(t("common.errors.unexpected.subTitle"));
      });
  };

  return (
    <BoxedLayout>
      <Typography component="h1" variant="h5">
        {t("auth.register.title")}
      </Typography>
      <Box
        component="form"
        marginTop={3}
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <TextField
          margin="normal"
          required
          fullWidth
          id="fullName"
          label={'Full Name'}
          name="fullName"
          autoComplete="given-name"
          disabled={isRegistering}
          value={formik.values.fullName}
          onChange={formik.handleChange}
          error={formik.touched.fullName && Boolean(formik.errors.fullName)}
          helperText={formik.touched.fullName && formik.errors.fullName}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="clientId"
          label={'Client Id'}
          name="clientId"
          autoComplete="given-name"
          disabled={isRegistering}
          value={formik.values.clientId}
          onChange={formik.handleChange}
          error={formik.touched.clientId && Boolean(formik.errors.clientId)}
          helperText={formik.touched.clientId && formik.errors.clientId}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="pinNumber"
          label={'PIN'}
          name="pinNumber"
          type="password"
          autoComplete="pin-number"
          disabled={isRegistering}
          value={formik.values.pinNumber}
          onChange={formik.handleChange}
          error={formik.touched.pinNumber && Boolean(formik.errors.pinNumber)}
          helperText={formik.touched.pinNumber && formik.errors.pinNumber}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label={t("auth.register.form.email.label")}
          name="email"
          autoComplete="email"
          disabled={isRegistering}
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />
        <TextField
              margin="normal"
              variant="filled"
              required
              fullWidth
              name="password"
              label={t("auth.login.form.password.label")}
              type="password"
              id="password"
              autoComplete="current-password"
              disabled={isRegistering}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
          />
        <LoadingButton
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          disabled={isRegistering}
          loading={isRegistering}
          sx={{ mt: 2 }}
        >
          {t("auth.register.submit")}
        </LoadingButton>
        <Button
          component={Link}
          to={`/`}
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          {t("auth.register.back")}
        </Button>
      </Box>
    </BoxedLayout>
  );
};

export default Register;
