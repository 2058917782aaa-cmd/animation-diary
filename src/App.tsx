import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, BookHeart, CalendarDays, Check, Feather,
  Heart, PenLine, Plus, Save, Sparkles, Trash2, X,
} from "lucide-react";

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

type View = { page: "list" } | { page: "detail"; id: string } | { page: "editor"; id?: string };
type Draft = Pick<DiaryEntry, "date" | "title" | "content">;

const STORAGE_KEY = "moonlit-diary-entries-v1";

function localToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDiaryEntry(value: unknown): value is DiaryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === "string" && typeof entry.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
    typeof entry.title === "string" && typeof entry.content === "string" &&
    typeof entry.createdAt === "number" && typeof entry.updatedAt === "number";
}

function readEntries(): DiaryEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isDiaryEntry) : [];
  } catch {
    return [];
  }
}

function displayDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "long", day: "numeric", weekday: "long",
  }).format(new Date(`${date}T12:00:00`));
}

function excerpt(content: string) {
  return content.replace(/\s+/g, " ").trim();
}

export default function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>(readEntries);
  const [view, setView] = useState<View>({ page: "list" });
  const [draft, setDraft] = useState<Draft>({ date: localToday(), title: "", content: "" });
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      setToast("浏览器无法保存数据，请检查存储设置");
    }
  }, [entries]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!deleteId) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDeleteId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteId]);

  const sortedEntries = useMemo(() => [...entries].sort((a, b) =>
    b.date.localeCompare(a.date) || b.createdAt - a.createdAt
  ), [entries]);
  const selected = view.page === "detail" || (view.page === "editor" && view.id)
    ? entries.find((entry) => entry.id === view.id)
    : undefined;

  function openNew() {
    setDraft({ date: localToday(), title: "", content: "" });
    setFormError("");
    setView({ page: "editor" });
  }

  function openEdit(entry: DiaryEntry) {
    setDraft({ date: entry.date, title: entry.title, content: entry.content });
    setFormError("");
    setView({ page: "editor", id: entry.id });
  }

  function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.title.trim();
    const content = draft.content.trim();
    if (!draft.date || !title || !content) {
      setFormError("日期、标题和正文都要填写哦。");
      return;
    }
    const now = Date.now();
    if (view.page === "editor" && view.id) {
      const id = view.id;
      setEntries((current) => current.map((entry) => entry.id === id
        ? { ...entry, date: draft.date, title, content, updatedAt: now }
        : entry
      ));
      setView({ page: "detail", id });
    } else {
      const entry: DiaryEntry = {
        id: crypto.randomUUID(), date: draft.date, title, content,
        createdAt: now, updatedAt: now,
      };
      setEntries((current) => [...current, entry]);
      setView({ page: "detail", id: entry.id });
    }
    setFormError("");
    setToast("保存成功，今天的故事已经收好啦 ✨");
  }

  function confirmDelete() {
    if (!deleteId) return;
    setEntries((current) => current.filter((entry) => entry.id !== deleteId));
    setDeleteId(null);
    setView({ page: "list" });
    setToast("日记已删除");
  }

  return (
    <div className="min-h-screen text-[#322d43]">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-screen max-w-[1280px] flex-col lg:flex-row">
        <aside className="flex shrink-0 flex-col border-b border-[#e8dfef] bg-white/55 px-6 py-6 backdrop-blur-xl sm:px-10 lg:min-h-screen lg:w-[294px] lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
          <button className="flex w-fit items-center gap-3 text-left" onClick={() => setView({ page: "list" })} aria-label="返回日记首页">
            <span className="size-11 overflow-hidden rounded-2xl shadow-[0_8px_24px_#7659ad45]">
  <img 
    src="/boqi.png"
    className="h-full w-full object-cover"
  />
</span>
            <span><strong className="block font-serif text-[1.3rem] tracking-[.06em]">波奇日记</strong><small className="block text-[.69rem] font-bold tracking-[.26em] text-[#a39ab3]">DIARY BOOK</small></span>
          </button>

          <div className="mt-9 hidden lg:block">
            <p className="text-xs font-semibold tracking-[.24em] text-[#a39ab3]">你的私人小世界</p>
            <h2 className="mt-4 font-serif text-[2rem] leading-[1.35] tracking-tight">把每一天，<br />写成喜欢的故事。</h2>
            <div className="mt-5 h-px w-16 bg-[#d4a6b9]" />
            <p className="mt-5 text-sm leading-7 text-[#827a91]">那些轻轻落下的心情，<br />都值得被认真收藏。</p>
          </div>

          <nav className="mt-6 flex gap-3 lg:mt-12 lg:flex-col" aria-label="主导航">
            <button onClick={() => setView({ page: "list" })} className={`nav-item ${view.page === "list" ? "nav-active" : ""}`}><BookHeart size={18} />全部日记<span className="ml-auto hidden text-xs lg:inline">{entries.length}</span></button>
            <button onClick={openNew} className={`nav-item ${view.page === "editor" && !view.id ? "nav-active" : ""}`}><PenLine size={18} />写新日记</button>
          </nav>

          <div className="mt-auto hidden pt-10 lg:block">
            <div className="rounded-[22px] border border-[#e9def2] bg-white/70 p-5 shadow-sm">
              <Sparkles size={19} className="text-[#a277b4]" />
              <p className="mt-3 text-sm font-semibold">给今天留一页空白</p>
              <p className="mt-1 text-xs leading-6 text-[#928aa0]">想写的时候，这里一直都在。</p>
            </div>
            <p className="mt-6 text-xs text-[#aaa2b6]">只保存在这台设备的浏览器中</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-10 sm:py-11 lg:px-14 lg:py-14">
          {view.page === "list" && (
            <>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="eyebrow"><span className="inline-block size-1.5 rounded-full bg-[#c88aa6]" /> MY LITTLE MOMENTS</p>
                  <h1 className="mt-3 font-serif text-[2.4rem] leading-tight tracking-tight sm:text-[3rem]">日记簿 <span className="ml-1 align-middle text-2xl text-[#c9a8c3]">✦</span></h1>
                  <p className="mt-3 text-sm text-[#898093]">每一个平凡的日子，都有值得记住的光。</p>
                </div>
                <button className="primary-button" onClick={openNew}><Plus size={19} />新建日记</button>
              </div>

              <div className="mt-10 flex items-center justify-between border-b border-[#e7dfea] pb-4">
                <div className="flex items-center gap-2 text-sm font-semibold"><CalendarDays size={17} className="text-[#9f83b4]" />所有故事 <span className="rounded-full bg-[#eee6f5] px-2 py-0.5 text-xs text-[#8266a3]">{entries.length}</span></div>
                <span className="text-xs text-[#a49bad]">按日期从新到旧</span>
              </div>

              {sortedEntries.length === 0 ? (
                <div className="mt-10 flex min-h-[380px] flex-col items-center justify-center rounded-[28px] border border-dashed border-[#d9cbe5] bg-white/55 px-6 py-12 text-center">
                  <div className="relative grid size-20 place-items-center rounded-full bg-[#f1e9f7] text-[#896aad]"><Feather size={35} strokeWidth={1.5} /><span className="absolute -right-1 -top-1 text-2xl text-[#e4a7b2]">✦</span></div>
                  <h2 className="mt-6 font-serif text-2xl font-semibold">第一页，等你来写</h2>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-[#8b8295]">今天发生了什么小事？开心的、难过的，或只是窗外的天气，都可以从这里开始。</p>
                  <button className="mt-7 inline-flex items-center gap-2 font-semibold text-[#7659ad] hover:text-[#533b88]" onClick={openNew}>写下第一篇日记 <ArrowRight size={17} /></button>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {sortedEntries.map((entry, index) => (
                    <article key={entry.id} className="diary-card group relative flex min-h-[230px] flex-col overflow-hidden rounded-[25px] border border-[#e8e0ec] bg-white/85 p-6 shadow-[0_12px_32px_#7d6c9510] transition duration-200 hover:-translate-y-1 hover:border-[#cbb9de] hover:shadow-[0_18px_38px_#7d6c9520]">
                      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-[100px] bg-[#f9eff4] opacity-75" aria-hidden="true" />
                      <div className="relative flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#a06c91]"><span className="size-2 rounded-full bg-[#d7a4b8]" />{displayDate(entry.date)}</span>
                        <span className="font-serif text-2xl text-[#ded0e8]">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <button className="relative mt-4 flex-1 text-left focus-visible:outline-2 focus-visible:outline-[#7659ad]" onClick={() => setView({ page: "detail", id: entry.id })} aria-label={`查看日记：${entry.title}`}>
                        <h2 className="line-clamp-1 font-serif text-[1.35rem] font-semibold leading-snug group-hover:text-[#7659ad]">{entry.title}</h2>
                        <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-7 text-[#81798c]">{excerpt(entry.content)}</p>
                      </button>
                      <div className="relative mt-5 flex items-center justify-between border-t border-[#f0eaf2] pt-4">
                        <button onClick={() => setView({ page: "detail", id: entry.id })} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7c61aa] hover:gap-2.5">继续阅读 <ArrowRight size={15} /></button>
                        <button onClick={() => setDeleteId(entry.id)} className="icon-button" aria-label={`删除日记：${entry.title}`} title="删除日记"><Trash2 size={16} /></button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {view.page === "detail" && selected && (
            <>
              <button className="back-button" onClick={() => setView({ page: "list" })}><ArrowLeft size={17} />返回日记列表</button>
              <article className="mt-7 overflow-hidden rounded-[28px] border border-[#e9deed] bg-white/85 shadow-[0_20px_55px_#7d6c9514]">
                <div className="border-b border-[#eee5ef] bg-gradient-to-br from-[#f6eafa] to-[#fff8f9] px-7 py-9 sm:px-11 sm:py-12">
                  <p className="eyebrow"><CalendarDays size={14} /> {displayDate(selected.date)}</p>
                  <h1 className="mt-5 break-words font-serif text-[2rem] font-semibold leading-snug sm:text-[2.75rem]">{selected.title}</h1>
                  <p className="mt-5 text-xs text-[#9d91a5]">写于 {new Date(selected.createdAt).toLocaleString("zh-CN")}{selected.updatedAt > selected.createdAt ? ` · 更新于 ${new Date(selected.updatedAt).toLocaleString("zh-CN")}` : ""}</p>
                </div>
                <div className="min-h-[270px] whitespace-pre-wrap break-words px-7 py-9 text-[1rem] leading-8 text-[#534b5d] sm:px-11 sm:py-11">{selected.content}</div>
                <div className="flex flex-wrap gap-3 border-t border-[#f0e8f1] px-7 py-6 sm:px-11">
                  <button className="primary-button" onClick={() => openEdit(selected)}><PenLine size={17} />编辑日记</button>
                  <button className="secondary-button text-[#af607c]" onClick={() => setDeleteId(selected.id)}><Trash2 size={17} />删除日记</button>
                </div>
              </article>
            </>
          )}

          {view.page === "editor" && (
            <>
              <button className="back-button" onClick={() => setView(view.id ? { page: "detail", id: view.id } : { page: "list" })}><ArrowLeft size={17} />{view.id ? "返回日记" : "返回日记列表"}</button>
              <div className="mt-7 mb-7">
                <p className="eyebrow"><Feather size={15} /> A PAGE FOR TODAY</p>
                <h1 className="mt-3 font-serif text-[2.3rem] font-semibold sm:text-[2.8rem]">{view.id ? "继续写下去" : "写一篇日记"}</h1>
                <p className="mt-2 text-sm text-[#898093]">慢慢写，你的故事只属于你。</p>
              </div>
              <form onSubmit={saveEntry} className="rounded-[28px] border border-[#e7ddea] bg-white/90 p-6 shadow-[0_20px_55px_#7d6c9512] sm:p-10">
                <label className="form-label" htmlFor="entry-date">日期</label>
                <div className="relative mt-2 max-w-[240px]"><CalendarDays size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9886a9]" /><input id="entry-date" type="date" required value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="field pl-11" /></div>
                <label className="form-label mt-7" htmlFor="entry-title">标题</label>
                <input id="entry-title" type="text" required maxLength={100} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="给今天起一个名字…" className="field mt-2 text-lg font-semibold" />
                <label className="form-label mt-7" htmlFor="entry-content">正文</label>
                <textarea id="entry-content" required value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="今天发生了什么？从这里开始写吧…" rows={12} className="field mt-2 min-h-[310px] resize-y leading-8" />
                {formError && <p role="alert" className="mt-3 text-sm text-[#b45170]">{formError}</p>}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[#f0e8f1] pt-6">
                  <p className="inline-flex items-center gap-2 text-xs text-[#a198aa]"><Heart size={14} /> 写下来的心情，都很珍贵。</p>
                  <div className="flex gap-3"><button type="button" className="secondary-button" onClick={() => setView(view.id ? { page: "detail", id: view.id } : { page: "list" })}>取消</button><button type="submit" className="primary-button"><Save size={17} />保存日记</button></div>
                </div>
              </form>
            </>
          )}
        </main>
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#30233f]/45 p-5 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteId(null); }}>
          <div role="alertdialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-description" className="w-full max-w-[420px] rounded-[27px] border border-white bg-[#fffafd] p-7 text-center shadow-2xl sm:p-9">
            <button className="ml-auto block text-[#a9a0ae] hover:text-[#534b5d]" onClick={() => setDeleteId(null)} aria-label="关闭"><X size={19} /></button>
            <div className="mx-auto mt-1 grid size-16 place-items-center rounded-full bg-[#fae9ef] text-[#bd7895]"><Heart size={28} /></div>
            <h2 id="delete-title" className="mt-5 font-serif text-[1.5rem] font-semibold">真的要把这篇日记撕掉吗？🥺</h2>
            <p id="delete-description" className="mt-3 text-sm leading-6 text-[#8b8093]">删除后就找不回来啦，再想一想吧。</p>
            <div className="mt-8 flex gap-3"><button autoFocus className="secondary-button flex-1 justify-center" onClick={() => setDeleteId(null)}>留下它</button><button className="flex flex-1 items-center justify-center rounded-xl bg-[#c47796] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#a85f7c]" onClick={confirmDelete}>确认删除</button></div>
          </div>
        </div>
      )}

      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full bg-[#3e3552] px-5 py-3 text-sm font-medium text-white shadow-xl"><Check size={17} className="shrink-0 text-[#c4ecda]" />{toast}</div>}
    </div>
  );
}
