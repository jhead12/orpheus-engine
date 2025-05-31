import React, { useEffect, useState } from 'react';

interface MessageProps {
  text: string;
}

const Message: React.FC<MessageProps> = ({ text }) => <div style={{ padding: 12, background: '#e0e0e0', borderRadius: 8 }}>{text}</div>;

const componentMap: Record<string, React.FC<any>> = {
  Message,
};

const DynamicComponent: React.FC = () => {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch('/api/component')
      .then((res) => res.json())
      .then(setConfig);
  }, []);

  if (!config) return <div>Loading dynamic component...</div>;
  const Comp = componentMap[config.type];
  if (!Comp) return <div>Unknown component type: {config.type}</div>;
  return <Comp {...config.props} />;
};

export default DynamicComponent;
