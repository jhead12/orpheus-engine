import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  TextField,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import { usePreferences } from '../../../contexts/PreferencesContext';

const COLOR_SCHEMES = [
  { value: 'default', label: 'Default (Pink)', preview: '#ff6db8' },
  { value: 'azure', label: 'Azure (Blue)', preview: '#00b0ff' },
  { value: 'aqua', label: 'Aqua (Teal)', preview: '#00cca3' },
  { value: 'crimson', label: 'Crimson (Red)', preview: '#ff1c5c' },
  { value: 'olive', label: 'Olive (Green)', preview: '#9da800' },
  { value: 'violet', label: 'Violet (Purple)', preview: '#8e5be8' },
  { value: 'citrus', label: 'Citrus (Orange)', preview: '#fa9200' },
  { value: 'mono', label: 'Monochrome', preview: '#777777' },
];

const ColorSettings: React.FC = () => {
  const { preferences, updatePreference } = usePreferences();

  const handleColorAdjustmentChange = (key: keyof typeof preferences.colorAdjustments) => (
    _event: Event,
    value: number | number[]
  ) => {
    updatePreference('colorAdjustments', {
      ...preferences.colorAdjustments,
      [key]: Array.isArray(value) ? value[0] : value,
    });
  };

  const handleCustomColorChange = (key: keyof typeof preferences.customColors) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updatePreference('customColors', {
      ...preferences.customColors,
      [key]: event.target.value,
    });
  };

  const resetColorAdjustments = () => {
    updatePreference('colorAdjustments', {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
    });
  };

  const resetCustomColors = () => {
    updatePreference('customColors', {
      primary: '#ff6db8',
      primaryMuted: '#ffecf6',
      accent: '#00b0ff',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#2c2c2c',
    });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800 }}>
      <Typography variant="h5" gutterBottom>
        Color & Appearance Settings
      </Typography>

      {/* Color Scheme Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Color Scheme
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Preset Color Scheme</InputLabel>
            <Select
              value={preferences.colorScheme}
              label="Preset Color Scheme"
              onChange={(e) => updatePreference('colorScheme', e.target.value as any)}
            >
              {COLOR_SCHEMES.map((scheme) => (
                <MenuItem key={scheme.value} value={scheme.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: scheme.preview,
                        border: '1px solid #ccc',
                      }}
                    />
                    {scheme.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {COLOR_SCHEMES.map((scheme) => (
              <Chip
                key={scheme.value}
                label={scheme.label}
                onClick={() => updatePreference('colorScheme', scheme.value as any)}
                variant={preferences.colorScheme === scheme.value ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: preferences.colorScheme === scheme.value ? scheme.preview : 'transparent',
                  color: preferences.colorScheme === scheme.value ? 'white' : 'inherit',
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Color Adjustments */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Color Adjustments
            </Typography>
            <Button onClick={resetColorAdjustments} size="small">
              Reset
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Brightness: {preferences.colorAdjustments.brightness}%
              </Typography>
              <Slider
                value={preferences.colorAdjustments.brightness}
                onChange={handleColorAdjustmentChange('brightness')}
                min={-50}
                max={50}
                step={5}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Contrast: {preferences.colorAdjustments.contrast}%
              </Typography>
              <Slider
                value={preferences.colorAdjustments.contrast}
                onChange={handleColorAdjustmentChange('contrast')}
                min={-50}
                max={50}
                step={5}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Saturation: {preferences.colorAdjustments.saturation}%
              </Typography>
              <Slider
                value={preferences.colorAdjustments.saturation}
                onChange={handleColorAdjustmentChange('saturation')}
                min={-50}
                max={50}
                step={5}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>
                Hue Shift: {preferences.colorAdjustments.hue}°
              </Typography>
              <Slider
                value={preferences.colorAdjustments.hue}
                onChange={handleColorAdjustmentChange('hue')}
                min={-180}
                max={180}
                step={10}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Custom Colors */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Custom Colors
            </Typography>
            <Button onClick={resetCustomColors} size="small">
              Reset
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Color"
                type="color"
                value={preferences.customColors.primary}
                onChange={handleCustomColorChange('primary')}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        backgroundColor: preferences.customColors.primary,
                        border: '1px solid #ccc',
                        mr: 1,
                      }}
                    />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Primary Muted"
                type="color"
                value={preferences.customColors.primaryMuted}
                onChange={handleCustomColorChange('primaryMuted')}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        backgroundColor: preferences.customColors.primaryMuted,
                        border: '1px solid #ccc',
                        mr: 1,
                      }}
                    />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Accent Color"
                type="color"
                value={preferences.customColors.accent}
                onChange={handleCustomColorChange('accent')}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        backgroundColor: preferences.customColors.accent,
                        border: '1px solid #ccc',
                        mr: 1,
                      }}
                    />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Background Color"
                type="color"
                value={preferences.customColors.background}
                onChange={handleCustomColorChange('background')}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        backgroundColor: preferences.customColors.background,
                        border: '1px solid #ccc',
                        mr: 1,
                      }}
                    />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Surface Color"
                type="color"
                value={preferences.customColors.surface}
                onChange={handleCustomColorChange('surface')}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        backgroundColor: preferences.customColors.surface,
                        border: '1px solid #ccc',
                        mr: 1,
                      }}
                    />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Text Color"
                type="color"
                value={preferences.customColors.text}
                onChange={handleCustomColorChange('text')}
                InputProps={{
                  startAdornment: (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '4px',
                        backgroundColor: preferences.customColors.text,
                        border: '1px solid #ccc',
                        mr: 1,
                      }}
                    />
                  ),
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Custom colors will override the selected color scheme for specific elements.
              These settings are useful for creating a personalized interface.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ColorSettings;
