import type { Metadata } from "next";
import { Saira } from "next/font/google";
import "./globals.scss";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./providers/ThemeProvider";

// MissionControl typeface (Metro Warm). Replaces the kit's Inter app-wide.
const saira = Saira({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "MissionControl — Super Admin",
  description: "Cyber Pharma platform operations console (PHI-free).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Dark by default: html ships class="dark" for a dark first paint (no flash);
  // next-themes keeps dark as the default while the ThemeToggle still switches.
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={saira.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
