export function StatusFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-sm font-medium text-slate-600">
            由监控系统提供支持
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <a href="#" className="transition-colors hover:text-slate-900">
            官网
          </a>
          <a href="#" className="transition-colors hover:text-slate-900">
            商店
          </a>
          <a href="#" className="transition-colors hover:text-slate-900">
            支持
          </a>
        </div>
      </div>
    </footer>
  );
}
