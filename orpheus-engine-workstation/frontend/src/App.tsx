import React, { useEffect, useState } from 'react';
import Workstation from './components/Workstation';
import { WorkstationProvider } from './contexts/WorkstationProvider';

const App: React.FC = () => {
    const [isElectron, setIsElectron] = useState(false);
    const [appVersion, setAppVersion] = useState('');

    useEffect(() => {
        // Check if running in Electron
        if (window.orpheusAPI?.isElectron) {
            setIsElectron(true);
            
            // Get app version
            window.electronAPI?.getAppVersion().then(version => {
                setAppVersion(version);
            });

            // Setup menu event listeners
            const handleNewProject = () => {
                console.log('New project requested');
                // Handle new project creation
            };

            const handleOpenProject = () => {
                console.log('Open project requested');
                // Handle project opening
            };

            const handleStartRecording = () => {
                console.log('Start recording requested');
                // Handle recording start
            };

            const handleStopRecording = () => {
                console.log('Stop recording requested');
                // Handle recording stop
            };

            // Register menu event listeners
            window.electronAPI?.onMenuNewProject(handleNewProject);
            window.electronAPI?.onMenuOpenProject(handleOpenProject);
            window.electronAPI?.onMenuStartRecording(handleStartRecording);
            window.electronAPI?.onMenuStopRecording(handleStopRecording);

            // Cleanup function
            return () => {
                window.electronAPI?.removeAllListeners('menu-new-project');
                window.electronAPI?.removeAllListeners('menu-open-project');
                window.electronAPI?.removeAllListeners('menu-start-recording');
                window.electronAPI?.removeAllListeners('menu-stop-recording');
            };
        }
    }, []);

    return (
        <WorkstationProvider>
            <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
                <header>
                    <h1>Orpheus Engine Workstation</h1>
                </header>
                <main>
                    <p>Welcome to the Orpheus Engine digital audio workstation.</p>
                    <Workstation />
                </main>
            </div>
        </WorkstationProvider>
    );
};

export default App;