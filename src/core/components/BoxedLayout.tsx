import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import GlobalStyles from "@material-ui/core/GlobalStyles";
import IconButton from "@material-ui/core/IconButton";
import useTheme from "@material-ui/core/styles/useTheme";
import Toolbar from "@material-ui/core/Toolbar";
import SettingsIcon from "@material-ui/icons/Settings";
import React, { useState } from "react";
import Logo from "./Logo";
import SettingsDrawer from "./SettingsDrawer";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { useAuth } from "../../auth/contexts/AuthProvider";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import { Navigate } from "react-router-dom";

type BoxedLayoutProps = {
  children: React.ReactNode;
};

const BoxedLayout = ({ children }: BoxedLayoutProps) => {
  const theme = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { logout, userInfo } = useAuth();
  const snackbar = useSnackbar();
  const token = localStorage.getItem('authkey');
  
  const handleSettingsToggle = () => {
    setSettingsOpen(!settingsOpen);
  };

  const handleLogout = () => {
    logout().then(()=>{
      <Navigate to={`/${process.env.PUBLIC_URL}`} replace/>
    }).catch((err:any) =>
      snackbar.error(err)
    );
  };

  return (
    <React.Fragment>
      <GlobalStyles
        styles={{ body: { backgroundColor: theme.palette.background.paper } }}
      />
      <AppBar color="transparent" position="relative">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          {token != '' && <IconButton
            aria-label="logout"
            component="span"
            onClick={handleLogout}
          >
            <ExitToAppIcon />
          </IconButton>}
          <IconButton
            aria-label="settings"
            component="span"
            onClick={handleSettingsToggle}
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="xs" sx={{ mt: 6 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Logo sx={{ mb: 2 }} />
          {children}
          <Box>
            <SettingsDrawer
              onDrawerToggle={handleSettingsToggle}
              open={settingsOpen}
            />
          </Box>
        </Box>
      </Container>
    </React.Fragment>
  );
};

export default BoxedLayout;
