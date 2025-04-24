"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";
import ThemeSettingsProvider from "@/components/theme-settings-provider";
import { themeSettingsRender } from "@/components/layout/theme-settings-render";
import { NavigationProvider } from "@/app/providers/navigation-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeSettingsRender() }} />
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem 
        disableTransitionOnChange
      >
        <ThemeSettingsProvider>
          <NavigationProvider>
            {children}
            <Toaster 
              richColors 
              position="top-right" 
              toastOptions={{
                className: 'dark:bg-gray-800 dark:text-gray-100 dark:border dark:border-gray-700',
                style: {
                  borderRadius: '0.5rem',
                },
              }}
            />
          </NavigationProvider>
        </ThemeSettingsProvider>
      </ThemeProvider>
    </>
  );
} 