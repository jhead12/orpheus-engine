# Peak and RMS Meters Implementation

## Overview

The Orpheus Engine now supports both **Peak** and **RMS** (Root Mean Square) level indicators in its mixer meters, providing more comprehensive audio level monitoring for professional audio production.

## What's New

### Peak Meters
- **Peak meters** show the instantaneous maximum amplitude of the audio signal
- Fast response time to capture brief audio spikes
- Helps prevent digital clipping and distortion
- Represented as bright colored bars that respond quickly to audio transients

### RMS Meters  
- **RMS meters** show the average power/loudness of the audio signal over time
- Slower response time, providing a more stable indication of perceived loudness
- Better representation of how loud the audio actually sounds to listeners
- Displayed as semi-transparent background indicators behind the peak meters

## Visual Design

### Color Coding
Both peak and RMS meters use the same color thresholds but with different visual treatments:

- **Green** (0-60%): Safe operating levels
- **Yellow** (60-85%): Moderate levels, approaching limits
- **Red** (85-100%): High levels, risk of clipping

### RMS Visual Treatment
- Semi-transparent overlays behind peak meters
- Dynamic color matching based on signal level
- Smoother animation and slower decay than peak meters

## Technical Implementation

### Enhanced MeterData Interface
```typescript
interface MeterData {
  value: number;    // Peak level (0-1)
  peak: number;     // Peak hold value (0-1)
  rms: number;      // RMS level (0-1)
  clip: boolean;    // Clipping indicator
}
```

### OrpheusMeter Component
- Supports both single channel and stereo display
- `showPeaks` prop to enable/disable peak hold indicators
- `showRms` prop to enable/disable RMS background indicators
- Accepts both single values and arrays for stereo operation

### Meter Context Updates
- Enhanced `setTrackLevel()` and `setMasterLevel()` functions
- Support for passing both peak and RMS values
- Automatic RMS calculation simulation in meter synchronizer
- Independent decay rates for peak and RMS values

## Usage Examples

### Basic Usage with RMS
```tsx
<OrpheusMeter
  value={[0.7, 0.65]}           // Peak levels for L/R channels
  rmsValue={[0.5, 0.45]}        // RMS levels for L/R channels
  showPeaks={true}              // Show peak hold indicators
  showRms={true}                // Show RMS background
  stereo={true}                 // Stereo display
/>
```

### Disabling RMS Display
```tsx
<OrpheusMeter
  value={0.8}
  showRms={false}               // Only show peak meters
/>
```

## Benefits for Audio Production

1. **Better Level Monitoring**: Peak and RMS together provide complete picture of audio levels
2. **Loudness Awareness**: RMS helps understand perceived loudness vs. technical peaks
3. **Professional Workflow**: Industry-standard metering approach used in professional DAWs
4. **Improved Mixing**: Better decision-making for compression, limiting, and level balancing

## Files Modified

- `src/contexts/MeterContext.tsx` - Enhanced meter data interface and decay
- `src/components/ui/OrpheusMeter.tsx` - Added RMS display support
- `src/components/ui/theme.ts` - Added RMS-specific color constants
- `src/screens/workstation/components/TrackMeter.tsx` - Updated to pass RMS values
- `src/screens/workstation/components/MeterSynchronizer.tsx` - RMS simulation
- `docs/PEAK_RMS_METERS.md` - This documentation

## Future Enhancements

- Integration with real audio analysis (FFT-based RMS calculation)
- User preferences for meter ballistics and hold times
- VU meter style RMS display options
- Integration with professional broadcast standards (EBU R128, LUFS)
