"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Plus, Search, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import AuthGate from "@/components/AuthGate";
import Modal from "@/components/Modal";
import { api, jsonBody } from "@/lib/api";
import { button, secondary, iconButton, field, featureIcon, surface } from "@/lib/styles";

function Notebooks() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [create, setCreate] = useState(false);
  const [name, setName] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setNotebooks((await api("/api/notebooks")).notebooks); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  async function createNotebook(e) {
    e.preventDefault(); if (busy || !name.trim()) return; setBusy(true);
    try { const data = await api("/api/createCollection", jsonBody({ bookName: name.trim() })); router.push("/playground?notebook=" + encodeURIComponent(data.collectionName)); }
    catch (error) { toast.error(error.message); }
    finally { setBusy(false); }
  }
  async function deleteNotebook() {
    setBusy(true);
    try {
      await api("/api/notebooks", jsonBody({ collectionName: deleting.id }, "DELETE"));
      setNotebooks(prev => prev.filter(n => n.id !== deleting.id));
      setDeleting(null); toast.success("Notebook deleted.");
    } catch (error) { toast.error(error.message); }
    finally { setBusy(false); }
  }
  const visible = notebooks.filter(n => n.name.toLowerCase().includes(search.toLowerCase()));
  return <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10">
    <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><span className="text-[9px] font-semibold tracking-[.18em] text-stone-500">YOUR PERSONAL LIBRARY</span><h1 className="mb-3 mt-3 font-serif text-5xl tracking-tight">My notebooks<span className="text-violet-500">.</span></h1><p className="text-sm text-stone-500 dark:text-zinc-400">A home for your material. A starting point for your next idea.</p></div><button className={button} onClick={() => setCreate(true)}><Plus size={16} /> New notebook</button></div>
    <div className="mb-6 flex items-center justify-between gap-4"><div className="relative w-full max-w-xs"><Search className="absolute left-3 top-3.5 text-stone-400" size={16} /><input className={field + " pl-10"} placeholder="Find a notebook…" aria-label="Search notebooks" value={search} onChange={e => setSearch(e.target.value)} /></div><span className="shrink-0 text-xs text-stone-500">{notebooks.length} notebook{notebooks.length !== 1 ? "s" : ""}</span></div>
    {loading ? <div className="flex justify-center gap-3 py-24 text-stone-500"><Loader2 size={18} className="animate-spin" /> Gathering your notebooks…</div> : error ? <div role="alert" className="flex items-center justify-between gap-5 rounded-xl border border-red-200 p-5 text-sm dark:border-red-900"><p>{error}</p><button className={secondary} onClick={load}>Try again</button></div> : visible.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map(n => <article key={n.id} className={surface + " relative rounded-xl transition hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-950/5 motion-reduce:transform-none"}><Link href={"/playground?notebook=" + encodeURIComponent(n.id)} className="block p-6"><span className={featureIcon}><BookOpen size={23} strokeWidth={1.5} /></span><h2 className="mb-2 mt-7 break-words font-serif text-2xl capitalize">{n.name}</h2><p className="text-xs text-stone-500">{n.chunks ? n.chunks + " indexed passages" : "Ready for your first source"}</p><div className="mt-6 flex items-center justify-between text-xs text-violet-600 dark:text-violet-300"><span>Open notebook</span><ArrowRight size={16} /></div></Link><button className={iconButton + " absolute right-4 top-4"} aria-label={"Delete " + n.name} onClick={() => setDeleting(n)}><Trash2 size={15} /></button></article>)}</div> : <div className="rounded-xl border border-dashed border-stone-300 px-6 py-16 text-center dark:border-zinc-700"><span className={featureIcon}><BookOpen size={22} /></span><h2 className="mt-6 font-serif text-3xl">{search ? "No notebooks found." : "Good ideas start with a blank page."}</h2><p className="mx-auto mb-6 mt-3 max-w-sm text-sm leading-7 text-stone-500">{search ? "Try a different name or clear your search." : "Create your first notebook, add something worth reading, and start a conversation."}</p><button className={secondary} onClick={() => search ? setSearch("") : setCreate(true)}>{search ? "Clear search" : "Create a notebook"}<ArrowRight size={15} /></button></div>}
    <div className={surface + " mt-10 flex items-start gap-4 rounded-xl p-6"}><span className={featureIcon}><Sparkles size={20} /></span><div><h2 className="text-sm font-medium">A small tip for better answers</h2><p className="mt-2 text-xs leading-6 text-stone-500 dark:text-zinc-400">Keep related sources together. A notebook for a course, a project, or a topic gives your questions the right context.</p></div></div>
    <Modal open={create} onClose={() => setCreate(false)} title="A fresh notebook" description="Give your ideas a home. You can add sources in the next step." busy={busy}><form onSubmit={createNotebook}><label htmlFor="notebook-name" className="mb-2 block text-xs">Notebook name</label><input id="notebook-name" autoFocus className={field} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ideas for a slower life" maxLength={80} required /><div className="mt-6 flex justify-end gap-3"><button type="button" className={secondary} onClick={() => setCreate(false)} disabled={busy}>Cancel</button><button className={button} disabled={busy || !name.trim()}>{busy ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />} Create notebook</button></div></form></Modal>
    <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete this notebook?" description={'“' + (deleting?.name || "") + '” and all of its indexed sources will be permanently deleted.'} busy={busy}><div className="flex justify-end gap-3"><button className={secondary} disabled={busy} onClick={() => setDeleting(null)}>Keep notebook</button><button className={button + " bg-red-700! hover:bg-red-800!"} disabled={busy} onClick={deleteNotebook}>{busy && <Loader2 size={15} className="animate-spin" />} Delete notebook</button></div></Modal>
  </div>;
}
export default function Dashboard() { return <AuthGate><Notebooks /></AuthGate>; }
