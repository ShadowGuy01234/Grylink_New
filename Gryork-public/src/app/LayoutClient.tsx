'use client';

import { ReactNode } from 'react';
import FoundingMemberPopup from '@/components/ui/FoundingMemberPopup';

export default function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <FoundingMemberPopup />
    </>
  );
}
