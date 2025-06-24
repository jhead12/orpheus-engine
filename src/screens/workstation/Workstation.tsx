import { useMemo } from 'react'; // Removed unused useState import
import Editor from './Editor';
import { Header, Mixer } from './components';
import { PaneResize } from '../../components';
import { WorkstationContext } from '../../contexts';
import { useContext } from 'react';
import { InputPane, PaneResizeData } from '../../components/PaneResize';

// Create a simpler wrapper for WorkstationContext until we fix all imports
function useWorkstation() {
  const context = useContext(WorkstationContext);

  if (!context) {
    throw new Error('useWorkstation must be used within a WorkstationProvider');
  }

  return {
    ...context,
    // Add missing properties used in this component
    showMixer: true,
    mixerHeight: 200,
    setMixerHeight: (_height: number) => {}, // Updated to accept a height parameter with underscore to avoid unused warning
  };
}

// Define the props interface for Workstation
interface WorkstationProps {
  user?: any; // Using any for now - could be properly typed from App.main.tsx
  session?: any; // Using any for now - could be properly typed from App.main.tsx
  onBackToSessions?: () => void;
  onLogout?: () => void;
}

export default function Workstation(_props: WorkstationProps) {
  // Using _props to indicate it's received but not used yet
  const { mixerHeight, setAllowMenuAndShortcuts, setMixerHeight, showMixer } =
    useWorkstation();

  const panes = useMemo(() => {
    const panes: InputPane[] = [
      {
        key: '0',
        handle: { style: { height: 2, bottom: -2 } },
        children: <Editor />,
      },
    ];

    if (showMixer)
      panes.push({
        key: '1',
        max: 450,
        min: 229,
        children: <Mixer />,
        fixed: true,
        size: mixerHeight,
      });

    return panes;
  }, [showMixer, mixerHeight]);

  function handlePaneResizeStop(data: PaneResizeData) {
    if (data.activeNext && setMixerHeight) setMixerHeight(data.activeNext.size);
    setAllowMenuAndShortcuts?.(true);
  }

  return (
    <div
      className="m-0 p-0"
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        outline: 'none',
      }}
      tabIndex={0}
    >
      <Header />
      <PaneResize
        direction="vertical"
        onPaneResize={() => setAllowMenuAndShortcuts?.(false)}
        onPaneResizeStop={handlePaneResizeStop}
        panes={panes}
        style={{
          flex: 1,
          height: 'calc(100vh - 69px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      />
    </div>
  );
}
