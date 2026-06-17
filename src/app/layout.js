import { Inter, JetBrains_Mono } from "next/font/google";

import { AppProvider } from "@/components/app-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { activeProviders, emailEnabled } from "@/lib/auth-config";
import { s3Enabled } from "@/lib/storage/config";

import "./globals.css";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const appName = "Forge";

export const metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: "Next.js boilerplate with auth and UI components",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interSans.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider
            value={{
              appName,
              providers: activeProviders.map(({ id, label }) => ({
                id,
                label,
              })),
              emailEnabled,
              s3Enabled,
            }}
          >
            {children}
          </AppProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
