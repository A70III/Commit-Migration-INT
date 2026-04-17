import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/use-theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Commit Migration Tool",
  description: "AI-powered, visual tool to migrate git commits safely across branches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col transition-colors duration-300" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <ThemeProvider>
          <div className="flex-1 w-full flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
