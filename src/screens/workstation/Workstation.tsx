import { useMemo } from "react";
import Editor, { AudioAnalysisProvider } from "./Editor";
import { WorkstationProvider } from "../../contexts/WorkstationContext";
import { SidePanel } from "../../components/workstation";
import { useTheme } from "@mui/material";

export default function Workstation() {
  const theme = useTheme();

  const workspaceStyle = useMemo(
    () => ({
      display: "flex",
      height: "100vh",
      width: "100vw",
      backgroundColor: theme.palette.background.default,
    }),
    [theme]
  );

  return (
    <WorkstationProvider>
      <AudioAnalysisProvider>
        <div style={workspaceStyle}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Editor />
          </div>
          <SidePanel />
        </div>
      </AudioAnalysisProvider>
    </WorkstationProvider>
  );
}