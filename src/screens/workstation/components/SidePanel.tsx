import React, { useState } from "react";
import { Track } from '@orpheus/types/core';
import styled from "styled-components";

interface StyledProps {
  $isCollapsed: boolean;
}

const PanelContainer = styled.div<StyledProps>`
  position: absolute;
  right: 0;
  height: 100%;
  background-color: #2a2a2a;
  border-left: 1px solid #3a3a3a;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  width: ${(props) => (props.$isCollapsed ? "50px" : "250px")};
  &:hover {
    width: 250px;
  }
`;

const Header = styled.div<StyledProps>`
  padding: 16px;
  font-size: 1.2em;
  border-bottom: 1px solid #3a3a3a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.$isCollapsed ? "center" : "flex-start")};
`;

const AudioList = styled.div<StyledProps>`
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  opacity: ${(props) => (props.$isCollapsed ? 0 : 1)};
  transition: opacity 0.2s ease;
  ${PanelContainer}:hover & {
    opacity: 1;
  }
`;

const AudioItem = styled.div`
  padding: 8px;
  margin: 4px 0;
  background-color: #333333;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #404040;
  }
`;

export interface AudioFile {
  id: string;
  name: string;
  duration: number;
}

interface SidePanelProps {
  audioFiles: AudioFile[];
  onAudioSelect?: (file: AudioFile) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  audioFiles = [],
  onAudioSelect,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleAudioClick = (file: AudioFile) => {
    if (onAudioSelect) {
      onAudioSelect(file);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <PanelContainer
      data-testid="side-panel"
      $isCollapsed={isCollapsed}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <Header $isCollapsed={isCollapsed}>
        {isCollapsed ? "📚" : "Audio Library"}
      </Header>
      <AudioList $isCollapsed={isCollapsed}>
        {audioFiles.map((file) => (
          <AudioItem
            key={file.id}
            onClick={() => handleAudioClick(file)}
            data-testid={`audio-item-${file.id}`}
          >
            <div>{file.name}</div>
            <div style={{ fontSize: "0.8em", color: "#888" }}>
              {formatDuration(file.duration)}
            </div>
          </AudioItem>
        ))}
      </AudioList>
    </PanelContainer>
  );
};
