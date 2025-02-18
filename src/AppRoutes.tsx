import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./core/components/PrivateRoute";
import JobsListing from "./Jobs/pages/JobsListing";

// Admin
const Admin = lazy(() => import("./admin/pages/Admin"));
const Faq = lazy(() => import("./admin/pages/Faq"));
const HelpCenter = lazy(() => import("./admin/pages/HelpCenter"));
const Home = lazy(() => import("./admin/pages/Home"));
const Profile = lazy(() => import("./admin/pages/Profile"));
const ProfileActivity = lazy(() => import("./admin/pages/ProfileActivity"));
const ProfileInformation = lazy(
  () => import("./admin/pages/ProfileInformation")
);
const ProfilePassword = lazy(() => import("./admin/pages/ProfilePassword"));

// Auth
const ForgotPassword = lazy(() => import("./auth/pages/ForgotPassword"));
const ForgotPasswordSubmit = lazy(
  () => import("./auth/pages/ForgotPasswordSubmit")
);
const Login = lazy(() => import("./auth/pages/Login"));
const Register = lazy(() => import("./auth/pages/Register"));

// Calendar
// const CalendarApp = lazy(() => import("./calendar/pages/CalendarApp"));

// Core
const Forbidden = lazy(() => import("./core/pages/Forbidden"));
const NotFound = lazy(() => import("./core/pages/NotFound"));
const UnderConstructions = lazy(
  () => import("./core/pages/UnderConstructions")
);

//angel-broking-login
const AngelBrokingLogin = lazy(()=> import("./auth/pages/AngelBrokingLogin"));

//logs management
const LogsManagement = lazy(()=> import("./logs/pages/LogsListing"));

//moneyflux-stocks-management
const BankNiftyTrading = lazy(() => import("./bankNifty/pages/BankNiftyTrading"));
const CrudeOilTrading = lazy(() => import("./commodities/crudeOil/pages/CrudeOilTrading"));
const NiftyTrading = lazy(() => import("./nifty/pages/niftyTrading"));
const BankNiftyOrders = lazy(() => import("./bankNifty/pages/BankNiftyOrders"));
const LoginUsersManagement = lazy(() => import("./users/pages/loginUserManagement"));
const AppRoutes = () => {
  return (
    <Routes basename={process.env.PUBLIC_URL}>
      <PrivateRoute path="admin" element={<Admin />}>
        <PrivateRoute path="/" element={<Home />} />
        <PrivateRoute path="faq" element={<Faq />} />
        <PrivateRoute path="help" element={<HelpCenter />} />
        <PrivateRoute path="profile" element={<Profile />}>
          <PrivateRoute path="/" element={<ProfileActivity />} />
          <PrivateRoute path="information" element={<ProfileInformation />} />
          <PrivateRoute path="password" element={<ProfilePassword />} />
        </PrivateRoute>
        <PrivateRoute
          path="projects"
          element={
            <Navigate
              to={`/${process.env.PUBLIC_URL}/under-construction`}
              replace
            />
          }
        />
        <PrivateRoute path="banknifty-trading" element={<BankNiftyTrading />} />
        <PrivateRoute path="nifty-trading" element={<NiftyTrading />} />
        <PrivateRoute path="crudeoil-trading" element={<CrudeOilTrading />} />
        <PrivateRoute path="login-users" element={<LoginUsersManagement />} />
        <PrivateRoute path="logs-management" element={<LogsManagement/>}/>
        <PrivateRoute path="orders" element={<BankNiftyOrders/>}/>
        <PrivateRoute path="jobs-management" element={<JobsListing/>}/>

      </PrivateRoute>
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="forgot-password-submit" element={<ForgotPasswordSubmit />} />
      <Route path="/" element={<Login />} />
      <Route path="angel-broking-login" element={<AngelBrokingLogin />} />
      <Route path="register" element={<Register />} />
      <Route path="under-construction" element={<UnderConstructions />} />
      <Route path="403" element={<Forbidden />} />
      <Route path="404" element={<NotFound />} />
      <Route
        path="*"
        element={<Navigate to={`/${process.env.PUBLIC_URL}/404`} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
