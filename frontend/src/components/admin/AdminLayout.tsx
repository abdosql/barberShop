import React from 'react';
import Footer from '../Footer';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
} 