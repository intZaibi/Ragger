"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, Menu, Moon, Sun, X } from "lucide-react";

export function Brand() {
  return <Link href="/" className="flex items-center gap-2.5 font-serif text-[28px] tracking-tight max-sm:text-2xl" aria-label="Marginalia home"><span className="grid h-9 w-8.5 -rotate-6 place-items-center rounded-lg rounded-bl-sm border border-violet-300 bg-violet-100/70 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300"><BookOpen size={21} strokeWidth={1.6} /></span>marginalia<span className="-ml-2 text-violet-500">.</span></Link>;
}
export default function Header() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setMounted(true), []);
  return <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#faf9f6]/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 max-sm:h-16 max-sm:gap-2 sm:px-10">
    <Brand />
    <nav className={open ? "absolute inset-x-0 top-16 flex flex-col gap-1 border-b border-stone-200 bg-white px-6 py-4 md:static md:flex-row md:gap-8 md:border-0 md:bg-transparent md:p-0 dark:border-zinc-800 dark:bg-zinc-950 [&_a]:py-3 [&_a]:text-xs [&_a[aria-current]]:text-violet-600" : "hidden items-center gap-8 md:flex [&_a]:relative [&_a]:py-7 [&_a]:text-xs [&_a]:text-stone-500 [&_a:hover]:text-violet-600 [&_a[aria-current]]:text-violet-600 dark:[&_a]:text-zinc-400"} aria-label="Main navigation">
      {[["/", "Overview"], ["/dashboard", "My notebooks"], ["/playground", "Workspace"]].map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}
    </nav>
    <div className="flex items-center gap-4 max-sm:gap-1.5">
      <button className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-violet-600 dark:text-zinc-400 dark:hover:bg-zinc-800" aria-label="Toggle color theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>{mounted && resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>
      <SignedOut><SignInButton mode="modal"><button className="inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#7861b4] px-3 text-xs font-medium text-white transition hover:bg-[#67509f]">Sign in <ArrowUpRight size={15} className="max-sm:hidden" /></button></SignInButton></SignedOut>
      <SignedIn><UserButton /></SignedIn>
      <button className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-violet-600 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
  </div></header>;
}
