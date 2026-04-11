export function StatusFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-2xl bg-[#1e2329]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#50d39e] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#50d39e]"></span>
          </div>
          <span className="text-sm font-medium text-gray-300">
            Powered by Your Monitoring System
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Official Site</a>
          <a href="#" className="hover:text-white transition-colors">Shop</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </div>
    </footer>
  );
}
