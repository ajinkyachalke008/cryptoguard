// src/hub/osint/index.tsx
import React, { useState } from 'react';
import { OSINTLayout } from './OSINTLayout';
import { OSINTRouter } from './OSINTRouter';

const OSINTModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tracer');

  return (
    <OSINTLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <OSINTRouter activeTab={activeTab} />
    </OSINTLayout>
  );
};

export default OSINTModule;
