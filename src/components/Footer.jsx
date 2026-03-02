import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-[#f3f4f6] pb-8 pt-12">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-t border-slate-200 pt-10 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-slate-600">
              Building practical, high-impact digital experiences with strong attention to performance and clean execution.
            </p>
          </div>

          <div>
            <h4 className="font-display text-xl font-semibold text-slate-900">Quick Links</h4>
            <div className="mt-3 grid gap-2 text-slate-600">
              <a href="/" className="hover:text-slate-900">Home</a>
              <a href="/projects" className="hover:text-slate-900">Projects</a>
              <a href="/contact" className="hover:text-slate-900">Contact</a>
              <a href="/gadgets" className="hover:text-slate-900">Gadgets</a>
            </div>
          </div>

          <div>
            <h4 className="font-display text-xl font-semibold text-slate-900">Connect</h4>
            <div className="mt-3 flex items-center gap-2">
              <a className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100" href="https://github.com/sirdavid001" target="_blank" rel="noreferrer">GitHub</a>
              <a className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100" href="https://instagram.com/sirdavid._" target="_blank" rel="noreferrer">Instagram</a>
              <a className="rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100" href="mailto:itssirdavid@gmail.com">Email</a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Sirdavid. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
