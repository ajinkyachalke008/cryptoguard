// src/hub/index.tsx
import React from 'react';
import { HubLayout } from './HubLayout';

export default function HubPage({ children }: { children: React.ReactNode }) {
  return (
    <HubLayout>
      {children}
    </HubLayout>
  );
}
