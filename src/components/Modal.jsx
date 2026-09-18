"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { iconButton } from "@/lib/styles";
export default function Modal({ open, onClose, title, description, children, busy = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }} onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); if (e.target === e.currentTarget && !busy && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) onClose(); }} className="m-auto max-h-[85dvh] w-[min(520px,calc(100vw-32px))] overflow-auto rounded-2xl border border-stone-200 bg-white p-6 text-stone-800 shadow-2xl backdrop:bg-zinc-950/40 backdrop:backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:p-8">
    <div className="mb-6 flex items-start justify-between gap-4"><div><h2 id="dialog-title" className="font-serif text-3xl tracking-tight">{title}</h2>{description && <p className="mt-2 text-xs leading-6 text-stone-500 dark:text-zinc-400">{description}</p>}</div><button type="button" className={iconButton} onClick={onClose} disabled={busy} aria-label="Close dialog"><X size={18} /></button></div>
    {children}
  </dialog>;
}
