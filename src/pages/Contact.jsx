export default function Contact() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
        <p className="text-sm uppercase tracking-widest text-emerald-200">Contact</p>
        <h1 className="mt-2 font-display text-4xl font-bold text-white">Let’s Build Something Solid</h1>
        <p className="mt-4 text-slate-300">
          Open to freelance projects, collaborations, and long-term product work.
        </p>

        <dl className="mt-6 space-y-3 text-sm text-slate-300">
          <div>
            <dt className="text-slate-400">Email</dt>
            <dd>
              <a className="text-emerald-200 hover:underline" href="mailto:itssirdavid@gmail.com">
                itssirdavid@gmail.com
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">Location</dt>
            <dd>Lagos, Nigeria</dd>
          </div>
          <div>
            <dt className="text-slate-400">State of Origin</dt>
            <dd>Ossomala, Ogbaru LGA, Anambra State</dd>
          </div>
        </dl>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Thanks. I will get back to you soon.");
        }}
        className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur"
      >
        <h2 className="font-display text-2xl font-semibold text-white">Send a Message</h2>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm text-slate-300">
            Name
            <input required className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none ring-emerald-300/40 focus:ring" />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Email
            <input type="email" required className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none ring-emerald-300/40 focus:ring" />
          </label>
          <label className="grid gap-1 text-sm text-slate-300">
            Message
            <textarea rows="5" required className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white outline-none ring-emerald-300/40 focus:ring" />
          </label>
          <button type="submit" className="mt-2 rounded-full bg-emerald-300 px-5 py-2.5 font-semibold text-ink transition hover:translate-y-[-1px]">
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
