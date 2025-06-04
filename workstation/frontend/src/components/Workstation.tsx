import React, { useMemo, useEffect, useState } from "react"
import { Box, Typography, Container } from "@mui/material"
import Editor from "../screens/workstation/Editor"
import PaneResize from "./PaneResize"

interface WorkstationProps {
  isDesktopMode: boolean;
}

/**
 * Main Workstation Component for Frontend Workspace
 * Simplified version for web-only usage
 */
export default function Workstation({ isDesktopMode }: WorkstationProps) {
  const [workstationReady, setWorkstationReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Initializing...");

  // Initialize workstation
  useEffect(() => {
    console.log('🎵 Initializing Orpheus Engine Workstation (Web Mode)');
    
    // Simple initialization for web mode
    setTimeout(() => {
      setWorkstationReady(true);
      setStatusMessage("Ready");
    }, 1000);
  }, []);

  if (!workstationReady) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Typography variant="h6">{statusMessage}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Editor />
      </Box>
    </Box>
  );
}
