import { PaletteMode } from "@material-ui/core";

export interface ColorSet {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
  background: string;
}

export interface BackgroundColors {
  default: string;
  paper: string;
  hover: string;
  border: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  disabled: string;
}

export interface ButtonColors {
  background: string;
  hover: string;
  disabled: string;
}

export interface ThemeColors {
  success: ColorSet;
  error: ColorSet;
  warning: ColorSet;
  grey: {
    [key: string]: string;
  };
  background: {
    dark: BackgroundColors;
    light: BackgroundColors;
  };
  text: {
    dark: TextColors;
    light: TextColors;
  };
  button: {
    dark: ButtonColors;
    light: ButtonColors;
  };
}

export const colors: ThemeColors = {
  success: {
    main: '#00d25b',
    light: '#4ADE80',
    dark: '#16A34A',
    contrastText: '#FFFFFF',
    background: 'rgba(0, 210, 91, 0.2)',
  },
  error: {
    main: '#EF4444',
    light: '#FC424A',
    dark: '#B91C1C',
    contrastText: '#FFFFFF',
    background: 'rgba(252, 66, 74, 0.2)',
  },
  warning: {
    main: '#FCD34D',
    light: '#FFE082',
    dark: '#F59E0B',
    contrastText: '#FFFFFF',
    background: 'rgba(252, 211, 77, 0.2)',
  },
  grey: {
    "50": "#ECEFF1",
    "100": "#CFD8DC",
    "200": "#B0BEC5",
    "300": "#90A4AE",
    "400": "#78909C",
    "500": "#607D8B",
    "600": "#546E7A",
    "700": "#455A64",
    "800": "#37474F",
    "900": "#263238",
  },
  background: {
    dark: {
      default: 'rgba(26, 28, 30, 0.7)',
      paper: 'rgba(26, 28, 30, 0.95)',
      hover: 'rgba(255, 255, 255, 0.07)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    light: {
      default: 'rgba(255, 255, 255, 0.95)',
      paper: 'rgba(248, 250, 252, 0.95)',
      hover: 'rgba(0, 0, 0, 0.04)',
      border: 'rgba(0, 0, 0, 0.1)',
    }
  },
  text: {
    dark: {
      primary: 'rgba(255, 255, 255, 0.9)',
      secondary: 'rgba(255, 255, 255, 0.7)', 
      disabled: 'rgba(255, 255, 255, 0.5)'
    },
    light: {
      primary: 'rgba(0, 0, 0, 0.9)',
      secondary: 'rgba(0, 0, 0, 0.7)',
      disabled: 'rgba(0, 0, 0, 0.5)'
    }
  },
  button: {
    dark: {
      background: '#4B5563',
      hover: '#374151',
      disabled: '#1F2937'
    },
    light: {
      background: '#E5E7EB',
      hover: '#D1D5DB',
      disabled: '#F3F4F6'
    }
  }
};
