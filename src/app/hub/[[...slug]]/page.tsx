// src/app/hub/[[...slug]]/page.tsx
"use client"

import React, { use } from 'react';
import HubPage from '@/hub/index';
import { HubRouter } from '@/hub/HubRouter';
import { HUB_ROUTES } from '@/hub/hub.constants';

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default function HubEntryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug || [];
  
  // Construct the active tab path from the slug
  // e.g. /hub/osint -> "/hub/osint"
  const activeTab = slug.length > 0 
    ? `/hub/${slug.join('/')}` 
    : HUB_ROUTES.ROOT;

  return (
    <HubPage>
      <HubRouter activeTab={activeTab} />
    </HubPage>
  );
}
