import './globals.css';
import './compact.css';
import React from 'react';
export const metadata = { title: 'Particle Tilt Playground', description: 'Interactive particle physics playground' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
