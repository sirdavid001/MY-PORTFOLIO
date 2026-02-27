export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-slate-400 sm:px-6 md:flex-row lg:px-8">
        <p>© {new Date().getFullYear()} Chinedu David. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <a className="rounded-full border border-white/15 px-3 py-1 hover:text-emerald-200" href="https://github.com/sirdavid001" target="_blank" rel="noreferrer">GitHub</a>
          <a className="rounded-full border border-white/15 px-3 py-1 hover:text-emerald-200" href="https://instagram.com/sirdavid._" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
