import React from 'react';

// Export BaseClipComponent as placeholder
export const BaseClipComponent = ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children);

// Export AudioLibrary as default export
const AudioLibrary = () => React.createElement('div', {}, 'Audio Library');
export default AudioLibrary;

// Export other common components
export const SyncScroll = ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children);
export const SyncScrollPane = ({ children }: { children: React.ReactNode }) => React.createElement('div', {}, children);
export const Scrollbar = () => null;
export const WindowAutoScroll = () => null;
export const HoldActionButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => React.createElement('button', { onClick }, children);
