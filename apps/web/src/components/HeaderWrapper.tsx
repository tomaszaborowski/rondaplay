"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { TopBanner } from './TopBanner';

export function HeaderWrapper() {
  const pathname = usePathname();
  const hideHeader = pathname?.startsWith('/admin') || pathname?.startsWith('/game');

  if (hideHeader) return null;

  return (
    <>
      <TopBanner />
      <div className="pt-9">
        <Navbar />
      </div>
    </>
  );
}
