import { PaletteMode } from "@material-ui/core";
import { colors } from "./colors";

export interface Palette {
  contrastThreshold: number;
  mode: PaletteMode;
  error: typeof colors.error;
  info: {
    main: string;
  };
  primary: {
    main: string;
    contrastText: string;
  };
  secondary: {
    main: string;
  };
  success: typeof colors.success;
  warning: typeof colors.warning;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  divider: string;
  background: {
    paper: string;
    default: string;
  };
  action: {
    selectedOpacity: number;
    selected: string;
  };
}

export const createDarkPalette = (): Palette => ({
  contrastThreshold: 4.5,
  mode: "dark",
  error: colors.error,
  info: {
    main: "#4FC3F7",
  },
  primary: {
    main: "#64B5F6",
    contrastText: colors.grey[900],
  },
  secondary: {
    main: colors.grey[900],
  },
  success: colors.success,
  warning: colors.warning,
  background: {
    paper: colors.background.dark.paper,
    default: colors.background.dark.default,
  },
  text: {
    primary: colors.text.dark.primary,
    secondary: colors.text.dark.secondary,
    disabled: colors.text.dark.disabled,
  },
  divider: colors.grey[700],
  action: {
    selectedOpacity: 0,
    selected: colors.grey[800],
  },
});

export const createLightPalette = (): Palette => ({
  contrastThreshold: 3,
  mode: "light",
  error: colors.error,
  info: {
    main: "#00B0FF",
  },
  primary: {
    main: "#2962FF",
    contrastText: "#FFF",
  },
  secondary: {
    main: "#FFF",
  },
  success: colors.success,
  warning: colors.warning,
  text: {
    primary: colors.text.light.primary,
    secondary: colors.text.light.secondary,
    disabled: colors.text.light.disabled,
  },
  divider: colors.grey[100],
  background: {
    paper: colors.background.light.paper,
    default: colors.background.light.default,
  },
  action: {
    selectedOpacity: 0,
    selected: colors.grey[50],
  },
});

export const darkPalette: Palette = createDarkPalette();
export const lightPalette: Palette = createLightPalette();
