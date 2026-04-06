'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import FoundingMemberPopup from '@/components/ui/FoundingMemberPopup';
import { ActiveRoleProvider } from '@/context/ActiveRoleContext';
import FloatingFeedbackWidget from '@/components/sections/FloatingFeedbackWidget';

const GrybotWidget = dynamic(() => import('@/components/sections/GrybotWidget'), {
  ssr: false,
  loading: () => null,
});

export default function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <ActiveRoleProvider>
      {children}
      <FoundingMemberPopup />
      <GrybotWidget portal="public-website" bottomOffset={96} />
      <FloatingFeedbackWidget />
    </ActiveRoleProvider>
  );
}
