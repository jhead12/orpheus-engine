import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  GetApp as InstallIcon,
  Settings as SettingsIcon,
  PlayArrow as EnableIcon,
  Stop as DisableIcon,
  Delete as UninstallIcon,
  Code as CodeIcon,
  CloudDownload as DownloadIcon,
  GitHub as GitHubIcon,
  Extension as PluginIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_PLUGINS,
  GET_PLUGIN_REGISTRY,
  INSTALL_PLUGIN,
  ENABLE_PLUGIN,
  DISABLE_PLUGIN,
  GET_PLUGIN_ANALYTICS,
} from '../services/plugins/graphql/types';

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
      id={`plugin-tabpanel-${index}`}
      aria-labelledby={`plugin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface PluginManagerProps {
  open: boolean;
  onClose: () => void;
}

export default function PluginManager({ open, onClose }: PluginManagerProps) {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedPlugin, setSelectedPlugin] = useState<any>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [pluginConfig, setPluginConfig] = useState<Record<string, any>>({});

  // GraphQL queries and mutations
  const { data: installedPlugins, loading: loadingInstalled, refetch: refetchInstalled } = useQuery(GET_PLUGINS, {
    variables: { category: categoryFilter || undefined },
    skip: !open,
  });

  const { data: pluginRegistry, loading: loadingRegistry } = useQuery(GET_PLUGIN_REGISTRY, {
    variables: { category: categoryFilter || undefined },
    skip: !open || tabValue !== 1,
  });

  const [installPlugin, { loading: installing }] = useMutation(INSTALL_PLUGIN, {
    onCompleted: () => {
      refetchInstalled();
      setSelectedPlugin(null);
    },
  });

  const [enablePlugin] = useMutation(ENABLE_PLUGIN, {
    onCompleted: () => refetchInstalled(),
  });

  const [disablePlugin] = useMutation(DISABLE_PLUGIN, {
    onCompleted: () => refetchInstalled(),
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInstallPlugin = async (plugin: any) => {
    try {
      await installPlugin({
        variables: {
          input: {
            source: plugin.repository || plugin.downloadUrl,
            name: plugin.name,
            category: plugin.category,
            config: Object.entries(pluginConfig).map(([key, value]) => ({
              key,
              value: String(value),
              type: typeof value,
            })),
          },
        },
      });
    } catch (error) {
      console.error('Failed to install plugin:', error);
    }
  };

  const handleEnablePlugin = async (pluginId: string) => {
    try {
      await enablePlugin({ variables: { plugin_id: pluginId } });
    } catch (error) {
      console.error('Failed to enable plugin:', error);
    }
  };

  const handleDisablePlugin = async (pluginId: string) => {
    try {
      await disablePlugin({ variables: { plugin_id: pluginId } });
    } catch (error) {
      console.error('Failed to disable plugin:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enabled':
        return <CheckIcon color="success" />;
      case 'disabled':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <PluginIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enabled':
        return 'success';
      case 'disabled':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const InstalledPluginsTab = () => {
    const plugins = installedPlugins?.plugins || [];
    const filteredPlugins = plugins.filter((plugin: any) =>
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search installed plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="audio_input">Audio Input</MenuItem>
              <MenuItem value="audio_processing">Audio Processing</MenuItem>
              <MenuItem value="export">Export</MenuItem>
              <MenuItem value="storage">Storage</MenuItem>
              <MenuItem value="blockchain">Blockchain</MenuItem>
              <MenuItem value="analysis">Analysis</MenuItem>
              <MenuItem value="visualization">Visualization</MenuItem>
              <MenuItem value="utility">Utility</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loadingInstalled ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredPlugins.map((plugin: any) => (
              <Grid item xs={12} md={6} lg={4} key={plugin.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {getStatusIcon(plugin.status)}
                      <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                        {plugin.name}
                      </Typography>
                      <Chip
                        label={plugin.status}
                        color={getStatusColor(plugin.status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plugin.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Chip label={plugin.category} size="small" variant="outlined" />
                      <Chip label={`v${plugin.version}`} size="small" variant="outlined" />
                      {plugin.backend_port && (
                        <Chip label={`Port: ${plugin.backend_port}`} size="small" variant="outlined" />
                      )}
                    </Box>
                    {plugin.supported_formats?.length > 0 && (
                      <Typography variant="caption" display="block">
                        Formats: {plugin.supported_formats.join(', ')}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    {plugin.status === 'enabled' ? (
                      <Button
                        size="small"
                        startIcon={<DisableIcon />}
                        onClick={() => handleDisablePlugin(plugin.id)}
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        startIcon={<EnableIcon />}
                        onClick={() => handleEnablePlugin(plugin.id)}
                        color="primary"
                      >
                        Enable
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedPlugin(plugin);
                        setConfigDialogOpen(true);
                      }}
                    >
                      <SettingsIcon />
                    </IconButton>
                    {plugin.metadata?.repository && (
                      <IconButton
                        size="small"
                        component="a"
                        href={plugin.metadata.repository}
                        target="_blank"
                      >
                        <GitHubIcon />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const MarketplaceTab = () => {
    const plugins = pluginRegistry?.pluginRegistry?.plugins || [];
    const filteredPlugins = plugins.filter((plugin: any) =>
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="audio_input">Audio Input</MenuItem>
              <MenuItem value="audio_processing">Audio Processing</MenuItem>
              <MenuItem value="export">Export</MenuItem>
              <MenuItem value="storage">Storage</MenuItem>
              <MenuItem value="blockchain">Blockchain</MenuItem>
              <MenuItem value="analysis">Analysis</MenuItem>
              <MenuItem value="visualization">Visualization</MenuItem>
              <MenuItem value="utility">Utility</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loadingRegistry ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredPlugins.map((plugin: any) => (
              <Grid item xs={12} md={6} lg={4} key={plugin.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PluginIcon sx={{ mr: 1 }} />
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {plugin.name}
                      </Typography>
                      {plugin.verified && (
                        <Chip label="Verified" color="primary" size="small" />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {plugin.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      <Chip label={plugin.category} size="small" variant="outlined" />
                      <Chip label={`v${plugin.version}`} size="small" variant="outlined" />
                      {plugin.downloads && (
                        <Chip
                          label={`${plugin.downloads} downloads`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    {plugin.rating && (
                      <Typography variant="caption" display="block">
                        Rating: {plugin.rating}/5 ⭐
                      </Typography>
                    )}
                    <Typography variant="caption" display="block">
                      By {plugin.metadata?.author || 'Unknown'}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={installing ? <CircularProgress size={16} /> : <InstallIcon />}
                      onClick={() => handleInstallPlugin(plugin)}
                      disabled={installing}
                      color="primary"
                    >
                      Install
                    </Button>
                    {plugin.metadata?.homepage && (
                      <Button
                        size="small"
                        component="a"
                        href={plugin.metadata.homepage}
                        target="_blank"
                        startIcon={<CodeIcon />}
                      >
                        Docs
                      </Button>
                    )}
                    {plugin.metadata?.repository && (
                      <IconButton
                        size="small"
                        component="a"
                        href={plugin.metadata.repository}
                        target="_blank"
                      >
                        <GitHubIcon />
                      </IconButton>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const DeveloperTab = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Plugin Development Guide
        </Typography>
        <Typography variant="body2" gutterBottom>
          Create plugins for the Orpheus Engine using our GraphQL API and service management system.
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Quick Start
          </Typography>
          <Typography variant="body2" paragraph>
            1. Clone the plugin template: <code>git clone https://github.com/orpheus-engine/plugin-template</code>
          </Typography>
          <Typography variant="body2" paragraph>
            2. Install dependencies: <code>npm install</code>
          </Typography>
          <Typography variant="body2" paragraph>
            3. Develop your plugin using the provided APIs
          </Typography>
          <Typography variant="body2" paragraph>
            4. Test locally: <code>npm run dev</code>
          </Typography>
          <Typography variant="body2" paragraph>
            5. Publish: <code>npm run publish</code>
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📚 Available APIs
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Audio Input API" secondary="Access audio devices and streams" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Timeline API" secondary="Interact with audio timeline" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Export API" secondary="Export audio in various formats" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Storage API" secondary="Store and retrieve data" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="GraphQL API" secondary="Full backend integration" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔧 Plugin Types
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Audio Input Plugins"
                    secondary="Support new audio hardware and protocols"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Processing Plugins"
                    secondary="Add real-time audio effects and analysis"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Export Plugins"
                    secondary="Support new file formats and cloud services"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Storage Plugins"
                    secondary="Integrate with databases and cloud storage"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Blockchain Plugins"
                    secondary="Integrate with Web3 and DeFi protocols"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Plugin Requirements
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Required Files:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="package.json" secondary="Plugin metadata and dependencies" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="main.js/ts" secondary="Plugin entry point" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="README.md" secondary="Documentation" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Optional Files:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="config.json" secondary="Default configuration" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="backend/" secondary="Backend service code" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="ui/" secondary="Custom UI components" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const ConfigDialog = () => (
    <Dialog open={configDialogOpen} onClose={() => setConfigDialogOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>Configure {selectedPlugin?.name}</DialogTitle>
      <DialogContent>
        {selectedPlugin?.configuration?.map((config: any) => (
          <Box key={config.key} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label={config.key}
              value={pluginConfig[config.key] || config.value || ''}
              onChange={(e) =>
                setPluginConfig((prev) => ({ ...prev, [config.key]: e.target.value }))
              }
              helperText={config.description}
              required={config.required}
              type={config.type === 'number' ? 'number' : 'text'}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
        <Button
          onClick={() => {
            // Save configuration logic here
            setConfigDialogOpen(false);
          }}
          variant="contained"
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PluginIcon sx={{ mr: 1 }} />
          Plugin Manager
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab
              label={
                <Badge
                  badgeContent={installedPlugins?.plugins?.length || 0}
                  color="primary"
                  max={99}
                >
                  Installed
                </Badge>
              }
            />
            <Tab label="Marketplace" />
            <Tab label="Developer" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <InstalledPluginsTab />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <MarketplaceTab />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <DeveloperTab />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      <ConfigDialog />
    </Dialog>
  );
}
