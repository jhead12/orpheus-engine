# Component Overlap Fixes

## Overview
This document outlines the fixes applied to resolve component overlapping issues in the Orpheus Engine DAW interface.

## Issues Identified
1. **Inconsistent Z-Index Values**: Multiple z-index values were hardcoded throughout components without following a standardized hierarchy
2. **Bottom Panel Overlap**: The fixed bottom panel was overlapping with main content and right panel on mobile
3. **Right Panel Overlap**: The mobile right panel drawer could overlap with the bottom panel
4. **Missing Content Padding**: Main content area lacked proper padding to account for fixed positioned panels

## Solutions Implemented

### 1. Standardized Z-Index Hierarchy
Updated `theme.ts` with a comprehensive z-index system:

```typescript
export const Z_INDEX = {
  background: 1,           // Base elements
  leftPanel: 5,           // Track list and project browser
  timeline: 10,           // Timeline and transport controls
  rightPanelBackdrop: 15, // Mobile backdrop overlay
  transportControls: 20,  // Transport controls bar
  rightPanel: 25,         // Media browser and mixer panel
  bottomPanel: 30,        // Bottom panel (mixer/track detail)
  rightPanelCloseButton: 35, // Close button for right panel
  modal: 40,              // Modal dialogs
  tooltip: 50,            // Tooltips and popovers
};
```

### 2. Updated Component Z-Index Usage
Replaced all hardcoded z-index values in `Workstation.tsx` and `BottomPanel.tsx` with standardized constants:

- **Transport Controls**: `Z_INDEX.transportControls` (20)
- **Left Panel (Mixer)**: `Z_INDEX.leftPanel` (5)
- **Right Panel**: `Z_INDEX.rightPanel` on mobile, `Z_INDEX.background` on desktop
- **Right Panel Backdrop**: `Z_INDEX.rightPanelBackdrop` (15)
- **Right Panel Close Button**: `Z_INDEX.rightPanelCloseButton` (35)
- **Bottom Panel**: `Z_INDEX.bottomPanel` (30)

### 3. Content Overlap Prevention
Added dynamic padding to main content area to prevent overlap with bottom panel:

```typescript
paddingBottom: showBottomPanel ? `${SIZES.bottomPanelHeight}px` : 0,
transition: 'padding-bottom 0.3s ease-in-out',
```

### 4. Mobile Panel Positioning
Updated right panel positioning on mobile to account for bottom panel:

```typescript
bottom: { 
  xs: showBottomPanel ? `${SIZES.bottomPanelHeight}px` : 0, 
  md: 'auto', 
}, // Adjust bottom position when bottom panel is visible
```

## Benefits

### Visual Consistency
- All components now follow a predictable stacking order
- No more unexpected overlapping or hidden UI elements
- Smooth transitions between panel states

### Mobile Experience
- Right panel properly overlays as a drawer without hiding critical UI
- Bottom panel no longer overlaps with content or other panels
- Proper spacing maintained in all responsive breakpoints

### Maintainability
- Centralized z-index management in theme constants
- Easy to adjust hierarchy by modifying theme values
- Clear documentation of stacking relationships

## Files Modified

1. **`/components/ui/theme.ts`**
   - Added comprehensive `Z_INDEX` object with standardized values
   - Documented the purpose of each z-index level

2. **`/screens/workstation/Workstation.tsx`**
   - Replaced all hardcoded z-index values with theme constants
   - Added dynamic padding for bottom panel overlap prevention
   - Updated mobile right panel positioning logic

3. **`/screens/workstation/components/BottomPanel.tsx`**
   - Updated z-index to use `Z_INDEX.bottomPanel` constant
   - Ensured proper import of theme constants

## Testing Recommendations

1. **Desktop Layout**: Verify all panels display correctly at various screen sizes
2. **Mobile Portrait**: Test right panel drawer behavior with and without bottom panel
3. **Mobile Landscape**: Ensure proper spacing and no overlap in landscape orientation
4. **Panel Combinations**: Test all combinations of open/closed panels
5. **Responsive Transitions**: Verify smooth transitions when resizing browser window

## Additional Z-Index Conflicts Fixed

### Header Component Z-Index Issue
**Problem**: The Header component containing the project title ("my_project1") had a hardcoded `zIndex: 19` that was conflicting with our standardized hierarchy.

**Solution**: 
- Added Z_INDEX import to Header component
- Updated header z-index to use `Z_INDEX.transportControls` (20)
- Ensures proper stacking with transport controls

### Tooltip Component Z-Index Issue  
**Problem**: Tooltip component had hardcoded `zIndex: 24` causing conflicts with right panel (25).

**Solution**:
- Added Z_INDEX import to Tooltip component  
- Updated tooltip z-index to use `Z_INDEX.tooltip` (200)
- Increased modal and tooltip z-index values for better separation

### Updated Z-Index Values
```typescript
export const Z_INDEX = {
  background: 1,           // Base elements
  leftPanel: 5,           // Track list and project browser
  timeline: 10,           // Timeline and transport controls
  rightPanelBackdrop: 15, // Mobile backdrop overlay
  transportControls: 20,  // Transport controls bar and header
  rightPanel: 25,         // Media browser and mixer panel
  bottomPanel: 30,        // Bottom panel (mixer/track detail)
  rightPanelCloseButton: 35, // Close button for right panel
  modal: 100,             // Modal dialogs (increased spacing)
  tooltip: 200,           // Tooltips and popovers (top layer)
};
```

## Files Modified (Additional)

4. **`/screens/workstation/components/Header.tsx`**
   - Added Z_INDEX import from theme
   - Updated hardcoded `zIndex: 19` to `Z_INDEX.transportControls`
   - Fixed project title overlapping transport controls

5. **`/components/widgets/Tooltip.tsx`**
   - Added Z_INDEX import from theme  
   - Updated hardcoded `zIndex: 24` to `Z_INDEX.tooltip`
   - Ensures tooltips appear above all other UI elements

## Remaining Hardcoded Z-Index Values

The following files still contain hardcoded z-index values that may need attention in future iterations:
- `Editor.tsx` - Multiple z-index values (1, 2, 3, 5)
- `Lane.tsx` - Various z-index values (0, 13, 17, 18, 19, 20)
- `ClipComponent.tsx` - Dynamic z-index based on selection (14, 15)
- `PaneResize.tsx` - Z-index value (20)
- `DAWEditor.tsx` - CSS z-index values (2)
- `Track.tsx` - CSS z-index value (2)

These components use z-index for internal layering and may require more detailed analysis to ensure they don't conflict with the main UI hierarchy.
