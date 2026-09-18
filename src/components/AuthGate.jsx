"use client";
import { SignedIn, SignedOut, SignInButton, ClerkLoading } from "@clerk/nextjs";
import { BookOpen, ArrowUpRight, Loader2 } from "lucide-react";
import { button, featureIcon } from "@/lib/styles";
export default function AuthGate({ children }) {
  return <><ClerkLoading><div className="flex justify-center gap-3 p-24 text-stone-500"><Loader2 className="animate-spin" size={18} /> Loading your workspace…</div></ClerkLoading><SignedOut><div className="mx-auto my-16 max-w-lg px-6 text-center"><span className={featureIcon}><BookOpen size={22} /></span><h1 className="mt-6 font-serif text-4xl tracking-tight">A space for your curiosity.</h1><p className="mx-auto mb-7 mt-4 max-w-sm text-sm leading-7 text-stone-500 dark:text-zinc-400">Sign in to create notebooks, collect your sources, and find answers in your own material.</p><SignInButton mode="modal"><button className={button}>Sign in to begin <ArrowUpRight size={16} /></button></SignInButton><p className="mt-5 text-xs text-stone-500">Includes 3 trial questions. No payment required.</p></div></SignedOut><SignedIn>{children}</SignedIn></>;
}
