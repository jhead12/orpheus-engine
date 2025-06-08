import React, { useContext, useState } from 'react';
import { 
  Box, 
  Tab, 
  Tabs, 
  Typography, 
  Button, 
  Dialog, 
  DialogActions,
  DialogContent, 
  DialogTitle 
} from '@mui/material';
import { SettingsContext } from '../../services/settings';
import GeneralSettings from './tabs/GeneralSettings.js';
import AudioSettings from './tabs/AudioSettings.js';
import MIDISettings from './tabs/MIDISettings.js';
import InterfaceSettings from './tabs/InterfaceSettings.js';
import PluginSettings from './tabs/PluginSettings.js';
import ColorSettings from './tabs/ColorSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      style={{ padding: 16 }}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  initialTab?: number;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  open,
  onClose,
  initialTab = 0
}) => {
  const { resetSettings } = useContext(SettingsContext)!;
  const [tabValue, setTabValue] = useState(initialTab);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Update tab when initialTab changes or dialog opens
  React.useEffect(() => {
    if (open) {
      setTabValue(initialTab);
    }
  }, [open, initialTab]);

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleReset = () => {
    setConfirmResetOpen(true);
  };

  const handleConfirmReset = () => {
    resetSettings();
    setConfirmResetOpen(false);
  };

  const handleCancelReset = () => {
    setConfirmResetOpen(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="settings-dialog-title"
      >
        <DialogTitle id="settings-dialog-title">Settings</DialogTitle>
        
        <Tabs
          value={tabValue}
          onChange={handleChangeTab}
          aria-label="settings tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="General" id="settings-tab-0" aria-controls="settings-tabpanel-0" />
          <Tab label="Audio" id="settings-tab-1" aria-controls="settings-tabpanel-1" />
          <Tab label="MIDI" id="settings-tab-2" aria-controls="settings-tabpanel-2" />
          <Tab label="Colors" id="settings-tab-3" aria-controls="settings-tabpanel-3" />
          <Tab label="Interface" id="settings-tab-4" aria-controls="settings-tabpanel-4" />
          <Tab label="Plugins" id="settings-tab-5" aria-controls="settings-tabpanel-5" />
        </Tabs>
        
        <DialogContent dividers>
          <TabPanel value={tabValue} index={0}>
            <GeneralSettings />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <AudioSettings />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <MIDISettings />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <ColorSettings />
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <InterfaceSettings />
          </TabPanel>
          
          <TabPanel value={tabValue} index={5}>
            <PluginSettings />
          </TabPanel>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleReset} color="error">
            Reset All Settings
          </Button>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog
        open={confirmResetOpen}
        onClose={handleCancelReset}
        aria-labelledby="reset-dialog-title"
      >
        <DialogTitle id="reset-dialog-title">Reset Settings</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReset} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmReset} color="error" autoFocus>
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SettingsPanel;
