"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import AuthGate from "@/components/AuthGate";
import NotebookWorkspace from "@/components/NotebookWorkspace";

function SelectedWorkspace() {
  const params = useSearchParams();
  const { user } = useUser();
  const collectionName = params.get("notebook");
  return <NotebookWorkspace key={(user?.id || "") + (collectionName || "")} collectionName={collectionName} userId={user?.id} />;
}
export default function PlaygroundPage() {
  return <AuthGate><Suspense fallback={<div className="p-20 text-center text-stone-500">Opening your workspace…</div>}><SelectedWorkspace /></Suspense></AuthGate>;
}
