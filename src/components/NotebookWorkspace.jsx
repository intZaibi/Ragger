"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, ChevronRight, Copy, Download, FileText, Globe2, Loader2, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import AddSourceModal from "@/app/playground/AddSourceModal";
import { api, jsonBody } from "@/lib/api";
import { button, secondary, iconButton, featureIcon, muted } from "@/lib/styles";

export default function NotebookWorkspace({ collectionName, userId }) {
  const [sources, setSources] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState("");
  const [summaryBusy, setSummaryBusy] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [partial, setPartial] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [credits, setCredits] = useState(null);
  const [creditError, setCreditError] = useState(false);
  const [tab, setTab] = useState("chat");
  const [confirm, setConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [historyReady, setHistoryReady] = useState(false);
  const bottom = useRef(null);
  const inputRef = useRef(null);
  const summaryRequest = useRef(0);
  const sending = useRef(false);
  const historyKey = userId && collectionName ? "marginalia:" + userId + ":" + collectionName : null;

  const load = useCallback(async () => {
    if (!collectionName) { setLoading(false); return; }
    setLoading(true); setError("");
    try { const data = await api("/api/notebooks?collectionName=" + encodeURIComponent(collectionName)); setSources(data.sources); setName(data.name); }
    catch (error) { setError(error.message); }
    finally { setLoading(false); }
  }, [collectionName]);
  const loadCredits = useCallback(async () => {
    setCreditError(false);
    try { setCredits((await api("/api/credits")).credits); }
    catch { setCreditError(true); }
  }, []);
  useEffect(() => { load(); loadCredits(); }, [load, loadCredits]);
  useEffect(() => {
    if (!historyKey) return;
    try {
      const stored = JSON.parse(sessionStorage.getItem(historyKey) || "[]");
      setMessages(Array.isArray(stored) ? stored.filter(m => m && typeof m.text === "string" && ["user", "bot"].includes(m.role)) : []);
    } catch { setMessages([]); }
    setHistoryReady(true);
  }, [historyKey]);
  useEffect(() => {
    if (!historyReady || !historyKey) return;
    try { sessionStorage.setItem(historyKey, JSON.stringify(messages)); } catch { /* Chat still works when browser storage is unavailable. */ }
  }, [messages, historyKey, historyReady]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: "nearest" }); }, [messages, busy]);

  function selectSource(source) {
    summaryRequest.current += 1;
    setSelected(source); setSummary(""); setSummaryError(""); setSummaryBusy(false); setPartial(false); setTab("summary");
  }
  async function summarize() {
    if (!selected || summaryBusy) return;
    const requestId = ++summaryRequest.current;
    setSummaryBusy(true); setSummaryError("");
    try {
      const data = await api("/api/summary", jsonBody({ collectionName, sourceId: selected.id }));
      if (requestId === summaryRequest.current) { setSummary(data.summary); setPartial(data.partial); }
    } catch (error) { if (requestId === summaryRequest.current) setSummaryError(error.message); }
    finally { if (requestId === summaryRequest.current) setSummaryBusy(false); }
  }
  async function send(e) {
    e?.preventDefault();
    if (sending.current || !input.trim() || !sources.length || credits === null || credits <= 0) return;
    const question = input.trim();
    sending.current = true; setBusy(true); setInput("");
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", text: question }]);
    try {
      const data = await api("/api/chat", jsonBody({ userQuery: question, collectionName }));
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "bot", text: data.answer, sources: data.sources }]);
      setCredits(data.creditsRemaining);
    } catch (error) {
      if (error.status === 402) setCredits(0);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "bot", text: error.message, error: true }]);
      setInput(question);
    } finally { setBusy(false); sending.current = false; inputRef.current?.focus(); }
  }
  async function remove() {
    setDeleting(true);
    try {
      if (confirm.type === "chat") { setMessages([]); }
      else {
        await api("/api/clearIndex", jsonBody({ collectionName, ...(confirm.source ? { sourceId: confirm.source.id } : {}) }));
        setSources(prev => confirm.source ? prev.filter(s => s.id !== confirm.source.id) : []);
        if (!confirm.source || selected?.id === confirm.source.id) {
          summaryRequest.current += 1; setSelected(null); setSummary(""); setSummaryBusy(false); setSummaryError("");
        }
        toast.success(confirm.source ? "Source deleted." : "All sources deleted.");
      }
      setConfirm(null);
    } catch (error) { toast.error(error.message); }
    finally { setDeleting(false); }
  }
  async function copy(value) {
    try { await navigator.clipboard.writeText(value); toast.success("Copied to clipboard."); }
    catch { toast.error("Copy failed. You can select and copy the text directly."); }
  }
  function exportChat() {
    const content = "# " + name + "\n\n" + messages.map(m => "## " + (m.role === "user" ? "You" : "Marginalia") + "\n\n" + m.text + (m.sources?.length ? "\n\nSources:\n" + m.sources.map(s => "- " + s.name + "\n  " + s.excerpt).join("\n") : "")).join("\n\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "marginalia-notebook.md"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (!collectionName) return <div className="mx-auto max-w-xl px-6 py-24 text-center"><span className={featureIcon}><BookOpen size={22} /></span><h1 className="mt-6 font-serif text-4xl tracking-tight">Where shall we begin?</h1><p className="mb-7 mt-4 text-sm leading-7 text-stone-500">Open a notebook from your library, or create a new one for your next project.</p><Link className={button} href="/dashboard">Go to my notebooks <ArrowRight size={16} /></Link></div>;
  if (loading) return <div className="flex justify-center gap-3 p-24 text-stone-500"><Loader2 className="animate-spin" size={18} /> Opening your notebook…</div>;
  if (error) return <div className="mx-auto max-w-lg px-6 py-20"><Link href="/dashboard" className="mb-6 flex items-center gap-2 text-xs text-violet-600"><ArrowLeft size={14} /> My notebooks</Link><p role="alert" className="mb-5 text-sm">{error}</p><button className={secondary} onClick={load}>Try again</button></div>;

  const panelHeader = "mb-5 flex items-center justify-between gap-2 text-xs font-semibold";
  return <div className="mx-auto max-w-[1440px] px-3 py-6 sm:px-7">
    <div className="mb-6 flex items-center justify-between gap-5"><div className="min-w-0"><div className="mb-2 flex items-center gap-2 text-[10px] text-stone-500"><Link href="/dashboard">My notebooks</Link><ChevronRight size={12} /><span>Workspace</span></div><h1 className="break-words font-serif text-3xl capitalize tracking-tight">{name}</h1></div><button className={secondary} onClick={exportChat} disabled={!messages.length || busy} aria-label="Export conversation"><Download size={14} /><span className="max-sm:hidden">Export conversation</span></button></div>
    <div role="tablist" aria-label="Workspace panels" className="mb-3 flex gap-1 rounded-lg bg-stone-100 p-1 lg:hidden dark:bg-zinc-800">{["sources","chat","summary"].map(value => <button key={value} role="tab" aria-selected={tab === value} aria-controls={"panel-" + value} onClick={() => setTab(value)} className={"flex-1 rounded-md p-2 text-xs capitalize " + (tab === value ? "bg-white text-violet-600 shadow-sm dark:bg-zinc-900 dark:text-violet-300" : "text-stone-500")}>{value}{value === "sources" ? " (" + sources.length + ")" : ""}</button>)}</div>
    <div className="grid min-h-[600px] overflow-hidden rounded-xl border border-stone-200 bg-white lg:h-[calc(100dvh-245px)] lg:max-h-[950px] lg:grid-cols-[230px_minmax(0,1fr)_260px] xl:grid-cols-[250px_minmax(0,1fr)_280px] dark:border-zinc-800 dark:bg-zinc-900">
      <aside id="panel-sources" aria-label="Sources" className={"min-h-0 flex-col p-5 lg:flex lg:border-r lg:border-stone-200 dark:lg:border-zinc-800 " + (tab === "sources" ? "flex" : "hidden")}>
        <div className={panelHeader}><h2>Sources</h2><span className="rounded bg-stone-100 px-2 py-1 text-[10px] text-stone-500 dark:bg-zinc-800">{sources.length}</span></div>
        <button className={secondary + " w-full border-dashed"} onClick={() => setAddOpen(true)} disabled={busy || deleting}><Plus size={14} /> Add a source</button>
        <div className="my-5 flex-1 overflow-auto">{sources.length ? sources.map(source => <div key={source.id} className={"mb-2 flex items-center gap-1 rounded-lg border p-1 " + (selected?.id === source.id ? "border-violet-300 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/30" : "border-stone-200 dark:border-zinc-700")}>
          <button className="flex min-w-0 flex-1 items-center gap-2 p-2 text-left" onClick={() => selectSource(source)} aria-pressed={selected?.id === source.id}>{source.type === "url" ? <Globe2 size={16} className="shrink-0 text-violet-500" /> : <FileText size={16} className="shrink-0 text-violet-500" />}<span className="min-w-0"><strong className="block truncate text-[10px] font-medium">{source.name}</strong><small className="mt-1.5 block text-[9px] text-stone-500">{source.chunks} passage{source.chunks !== 1 ? "s" : ""} · Ready</small></span></button><button className={iconButton + " size-6!"} aria-label={"Delete " + source.name} onClick={() => setConfirm({ type: "source", source })} disabled={busy || deleting}><Trash2 size={12} /></button>
        </div>) : <div className="px-2 py-10 text-center"><BookOpen size={24} className="mx-auto mb-4 text-violet-400" /><p className="text-xs leading-6 text-stone-500">Every good question starts somewhere.<br />Add your first source above.</p></div>}</div>
        {sources.length > 0 && <button className={iconButton + " w-full! gap-2 text-[10px]"} onClick={() => setConfirm({ type: "all" })} disabled={busy || deleting}><Trash2 size={12} /> Delete all sources</button>}
        <p className="mt-5 border-t border-stone-200 pt-4 text-[10px] leading-5 text-stone-500 dark:border-zinc-800">PDF, TXT, CSV, or a web page.<br />Your sources are saved to this notebook.</p>
      </aside>
      <section id="panel-chat" aria-label="Conversation" className={"min-h-0 min-w-0 flex-col lg:flex " + (tab === "chat" ? "flex h-[max(600px,calc(100dvh-280px))] lg:h-auto" : "hidden")}>
        <div className="flex min-h-16 items-center justify-between gap-2 border-b border-stone-200 px-5 dark:border-zinc-800"><h2 className="text-xs font-semibold">Conversation</h2><div className="flex items-center gap-2"><span className="rounded-full bg-violet-50 px-2.5 py-1.5 text-[9px] text-violet-600 dark:bg-violet-400/10 dark:text-violet-300">{credits === null ? "Trial messages" : credits + " trial message" + (credits !== 1 ? "s" : "") + " left"}</span><button className={iconButton} onClick={() => setConfirm({ type: "chat" })} disabled={!messages.length || busy} aria-label="Clear conversation"><Trash2 size={14} /></button></div></div>
        <div className="min-h-0 flex-1 overflow-auto p-5 sm:p-6" role="log" aria-label="Chat messages" aria-live="polite">
          {!messages.length && <div className="flex min-h-full flex-col items-center justify-center px-3 py-9 text-center"><span className={featureIcon + " size-12!"}><Sparkles size={22} /></span><h2 className="mb-3 mt-6 font-serif text-3xl tracking-tight">A question can change<br />how you see things.</h2><p className="mb-6 max-w-xs text-xs leading-6 text-stone-500 dark:text-zinc-400">{sources.length ? "Explore what connects your sources. Every answer begins with the material you’ve brought here." : "Add a source, then ask a question. Let’s find the useful bits together."}</p>{sources.length ? <div className="flex flex-wrap justify-center gap-2">{["What are the key ideas?", "What should I take away?", "What themes connect these sources?"].map(prompt => <button key={prompt} className={secondary + " min-h-8! px-3! text-[10px]!"} onClick={() => {setInput(prompt);inputRef.current?.focus();}}>{prompt}</button>)}</div> : <button className={secondary} onClick={() => setAddOpen(true)}><Plus size={14} /> Add your first source</button>}</div>}
          {messages.map(message => <article key={message.id} className={"mb-6 text-xs leading-7 " + (message.role === "user" ? "ml-[12%] rounded-xl rounded-br-sm bg-violet-50 px-4 py-3 dark:bg-violet-400/10" : "")}>{message.role === "bot" && <div className="mb-3 flex items-center gap-2 text-[11px] font-medium"><span className={featureIcon + " size-7! rounded-lg!"}><Sparkles size={14} /></span>Marginalia{message.error && <span className="text-red-500"> · Request failed</span>}</div>}<p className="whitespace-pre-wrap break-words">{message.text}</p>
            {message.sources?.map((source,index) => <details key={index} className="mt-2 rounded-lg border border-stone-200 text-[10px] dark:border-zinc-700"><summary className="cursor-pointer break-words px-3 py-1.5 text-violet-600 dark:text-violet-300">Source {index + 1} · {source.name}</summary><p className="max-h-44 overflow-auto whitespace-pre-wrap border-t border-stone-200 p-3 leading-6 text-stone-500 dark:border-zinc-700 dark:text-zinc-400">{source.excerpt}</p></details>)}
            {message.role === "bot" && !message.error && <button className={iconButton + " mt-2"} onClick={() => copy(message.text)} aria-label="Copy answer"><Copy size={13} /></button>}
          </article>)}
          {busy && <p role="status" className="flex items-center gap-2 text-xs text-violet-500"><Loader2 size={14} className="animate-spin" /> Finding the connections…</p>}<div ref={bottom} />
        </div>
        <div className="border-t border-stone-200 p-4 dark:border-zinc-800">
          {creditError && <p role="alert" className="mb-3 text-xs text-red-600">Could not load message allowance. <button className="underline" onClick={loadCredits}>Retry</button></p>}
          {credits === 0 && <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">Your 3 trial questions are used. You can still review summaries and export this chat. Contact the project owner for more messages.</p>}
          <form onSubmit={send} className="relative rounded-xl border border-stone-200 bg-stone-50 p-3 focus-within:border-violet-400 dark:border-zinc-700 dark:bg-zinc-950/30"><label htmlFor="question" className="sr-only">Ask a question about your sources</label><textarea id="question" ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {e.preventDefault();send();} }} disabled={busy || !sources.length || credits === 0} placeholder={sources.length ? "Follow your next question…" : "Add a source to start a conversation…"} maxLength={4000} rows={2} className="min-h-14 w-full resize-none bg-transparent pr-11 text-xs leading-6 outline-none placeholder:text-stone-400 disabled:opacity-60" /><button className={button + " absolute bottom-3 right-3 size-8! min-h-0! rounded-lg! p-0!"} type="submit" aria-label="Send question" disabled={busy || !input.trim() || !sources.length || credits === null || credits <= 0}>{busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}</button></form><p className="mt-2 text-center text-[9px] text-stone-400">Answers use your sources. Verify important details. · Shift + Enter for a new line</p>
        </div>
      </section>
      <aside id="panel-summary" aria-label="Source summary" className={"overflow-auto bg-stone-50/60 p-5 lg:block lg:border-l lg:border-stone-200 dark:bg-zinc-950/20 dark:lg:border-zinc-800 " + (tab === "summary" ? "block" : "hidden")}><div className={panelHeader}><h2>Source insights</h2><Sparkles size={14} className="text-violet-400" /></div>{selected ? <><div className={featureIcon}><FileText size={20} /></div><h3 className="mb-2 mt-5 break-words text-xs font-medium">{selected.name}</h3><p className="mb-5 text-[10px] text-stone-500">{selected.chunks} indexed passages</p>{!summary && <><p className="mb-5 text-xs leading-6 text-stone-500 dark:text-zinc-400">Get a quick overview of this source and the ideas worth keeping.</p><button className={secondary + " w-full"} disabled={summaryBusy || busy || deleting} onClick={summarize}>{summaryBusy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}{summaryBusy ? "Summarizing…" : "Summarize source"}</button></>}{summaryError && <p role="alert" className="mt-4 text-xs text-red-500">{summaryError}</p>}{summary && <><p className="whitespace-pre-wrap break-words text-xs leading-7">{summary}</p>{partial && <p className="mt-4 text-[10px] text-stone-500">This overview covers an excerpt of this long source.</p>}<button className={iconButton + " mt-3"} onClick={() => copy(summary)} aria-label="Copy summary"><Copy size={14} /></button></>}</> : <div className="py-12 text-center"><BookOpen size={26} className="mx-auto mb-4 text-violet-400" /><h3 className="font-serif text-xl">The bigger picture.</h3><p className="mt-3 text-xs leading-6 text-stone-500 dark:text-zinc-400">Select a source to explore its key ideas and generate a quick summary.</p></div>}</aside>
    </div>
    <p className={"mt-3 text-[9px] " + muted}>Conversation history is kept in this browser tab. Export it to keep a copy. Each question is answered independently.</p>
    <AddSourceModal isOpen={addOpen} onClose={() => setAddOpen(false)} collectionName={collectionName} onAddSource={source => {setSources(prev => [...prev,source]);selectSource(source);}} />
    <Modal open={Boolean(confirm)} onClose={() => setConfirm(null)} busy={deleting} title={confirm?.type === "chat" ? "Clear this conversation?" : confirm?.source ? "Delete this source?" : "Delete all sources?"} description={confirm?.type === "chat" ? "This clears the conversation in this browser tab. Your notebook sources stay saved." : "This permanently removes the selected source data from your notebook. Existing answers remain in this conversation."}><div className="flex justify-end gap-3"><button className={secondary} onClick={() => setConfirm(null)} disabled={deleting}>Cancel</button><button className={button + " bg-red-700! hover:bg-red-800!"} onClick={remove} disabled={deleting}>{deleting && <Loader2 size={14} className="animate-spin" />}{confirm?.type === "chat" ? "Clear conversation" : "Delete sources"}</button></div></Modal>
  </div>;
}
