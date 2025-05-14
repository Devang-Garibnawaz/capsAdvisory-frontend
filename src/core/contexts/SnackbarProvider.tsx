import Alert, { Color } from "@material-ui/core/Alert";
import AlertTitle from "@material-ui/core/AlertTitle";
import Snackbar from "@material-ui/core/Snackbar";
import React, { createContext, useContext, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

interface SnackbarContextInterface {
  error: (newMessage: string) => void;
  success: (newMessage: string) => void;
}

export const SnackbarContext = createContext({} as SnackbarContextInterface);

type SnackbarProviderProps = {
  children: React.ReactNode;
};

const AUTO_HIDE_DURATION = 3000; // 3 seconds

const SnackbarProvider = ({ children }: SnackbarProviderProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<Color | undefined>(undefined);

  const handleClose = useCallback((
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  }, []);

  const error = useCallback((newMessage: string) => {
    setTitle(t("common.snackbar.error"));
    setMessage(newMessage);
    setSeverity("error");
    setOpen(true);
  }, [t]);

  const success = useCallback((newMessage: string) => {
    setTitle(t("common.snackbar.success"));
    setMessage(newMessage);
    setSeverity("success");
    setOpen(true);
  }, [t]);

  return (
    <SnackbarContext.Provider value={{ error, success }}>
      {children}
      <Snackbar
        key={message}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        open={open}
        autoHideDuration={AUTO_HIDE_DURATION}
        onClose={handleClose}
        TransitionProps={{ onExited: () => setMessage("") }}
      >
        <Alert onClose={handleClose} severity={severity}>
          <AlertTitle>{title}</AlertTitle>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export function useSnackbar() {
  return useContext(SnackbarContext);
}

export default SnackbarProvider;
