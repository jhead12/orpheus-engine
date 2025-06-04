import React from 'react';

// Export all workstation screen components
export const TrackComponent = () => null;
export const RegionComponent = () => null;
export const TimelineRulerGrid = () => null;
export const Lane = () => null;
export const ZoomControls = () => null;
export const AudioAnalysisPanel = ({ type, clip }: { type: any; clip: any }) => React.createElement('div', {}, `Audio Analysis Panel - Type: ${type}, Clip: ${clip?.name || 'None'}`);
export const Playhead = () => null;
export const TrackIcon = () => null;
export const SortableList = ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children);
export const SortableListItem = ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children);
export const SyncScroll = ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children);
export const SyncScrollPane = ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children);
export const Scrollbar = () => null;
export const WindowAutoScroll = () => null;
