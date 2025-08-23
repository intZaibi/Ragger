"use client";
import { useState, useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Moon,
  Sun,
  Bot,
  Database,
  Sparkles,
  MessageSquare,
  FileText,
  User,
  LogIn,
  UserPlus,
} from "lucide-react";

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Check system preference and user preference for dark mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark =
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDarkMode(isDark);

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-colors duration-300">
      <div className="container mx-auto h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
         <Link href="/" className="flex items-center gap-3 group">
      {/* Icon */}
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-300 shadow-md group-hover:scale-110 transition-transform duration-300">
        <Sparkles className="w-6 h-6 text-white" />
      </div>

      {/* Text */}
      <span className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-gray-100 dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent tracking-tight">
        Ragger
      </span>
    </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {/* <Link
            href="/about"
            className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <User className="h-4 w-4" />
            About
          </Link> */}
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <Database className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/playground"
            className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            Playground
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          <SignedOut>
            <div className="hidden md:flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                className="text-gray-600 dark:text-gray-300"
              >
                <SignInButton className="flex items-center gap-1">
                  <span>
                    <LogIn className="h-4 w-4" />
                    Login
                  </span>
                </SignInButton>
              </Button>
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <SignUpButton className="flex items-center gap-1">
                  Sign Up
                </SignUpButton>
              </Button>
            </div>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              {/* <Link
                href="/about"
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-5 w-5" />
                About
              </Link> */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Database className="h-5 w-5" />
                Dashboard
              </Link>
              <Link
                href="/playground"
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 py-2 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <MessageSquare className="h-5 w-5" />
                Playground
              </Link>

              <SignedOut>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                  <Button asChild variant="outline" className="justify-center">
                    <S
                      href="/sign-in"
                      className="flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </S>
                  </Button>
                  <Button
                    asChild
                    className="bg-indigo-600 hover:bg-indigo-700 text-white justify-center"
                  >
                    <Link
                      href="/sign-up"
                      className="flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </Button>
                </div>
              </SignedOut>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
