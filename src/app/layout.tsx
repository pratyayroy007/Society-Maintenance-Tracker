import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Society Maintenance Tracker",
  description: "Modern Apartment Society Maintenance & Complaint Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
