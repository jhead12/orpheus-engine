import React from 'react';
import { Session, User } from '../../App.main';

interface SessionScreenProps {
  user: User;
  sessions: Session[];
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onLogout: () => void;
}

const SessionScreen: React.FC<SessionScreenProps> = ({
  user,
  sessions,
  onSessionSelect,
  onNewSession,
  onLogout
}) => {
  return (
    <div className="session-screen">
      <header className="session-header">
        <h2>Welcome, {user.name}</h2>
        <button onClick={onLogout}>Logout</button>
      </header>
      
      <div className="session-list">
        <h3>Your Sessions</h3>
        {sessions.length === 0 ? (
          <p>No sessions available. Create a new one to get started.</p>
        ) : (
          <ul>
            {sessions.map((session) => (
              <li key={session.id} onClick={() => onSessionSelect(session.id)}>
                {session.name} - Last modified: {session.lastModified.toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <button onClick={onNewSession}>Create New Session</button>
    </div>
  );
};

export default SessionScreen;
