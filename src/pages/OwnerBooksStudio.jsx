import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { BookPlus, Save, Send, Upload, Loader2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const EMPTY = { slug:"", title_ml:"", title_en:"", title_ar:"", author:"", category:"general", intro_ml:"", intro_en:"", preview_text_ml:"", cover_url:"", pdf_path:"", access_mode:"FREE", price_amount:0, price_currency:"AED", status:"DRAFT", is_featured:false };
const input = "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white outline-none focus:border-yellow-400/50";
const label = "mb-1 block text-[10px] font-semibold uppercase tracking-wider text-white/40";
const slugify = (v) => String(v || "").trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff\u0d00-\u0d7f]+/g,"-").replace(/^-+|-+$/g,"");

export default function OwnerBooksStudio() {
  const { role, authResolved, adminProfileLoading } = useAuth();
  const { toast } = useToast();
  const [items,setItems]=useState([]), [selectedId,setSelectedId]=useState(null), [draft,setDraft]=useState(EMPTY), [saving,setSaving]=useState(false), [uploading,setUploading]=useState(false);
  const selected=useMemo(()=>items.find(x=>x.id===selectedId),[items,selectedId]);
  const load=async()=>setItems(await base44.entities.BookPublication.list("-updated_date",500).catch(()=>[]));
  useEffect(()=>{ if(role==="owner") load(); },[role]);
  useEffect(()=>{ if(selected) setDraft({...EMPTY,...selected}); },[selected]);
  if(!authResolved||adminProfileLoading) return <AdminLayout title="Books Studio"><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-yellow-200"/></div></AdminLayout>;
  if(role!=="owner") return <Navigate to="/owner-login?redirect=%2Fadmin%2Fbooks-studio" replace />;
  const change=(key,value)=>setDraft(prev=>({...prev,[key]:value,...(key==="title_en"&&!prev.slug?{slug:slugify(value)}:{})}));

  async function save(status=draft.status){
    if(!draft.title_ml.trim()||!draft.slug.trim()){toast({title:"Title and slug required",variant:"destructive"});return;}
    setSaving(true);
    try{
      const payload={...draft,slug:slugify(draft.slug),status,price_amount:Number(draft.price_amount||0),published_at:status==="PUBLISHED"?new Date().toISOString():draft.published_at||null};
      const row=selectedId?await base44.entities.BookPublication.update(selectedId,payload):await base44.entities.BookPublication.create(payload);
      await load(); setSelectedId(row?.id||selectedId); setDraft(prev=>({...prev,...payload,...row}));
      toast({title:status==="PUBLISHED"?"Book published":"Draft saved",description:status==="PUBLISHED"?`/books/${payload.slug}`:"Saved safely"});
    }catch(error){toast({title:"Save failed",description:error?.message,variant:"destructive"});}finally{setSaving(false);}
  }

  async function uploadPdf(event){
    const file=event.target.files?.[0]; if(!file)return;
    if(file.type!=="application/pdf"){toast({title:"PDF file മാത്രം തിരഞ്ഞെടുക്കുക",variant:"destructive"});return;}
    setUploading(true);
    try{const result=await base44.integrations.Core.UploadFile({file});change("pdf_path",result.file_url);toast({title:"PDF uploaded securely"});}
    catch(error){toast({title:"Upload failed",description:error?.message,variant:"destructive"});}finally{setUploading(false);event.target.value="";}
  }

  return <AdminLayout title="Books Studio"><div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
    <aside className="rounded-2xl border border-yellow-500/20 bg-white/[0.025] p-3"><div className="mb-3 flex items-center justify-between"><div><h1 className="font-bold text-white">Books Studio</h1><p className="text-[10px] text-white/35">Upload → Preview → Publish</p></div><button onClick={()=>{setSelectedId(null);setDraft(EMPTY);}} className="rounded-lg bg-yellow-500/10 p-2 text-yellow-300"><BookPlus className="h-4 w-4"/></button></div><div className="max-h-[70vh] space-y-2 overflow-y-auto">{items.map(item=><button key={item.id} onClick={()=>setSelectedId(item.id)} className="w-full rounded-xl border border-white/10 p-3 text-left"><p className="truncate text-sm text-white/80">{item.title_ml||item.title_en}</p><p className="mt-1 text-[9px] text-white/35">{item.status} · {item.access_mode}</p></button>)}</div></aside>
    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold text-white">{selectedId?"പുസ്തകം Edit ചെയ്യുക":"പുതിയ പുസ്തകം"}</h2><p className="text-xs text-white/35">Book details, preview and private PDF</p></div><div className="flex gap-2"><button disabled={saving} onClick={()=>save("DRAFT")} className="flex items-center gap-2 rounded-lg border border-yellow-500/30 px-3 py-2 text-xs text-yellow-200"><Save className="h-4 w-4"/>Draft</button><button disabled={saving} onClick={()=>save("PUBLISHED")} className="flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs text-emerald-300"><Send className="h-4 w-4"/>Publish</button></div></div>
      <div className="grid gap-3 md:grid-cols-2"><label><span className={label}>Malayalam title *</span><input className={input} value={draft.title_ml} onChange={e=>change("title_ml",e.target.value)}/></label><label><span className={label}>English title</span><input className={input} value={draft.title_en} onChange={e=>change("title_en",e.target.value)}/></label><label><span className={label}>Arabic title</span><input dir="rtl" className={input} value={draft.title_ar} onChange={e=>change("title_ar",e.target.value)}/></label><label><span className={label}>Slug *</span><input className={input} value={draft.slug} onChange={e=>change("slug",e.target.value)}/></label><label><span className={label}>Author / Source</span><input className={input} value={draft.author} onChange={e=>change("author",e.target.value)}/></label><label><span className={label}>Category</span><input className={input} value={draft.category} onChange={e=>change("category",e.target.value)}/></label><label><span className={label}>Cover image URL</span><input className={input} value={draft.cover_url} onChange={e=>change("cover_url",e.target.value)}/></label><label><span className={label}>Access</span><select className={input} value={draft.access_mode} onChange={e=>change("access_mode",e.target.value)}><option value="FREE">Free</option><option value="PAID">Paid</option><option value="SELECTED_CUSTOMERS">Selected customers</option></select></label></div>
      {draft.access_mode==="PAID"&&<div className="grid gap-3 md:grid-cols-2"><label><span className={label}>Price</span><input type="number" min="0" step="0.01" className={input} value={draft.price_amount} onChange={e=>change("price_amount",e.target.value)}/></label><label><span className={label}>Currency</span><input className={input} value={draft.price_currency} onChange={e=>change("price_currency",e.target.value.toUpperCase())}/></label></div>}
      <label><span className={label}>Malayalam introduction</span><textarea rows="4" className={input} value={draft.intro_ml} onChange={e=>change("intro_ml",e.target.value)}/></label><label><span className={label}>Free preview text/pages</span><textarea rows="8" className={input} value={draft.preview_text_ml} onChange={e=>change("preview_text_ml",e.target.value)}/></label>
      <div className="rounded-xl border border-dashed border-yellow-500/25 p-4"><p className={label}>Private full-book PDF</p><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">{uploading?<Loader2 className="h-4 w-4 animate-spin"/>:<Upload className="h-4 w-4"/>}{uploading?"Uploading…":"PDF Upload"}<input type="file" accept="application/pdf" className="hidden" onChange={uploadPdf}/></label>{draft.pdf_path&&<p className="mt-2 break-all text-xs text-emerald-300/70">Secure path: {draft.pdf_path}</p>}</div>
    </section></div></AdminLayout>;
}
