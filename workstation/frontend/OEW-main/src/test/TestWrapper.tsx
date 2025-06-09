import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ReactElement } from "react";

// Create a minimal theme for testing
const testTheme = createTheme({
  palette: {
    mode: "light",
  },
});

interface TestWrapperProps {
  children: ReactElement;
}

export function TestWrapper({ children }: TestWrapperProps) {
  return <ThemeProvider theme={testTheme}>{children}</ThemeProvider>;
}
