import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { BroadcastProvider } from "@/context/BroadcastContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Command Center - SBA",
  description: "Humanitarian Case Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <BroadcastProvider>
            {children}
          </BroadcastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
