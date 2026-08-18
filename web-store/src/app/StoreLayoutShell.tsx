'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { StoreProvider } from '../lib/storeContext';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';
import { NotificationToastContainer } from '../components/NotificationToast';

export function StoreLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthPage = pathname?.startsWith('/login');

  return (
    <StoreProvider>
      <NotificationToastContainer />
      {isAuthPage ? (
        <div className="min-h-screen bg-stone-950 flex flex-col justify-center items-center p-4">
          {children}
        </div>
      ) : (
        <div className="min-h-screen bg-stone-950 flex">
          <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
            <Navbar onOpenMobile={() => setMobileOpen(true)} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      )}
    </StoreProvider>
  );
}
