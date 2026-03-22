'use client';

import { ReactNode } from 'react';
import FoundingMemberPopup from '@/components/ui/FoundingMemberPopup';
import { ActiveRoleProvider } from '@/context/ActiveRoleContext';
import FloatingFeedbackWidget from '@/components/sections/FloatingFeedbackWidget';

export default function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <ActiveRoleProvider>
      {children}
      <FoundingMemberPopup />
      <FloatingFeedbackWidget />
    </ActiveRoleProvider>
  );
}
