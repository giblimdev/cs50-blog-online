// /app/(public)/layout.tsx
import React from 'react';
import Header from '@/components/layout/header/Header';
import Footer from '@/components/layout/footer/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Utilisation de votre Header existant */}
      <Header />

      {/* Main Content - Pages publiques */}
      <main className="flex-1">
        {children}
      </main>
<Footer />
      
    </div>
  );
}
