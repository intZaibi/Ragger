import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export const metadata = {
  icons: { icon: "/icon.svg" },
  title: { default: "Marginalia — A little clarity for everything you read", template: "%s · Marginalia" },
  description: "Turn your documents, notes, and web pages into a notebook you can talk to. Ask questions, explore summaries, and follow the sources.",
};
export default function RootLayout({ children }) {
  return <ClerkProvider><html lang="en" suppressHydrationWarning><body className="bg-[#faf9f6] font-sans text-stone-800 antialiased selection:bg-violet-200 selection:text-stone-900 dark:bg-zinc-950 dark:text-zinc-100 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-violet-500 [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-violet-500">
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <a href="#main-content" className="fixed -top-24 left-3 z-50 rounded bg-white p-3 text-stone-900 focus:top-3">Skip to content</a>
      <div className="flex min-h-dvh flex-col"><Header /><main id="main-content" className="flex-1">{children}</main><Footer /></div>
      <Toaster richColors position="bottom-right" />
    </ThemeProvider>
  </body></html></ClerkProvider>;
}
