// Augment MUI component types to fix type incompatibilities
declare module "@mui/material" {
  interface IconButtonProps {
    // Add any missing props that you need to use with IconButton
    size?: "small" | "medium" | "large" | number;
    // Add other props as needed
  }

  // Add similar interfaces for other MUI components if needed
}
