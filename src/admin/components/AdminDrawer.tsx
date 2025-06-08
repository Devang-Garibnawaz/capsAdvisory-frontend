import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Box from "@material-ui/core/Box";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import { Grading, Login, SpeakerNotes } from "@material-ui/icons";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SettingsIcon from "@material-ui/icons/Settings";
import WaterFallChartIcon from "@material-ui/icons/WaterfallChart";
import { CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/contexts/AuthProvider";
import { CheckBrokerStatusService } from "../../auth/hooks/useAngelBrokingLogin";
import Logo from "../../core/components/Logo";
import { drawerCollapsedWidth, drawerWidth } from "../../core/config/layout";
import { useSnackbar } from "../../core/contexts/SnackbarProvider";
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import SsidChartIcon from '@mui/icons-material/SsidChart';

type AdminDrawerProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  onSettingsToggle: () => void;
};

const AdminDrawer = ({
  collapsed,
  mobileOpen,
  onDrawerToggle,
  onSettingsToggle,
}: AdminDrawerProps) => {
  const { logout, userInfo } = useAuth();
  const { t } = useTranslation();
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [filteredMenuItems, setFilteredMenuItems] = useState<any>([]);
  const width = collapsed ? drawerCollapsedWidth : drawerWidth;
  const snackbar = useSnackbar();

  const getMenuItems = () => {
    if(userRole === 'user'){
      setFilteredMenuItems([
      {
        icon: Login,
        key: "admin.drawer.menu.AngelBrokingLogin",
        path: "angel-broking-login",
      }
      ]);
    }else{
      setFilteredMenuItems([
        // {
        //   icon: WaterFallChartIcon,
        //   key: "admin.drawer.menu.BankNiftyTrading",
        //   path: "/admin/banknifty-trading",
        // },
        // {
        //   icon: Grading,
        //   key: "admin.drawer.menu.BankNiftyOrders",
        //   path: "/admin/orders",
        // },
        {
          icon: PeopleIcon,
          key: "admin.drawer.menu.AccountManager",
          path: "/admin/account-manager"
        },
        {
          icon: GroupsIcon,
          key: "admin.drawer.menu.GroupManager",
          path: "/admin/group-manager"
        },
        {
          icon: Grading,
          key: "admin.drawer.menu.LoginUsersManagement",
          path: "/admin/login-users"
        },
        {
          icon: SsidChartIcon,
          key: "admin.drawer.menu.Strategies",
          path: "/admin/strategies"
        },
        // {
        //   icon: WaterFallChartIcon,
        //   key: "admin.drawer.menu.NiftyTrading",
        //   path: "/admin/nifty-trading",
        // },
        // {
        //   icon: WaterFallChartIcon,
        //   key: "admin.drawer.menu.BasketTrading",
        //   path: "/admin/basket-trading",
        // },
        // {
        //   icon: WaterFallChartIcon,
        //   key: "admin.drawer.menu.CrudeoilTrading",
        //   path: "/admin/crudeoil-trading",
        // },
        {
          icon: Login,
          key: "admin.drawer.menu.AngelBrokingLogin",
          path: "angel-broking-login",
        },
        {
          icon: SpeakerNotes,
          key: "admin.drawer.menu.LogsManagement",
          path: "/admin/logs-management",
        }
        ]);
    }
  };

  const fetchBrokerStatus = async () => {
    try {
      setIsStatusLoading(true);
      const [
        brokerStatus
      ] = await Promise.all([
        CheckBrokerStatusService()
      ]);

      setLoginStatus(brokerStatus.status);
      window.localStorage.setItem("angelBrokingStatus",brokerStatus.status);
      setIsStatusLoading(false);
    } catch (error: any) {
      snackbar.error(error.message);
      setIsStatusLoading(false);
    }
  };

  const roleBaseMenu =async () =>{
    const authToken = localStorage.getItem('authkey');
    const arrayToken = authToken?.split('.');
    const tokenPayload = arrayToken && JSON.parse(atob(arrayToken[1]));
    if(tokenPayload){
      setUserRole(tokenPayload.role);
    }
  }

  useEffect(() => {
    fetchBrokerStatus();
    roleBaseMenu();
  },[])

  useEffect(() =>{
    getMenuItems();
  },[userRole]);

  const handleLogout = () => {
    logout().catch(() =>
      snackbar.error(t("common.errors.unexpected.subTitle"))
    );
  };

  const drawer = (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <Logo sx={{ display: "flex", p: 4 }} />
      <List component="nav" sx={{ px: 2 }}>
        {filteredMenuItems.map((item:any) => (
          <ListItem
            button
            component={NavLink}
            key={item.path}
            activeClassName="Mui-selected"
            end={true}
            to={`/${process.env.PUBLIC_URL}${item.path}`}
          >
            <ListItemAvatar>
              <Avatar sx={{ color: "inherit", bgcolor: "transparent" }}>
                <item.icon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t(item.key)}
              sx={{
                display: collapsed ? "none" : "block",
              }}
            />{item.key === 'admin.drawer.menu.AngelBrokingLogin' ? isStatusLoading ? <CircularProgress color="success" size="0.625rem"/> : !loginStatus ? <Badge color='error' variant="dot" invisible={false} title="Agel Broking Not Connected"/> : <Badge sx={{
              "& .MuiBadge-badge": {
                color: "lightgreen",
                backgroundColor: "#81C784"
              }
            }} variant="dot" invisible={false} title="Agel Broking Connected"/> : null}
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <List component="nav" sx={{ p: 2 }}>
        {/* <ListItem
          button
          component={NavLink}
          to={`/${process.env.PUBLIC_URL}/admin/profile`}
        >
          <ListItemAvatar>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </ListItemAvatar>
          {userInfo && (
            <ListItemText
              primary={`${userInfo.fullName}`}
              sx={{
                display: collapsed ? "none" : "block",
              }}
            />
          )}
        </ListItem> */}
        <ListItem button onClick={handleLogout}>
          <ListItemAvatar>
            <Avatar>
              <ExitToAppIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("Logout")}
            sx={{
              display: collapsed ? "none" : "block",
            }}
          />
        </ListItem>
        <ListItem button onClick={onSettingsToggle}>
          <ListItemAvatar>
            <Avatar>
              <SettingsIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t("admin.drawer.menu.settings")}
            sx={{
              display: collapsed ? "none" : "block",
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box
      aria-label="Admin drawer"
      component="nav"
      sx={{
        width: { lg: width },
        flexShrink: { lg: 0 },
      }}
    >
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: width,
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: width,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default AdminDrawer;
