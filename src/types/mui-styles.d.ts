/**
 * Declaration file for @mui/material/styles
 */
declare module '@mui/material/styles' {
  export interface Theme {
    palette: {
      primary: {
        main: string;
        light: string;
        dark: string;
        contrastText?: string;
      };
      secondary: {
        main: string;
        light: string;
        dark: string;
        contrastText?: string;
      };
      background: {
        default: string;
        paper: string;
      };
      text: {
        primary: string;
        secondary: string;
        disabled: string;
      };
      error: {
        main: string;
        light?: string;
        dark?: string;
        contrastText?: string;
      };
      warning: {
        main: string;
        light?: string;
        dark?: string;
        contrastText?: string;
      };
      success: {
        main: string;
        light?: string;
        dark?: string;
        contrastText?: string;
      };
      info?: {
        main: string;
        light?: string;
        dark?: string;
        contrastText?: string;
      };
      common?: {
        black: string;
        white: string;
      };
      mode?: 'light' | 'dark';
    };
    spacing: (factor: number) => string | number;
    transitions: {
      create: (props: string | string[], options?: object) => string;
      duration: {
        shortest: number;
        shorter: number;
        short: number;
        standard: number;
        complex: number;
        enteringScreen: number;
        leavingScreen: number;
      };
      easing: {
        easeInOut: string;
        easeOut: string;
        easeIn: string;
        sharp: string;
      };
    };
    typography: {
      fontFamily: string;
      fontSize: number;
      fontWeightLight: number;
      fontWeightRegular: number;
      fontWeightMedium: number;
      fontWeightBold: number;
      h1: object;
      h2: object;
      h3: object;
      h4: object;
      h5: object;
      h6: object;
      subtitle1: object;
      subtitle2: object;
      body1: object;
      body2: object;
      button: object;
      caption: object;
      overline: object;
    };
    shape?: {
      borderRadius: number;
    };
    breakpoints?: {
      up: (key: string | number) => string;
      down: (key: string | number) => string;
      between: (start: string | number, end: string | number) => string;
      only: (key: string) => string;
      values: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
      };
    };
  }

  export interface ThemeOptions {
    palette?: Partial<Theme['palette']>;
    spacing?: Theme['spacing'] | number;
    transitions?: Partial<Theme['transitions']>;
    typography?: Partial<Theme['typography']> | ((palette: Theme['palette']) => Partial<Theme['typography']>);
    shape?: Partial<Theme['shape']>;
    breakpoints?: Partial<Theme['breakpoints']>;
    mixins?: object;
    components?: Record<string, {
      defaultProps?: Record<string, unknown>;
      styleOverrides?: Record<string, unknown>;
      variants?: Array<{
        props: Record<string, unknown>;
        style: Record<string, unknown>;
      }>;
    }>;
  }

  export function createTheme(options?: ThemeOptions): Theme;
  
  export interface ThemeProviderProps {
    theme: Theme | ((outerTheme: Theme) => Theme);
    children: React.ReactNode;
  }

  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
}
