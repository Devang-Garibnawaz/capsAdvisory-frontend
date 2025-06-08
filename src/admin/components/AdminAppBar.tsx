import AppBar from "@material-ui/core/AppBar";
import { drawerCollapsedWidth, drawerWidth } from "../../core/config/layout";
import { useSettings } from "../../core/contexts/SettingsProvider";
import { useEffect } from "react";
import style from './AdminAppBar.module.css';

type AdminAppBarProps = {
  children: React.ReactNode;
};

const AdminAppBar = ({ children }: AdminAppBarProps) => {
  const { collapsed } = useSettings();
  const width = collapsed ? drawerCollapsedWidth : drawerWidth;

  useEffect(() => {
    const appBar: any = document.querySelector('.MuiAppBar-root');
    if (appBar && appBar.children.length > 0) {
      appBar.children[0].classList.add(style['toolbar-height']);
    }
  }, []);

  return (
    <AppBar
      color="default"
      position="fixed"
      sx={{
        height: '70px !important',
        minHeight: '70px !important',
        width: { lg: `calc(100% - ${width}px)` },
        marginLeft: { lg: width },
      }}
    >
      {children}
    </AppBar>
  );
};

export default AdminAppBar;
