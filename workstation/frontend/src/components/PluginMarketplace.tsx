/**
 * Plugin Marketplace Component
 * Provides UI for discovering, installing, and managing plugins for external developers
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  IconButton,
  Rating,
  Alert,
  Snackbar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search as SearchIcon,
  GetApp as InstallIcon,
  Delete as UninstallIcon,
  Settings as ConfigureIcon,
  CloudUpload as PublishIcon,
  Code as CodeIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as InstalledIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
  GitHub as GitHubIcon,
  Language as WebIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

import {
  usePlugins,
  usePluginSearch,
  usePluginOperations,
  usePluginMarketplace,
  usePluginValidation,
  useExternalPluginDevelopment,
  Plugin,
  PluginRecommendation,
} from '../services/plugins/graphql/hooks';

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

interface PluginCardProps {
  plugin: Plugin;
  onInstall?: (plugin: Plugin) => void;
  onUninstall?: (plugin: Plugin) => void;
  onConfigure?: (plugin: Plugin) => void;
  onRate?: (plugin: Plugin, rating: number, review?: string) => void;
  isInstalled?: boolean;
  showActions?: boolean;
}

function PluginCard({ 
  plugin, 
  onInstall, 
  onUninstall, 
  onConfigure, 
  onRate,
  isInstalled = false,
  showActions = true 
}: PluginCardProps) {
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');

  const handleRate = () => {
    if (onRate && userRating > 0) {
      onRate(plugin, userRating, userReview);
      setRatingDialogOpen(false);
      setUserRating(0);
      setUserReview('');
    }
  };

  const getStatusColor = (status: any) => {
    if (status.installed && status.enabled) return 'success';
    if (status.installed && !status.enabled) return 'warning';
    return 'default';
  };

  const getStatusText = (status: any) => {
    if (status.installed && status.enabled) return 'Active';
    if (status.installed && !status.enabled) return 'Disabled';
    return 'Not Installed';
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
            <Typography variant="h6" component="h3" noWrap>
              {plugin.name}
            </Typography>
            <Chip 
              label={getStatusText(plugin.status)}
              color={getStatusColor(plugin.status) as any}
              size="small"
              icon={plugin.status.installed ? <InstalledIcon /> : undefined}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            v{plugin.version} by {plugin.author}
          </Typography>
          
          <Typography variant="body2" sx={{ mb: 2, minHeight: 40 }}>
            {plugin.description}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Chip label={plugin.category} size="small" variant="outlined" />
            {plugin.rating && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Rating value={plugin.rating} precision={0.1} size="small" readOnly />
                <Typography variant="caption">
                  ({plugin.downloads || 0})
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
            {plugin.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
            {plugin.tags.length > 3 && (
              <Chip label={`+${plugin.tags.length - 3} more`} size="small" variant="outlined" />
            )}
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Formats: {plugin.supportedFormats.join(', ')}
          </Typography>
        </CardContent>
        
        {showActions && (
          <CardActions>
            {!isInstalled ? (
              <Button
                size="small"
                startIcon={<InstallIcon />}
                onClick={() => onInstall?.(plugin)}
              >
                Install
              </Button>
            ) : (
              <>
                <Button
                  size="small"
                  startIcon={<ConfigureIcon />}
                  onClick={() => onConfigure?.(plugin)}
                >
                  Configure
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<UninstallIcon />}
                  onClick={() => onUninstall?.(plugin)}
                >
                  Uninstall
                </Button>
              </>
            )}
            
            {plugin.homepage && (
              <IconButton
                size="small"
                component="a"
                href={plugin.homepage}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LaunchIcon />
              </IconButton>
            )}
            
            <Button
              size="small"
              startIcon={<StarIcon />}
              onClick={() => setRatingDialogOpen(true)}
            >
              Rate
            </Button>
          </CardActions>
        )}
      </Card>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)}>
        <DialogTitle>Rate {plugin.name}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Box>
              <Typography component="legend">Rating</Typography>
              <Rating
                value={userRating}
                onChange={(_, value) => setUserRating(value || 0)}
              />
            </Box>
            <TextField
              label="Review (optional)"
              multiline
              rows={3}
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRate} disabled={userRating === 0}>
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

interface InstallPluginDialogProps {
  open: boolean;
  onClose: () => void;
  onInstall: (source: string, type: 'npm' | 'github' | 'url') => void;
}

function InstallPluginDialog({ open, onClose, onInstall }: InstallPluginDialogProps) {
  const [source, setSource] = useState('');
  const [installType, setInstallType] = useState<'npm' | 'github' | 'url'>('npm');
  const { validate } = usePluginValidation();
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!source.trim()) return;
    
    setIsValidating(true);
    try {
      let fullSource = source;
      switch (installType) {
        case 'npm':
          fullSource = `npm:${source}`;
          break;
        case 'github':
          fullSource = `github:${source}`;
          break;
        case 'url':
        default:
          fullSource = source;
          break;
      }
      
      const result = await validate(fullSource);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [error instanceof Error ? error.message : 'Validation failed'],
        warnings: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleInstall = () => {
    if (validationResult?.valid && source.trim()) {
      onInstall(source.trim(), installType);
      setSource('');
      setValidationResult(null);
      onClose();
    }
  };

  const getPlaceholder = () => {
    switch (installType) {
      case 'npm':
        return 'package-name or @scope/package-name';
      case 'github':
        return 'username/repository or username/repository#tag';
      case 'url':
        return 'https://example.com/plugin.js';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Install External Plugin</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={3} pt={1}>
          <FormControl fullWidth>
            <InputLabel>Installation Source</InputLabel>
            <Select
              value={installType}
              onChange={(e) => setInstallType(e.target.value as any)}
              label="Installation Source"
            >
              <MenuItem value="npm">
                <Box display="flex" alignItems="center" gap={1}>
                  <BusinessIcon fontSize="small" />
                  NPM Package
                </Box>
              </MenuItem>
              <MenuItem value="github">
                <Box display="flex" alignItems="center" gap={1}>
                  <GitHubIcon fontSize="small" />
                  GitHub Repository
                </Box>
              </MenuItem>
              <MenuItem value="url">
                <Box display="flex" alignItems="center" gap={1}>
                  <WebIcon fontSize="small" />
                  Direct URL
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Plugin Source"
            placeholder={getPlaceholder()}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            fullWidth
            helperText={
              installType === 'npm' ? 'Enter NPM package name (e.g., @orpheus/audio-plugin)' :
              installType === 'github' ? 'Enter GitHub repository (e.g., username/plugin-repo)' :
              'Enter direct URL to plugin file'
            }
          />

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={handleValidate}
              disabled={!source.trim() || isValidating}
              startIcon={isValidating ? <CircularProgress size={16} /> : <CodeIcon />}
            >
              Validate Plugin
            </Button>
          </Box>

          {validationResult && (
            <Box>
              {validationResult.valid ? (
                <Alert severity="success">
                  Plugin is valid and ready for installation
                  {validationResult.metadata && (
                    <Box mt={1}>
                      <Typography variant="body2">
                        <strong>{validationResult.metadata.name}</strong> v{validationResult.metadata.version}
                      </Typography>
                      <Typography variant="caption">
                        {validationResult.metadata.description}
                      </Typography>
                    </Box>
                  )}
                </Alert>
              ) : (
                <Alert severity="error">
                  Plugin validation failed
                  <Box component="ul" mt={1} mb={0}>
                    {validationResult.errors?.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </Box>
                </Alert>
              )}
              
              {validationResult.warnings?.length > 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Warnings:
                  <Box component="ul" mt={1} mb={0}>
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </Box>
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleInstall}
          disabled={!validationResult?.valid}
          variant="contained"
          startIcon={<InstallIcon />}
        >
          Install Plugin
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export interface PluginMarketplaceProps {
  onClose?: () => void;
  exportOptions?: any; // For plugin recommendations
}

export default function PluginMarketplace({ onClose, exportOptions }: PluginMarketplaceProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [installDialogOpen, setInstallDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Hooks
  const { plugins: installedPlugins, loading: installedLoading, refetch: refetchInstalled } = usePlugins();
  const { search, results: searchResults, loading: searchLoading } = usePluginSearch();
  const { registry, loading: registryLoading, rate } = usePluginMarketplace();
  const operations = usePluginOperations();
  const { testPlugin } = useExternalPluginDevelopment();

  // Handle search
  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      await search(searchQuery, { limit: 20 });
    }
  }, [search, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(handleSearch, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, handleSearch]);

  // Plugin operations
  const handleInstallPlugin = async (plugin: Plugin) => {
    try {
      const result = await operations.install(`marketplace:${plugin.id}`);
      if (result.success) {
        setSnackbar({ open: true, message: `${plugin.name} installed successfully!`, severity: 'success' });
        refetchInstalled();
      } else {
        setSnackbar({ open: true, message: result.error || 'Installation failed', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Installation failed', severity: 'error' });
    }
  };

  const handleInstallFromSource = async (source: string, type: 'npm' | 'github' | 'url') => {
    try {
      // First test the plugin
      const testResult = await testPlugin(source);
      if (testResult.success) {
        setSnackbar({ 
          open: true, 
          message: `Plugin from ${type} installed successfully!`, 
          severity: 'success' 
        });
        refetchInstalled();
      } else {
        setSnackbar({ 
          open: true, 
          message: `Installation failed: ${testResult.errors.join(', ')}`, 
          severity: 'error' 
        });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Installation failed', severity: 'error' });
    }
  };

  const handleUninstallPlugin = async (plugin: Plugin) => {
    try {
      const result = await operations.uninstall(plugin.id);
      if (result.success) {
        setSnackbar({ open: true, message: `${plugin.name} uninstalled successfully!`, severity: 'success' });
        refetchInstalled();
      } else {
        setSnackbar({ open: true, message: result.error || 'Uninstallation failed', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Uninstallation failed', severity: 'error' });
    }
  };

  const handleConfigurePlugin = (plugin: Plugin) => {
    setSelectedPlugin(plugin);
    setConfigDialogOpen(true);
  };

  const handleRatePlugin = async (plugin: Plugin, rating: number, review?: string) => {
    try {
      const result = await rate(plugin.id, rating, review);
      if (result.success) {
        setSnackbar({ open: true, message: 'Rating submitted successfully!', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: result.error || 'Rating failed', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Rating failed', severity: 'error' });
    }
  };

  const isPluginInstalled = (pluginId: string) => {
    return installedPlugins.some(p => p.id === pluginId);
  };

  const categories = ['storage', 'blockchain', 'dapp', 'utility', 'export', 'cloud', 'local'];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Plugin Marketplace
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Discover, install, and manage audio export plugins for Orpheus Engine
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Installed Plugins" />
          <Tab label="Browse Marketplace" />
          <Tab label="Install External" />
          <Tab label="Developer Tools" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Installed Plugins */}
        <TabPanel value={activeTab} index={0}>
          <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
            <Typography variant="h6">Installed Plugins ({installedPlugins.length})</Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={() => refetchInstalled()}
              disabled={installedLoading}
            >
              Refresh
            </Button>
          </Box>

          {installedLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : installedPlugins.length === 0 ? (
            <Alert severity="info">
              No plugins installed. Browse the marketplace to discover new plugins!
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {installedPlugins.map((plugin) => (
                <Grid item xs={12} sm={6} md={4} key={plugin.id}>
                  <PluginCard
                    plugin={plugin}
                    onUninstall={handleUninstallPlugin}
                    onConfigure={handleConfigurePlugin}
                    onRate={handleRatePlugin}
                    isInstalled={true}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Browse Marketplace */}
        <TabPanel value={activeTab} index={1}>
          <Box display="flex" gap={2} mb={3}>
            <TextField
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon />,
              }}
              fullWidth
            />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {searchLoading || registryLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {(searchQuery ? searchResults.plugins : registry?.plugins || [])
                .filter(plugin => !categoryFilter || plugin.category === categoryFilter)
                .map((plugin) => (
                  <Grid item xs={12} sm={6} md={4} key={plugin.id}>
                    <PluginCard
                      plugin={plugin}
                      onInstall={handleInstallPlugin}
                      onRate={handleRatePlugin}
                      isInstalled={isPluginInstalled(plugin.id)}
                    />
                  </Grid>
                ))}
            </Grid>
          )}
        </TabPanel>

        {/* Install External */}
        <TabPanel value={activeTab} index={2}>
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Install External Plugins
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Install plugins from NPM packages, GitHub repositories, or direct URLs.
              External plugins undergo validation before installation.
            </Typography>
          </Box>

          <Box display="flex" gap={2} mb={4}>
            <Button
              variant="contained"
              startIcon={<InstallIcon />}
              onClick={() => setInstallDialogOpen(true)}
            >
              Install from Source
            </Button>
          </Box>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Installation Guide</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                <strong>NPM Packages:</strong> Install plugins published to NPM registry
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>GitHub Repositories:</strong> Install directly from GitHub repos
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Direct URLs:</strong> Install from any accessible URL
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All external plugins are validated for security and compatibility before installation.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </TabPanel>

        {/* Developer Tools */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Plugin Development Tools
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Tools and resources for developing Orpheus Engine plugins.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Plugin SDK
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Download the official Orpheus Engine Plugin SDK with TypeScript definitions,
                    templates, and development tools.
                  </Typography>
                  <Button variant="contained" startIcon={<CodeIcon />}>
                    Download SDK
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Documentation
                  </Typography>
                  <Typography variant="body2" paragraph>
                    Complete API documentation, tutorials, and best practices for plugin development.
                  </Typography>
                  <Button variant="outlined" startIcon={<LaunchIcon />}>
                    View Docs
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>

      {/* Install Plugin Dialog */}
      <InstallPluginDialog
        open={installDialogOpen}
        onClose={() => setInstallDialogOpen(false)}
        onInstall={handleInstallFromSource}
      />

      {/* Configure Plugin Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Configure {selectedPlugin?.name}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Plugin configuration interface will be displayed here based on the plugin's
            configuration schema.
          </Typography>
          {/* Plugin-specific configuration UI would be rendered here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save Configuration</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
