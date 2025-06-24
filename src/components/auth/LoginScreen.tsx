import React from 'react';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onRegister?: () => void;
  error?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister, error }) => {
  return (
    <div className="login-screen">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      {/* Simple login form implementation */}
      <div className="login-form">
        <button onClick={() => onLogin('test@example.com', 'password')}>
          Demo Login
        </button>
        {onRegister && (
          <button onClick={onRegister}>Register</button>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
