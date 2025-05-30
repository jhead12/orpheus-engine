import { Box } from '@mui/material';

export default function SidePanel() {
  return (
    <Box sx={{
      width: 300,
      borderLeft: '1px solid',
      borderColor: 'divider',
      backgroundColor: 'background.paper'
    }}>
      {/* Panel content will go here */}
    </Box>
  );
}
