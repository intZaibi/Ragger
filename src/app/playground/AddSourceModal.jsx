"use client";
import { useState } from "react";
import { FileText, Globe2, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Modal from "@/components/Modal";
import { api } from "@/lib/api";
import { button, secondary, field } from "@/lib/styles";

export default function AddSourceModal({ isOpen, onClose, onAddSource, collectionName }) {
  const [type, setType] = useState("file");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  function selectFile(value) {
    setError("");
    if (!value) return;
    if (!/\.(pdf|csv|txt)$/i.test(value.name)) { setError("Choose a PDF, TXT, or CSV file."); return; }
    if (value.size > 10 * 1024 * 1024) { setError("Please choose a file smaller than 10 MB."); return; }
    setFile(value);
  }
  async function submit(e) {
    e.preventDefault(); if (busy) return;
    const form = new FormData();
    form.append("collectionName", collectionName);
    form.append("sourceType", type);
    if (type === "text") { form.append("text", text); form.append("name", name.trim()); }
    if (type === "file") form.append("file", file);
    if (type === "url") {
      try { if (new URL(url).protocol !== "https:") throw new Error(); }
      catch { setError("Enter a valid public HTTPS address."); return; }
      form.append("url", url);
    }
    setBusy(true); setError("");
    try {
      const { source } = await api("/api/index", { method: "POST", body: form });
      onAddSource(source);
      setText(""); setName(""); setUrl(""); setFile(null);
      onClose(); toast.success("Source added. Your next question has more context.");
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  return <Modal open={isOpen} onClose={onClose} busy={busy} title="Add a little context" description="Bring a document, a web page, or your own notes into this notebook.">
    <div className="mb-6 flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-zinc-800">{[[Upload,"file","Document"],[FileText,"text","Paste text"],[Globe2,"url","Web page"]].map(([Icon,value,label]) => <button key={value} type="button" disabled={busy} aria-pressed={type === value} onClick={() => {setType(value);setError("");}} className={"flex flex-1 items-center justify-center gap-2 rounded-md px-2 py-2.5 text-xs disabled:opacity-50 " + (type === value ? "bg-white text-violet-600 shadow-sm dark:bg-zinc-900 dark:text-violet-300" : "text-stone-500 dark:text-zinc-400")}><Icon size={14} />{label}</button>)}</div>
    <form onSubmit={submit}>
      {type === "file" && <div onDragOver={e => {e.preventDefault();setDragging(true);}} onDragLeave={() => setDragging(false)} onDrop={e => {e.preventDefault();setDragging(false);if (!busy) selectFile(e.dataTransfer.files[0]);}} className={"flex flex-col items-center gap-4 rounded-xl border border-dashed p-7 text-center " + (dragging ? "border-violet-400 bg-violet-50 dark:bg-violet-950/30" : "border-stone-300 bg-stone-50 dark:border-zinc-600 dark:bg-zinc-950/30")}><Upload size={26} className="text-violet-400" /><label htmlFor="source-file" className="text-sm">Drop your document here, or choose a file</label><input id="source-file" type="file" accept=".pdf,.csv,.txt" disabled={busy} onChange={e => selectFile(e.target.files[0])} className="w-full text-xs text-stone-500 file:mr-3 file:rounded-md file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:text-violet-700" /><p className="max-w-full break-words text-xs text-stone-500">{file ? file.name : "PDF, TXT, or CSV · Up to 10 MB"}</p></div>}
      {type === "text" && <><label htmlFor="source-name" className="mb-2 block text-xs">Title <span className="text-stone-400">(optional)</span></label><input id="source-name" className={field} value={name} onChange={e => setName(e.target.value)} maxLength={150} placeholder="A name for these notes" disabled={busy} /><label htmlFor="source-text" className="mb-2 mt-5 block text-xs">Your notes</label><textarea id="source-text" className={field + " min-h-40 resize-y"} value={text} onChange={e => setText(e.target.value)} maxLength={200000} placeholder="Paste something worth exploring…" required disabled={busy} /></>}
      {type === "url" && <><label htmlFor="source-url" className="mb-2 block text-xs">Web page URL</label><input id="source-url" type="url" className={field} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/article" required disabled={busy} /><p className="mt-3 text-xs leading-6 text-stone-500">Imports the text of one public HTTPS page. Pages that require sign-in or JavaScript may not be readable.</p></>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
      {busy && <p role="status" className="mt-4 text-xs leading-6 text-violet-600 dark:text-violet-300">Reading and indexing your source. This can take a moment…</p>}
      <p className="mt-5 text-[10px] leading-5 text-stone-500">Source text is processed on the server, sent to OpenAI for embeddings, and stored in Qdrant.</p>
      <div className="mt-6 flex justify-end gap-3"><button type="button" className={secondary} onClick={onClose} disabled={busy}>Cancel</button><button className={button} disabled={busy || (type === "file" ? !file : type === "text" ? !text.trim() : !url.trim())}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}{busy ? "Adding source…" : "Add source"}</button></div>
    </form>
  </Modal>;
}
