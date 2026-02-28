export default function Contact() {
  return (
    <section className="grid gap-6 py-8 lg:grid-cols-[1fr_1.1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm uppercase tracking-widest text-blue-600">Contact</p>
        <h1 className="mt-2 font-display text-5xl font-bold text-slate-900">Let&apos;s Build Something Solid</h1>
        <p className="mt-4 text-xl text-slate-600">
          Open to freelance projects, collaborations, and long-term product work.
        </p>

        <dl className="mt-6 space-y-3 text-lg text-slate-700">
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd>
              <a className="text-blue-600 hover:underline" href="mailto:itssirdavid@gmail.com">
                itssirdavid@gmail.com
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Location</dt>
            <dd>Lagos, Nigeria</dd>
          </div>
          <div>
            <dt className="text-slate-500">State of Origin</dt>
            <dd>Ossomala, Ogbaru LGA, Anambra State</dd>
          </div>
        </dl>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Thanks. I will get back to you soon.");
        }}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="font-display text-3xl font-semibold text-slate-900">Send a Message</h2>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-1 text-sm text-slate-700">
            Name
            <input required className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring" />
          </label>
          <label className="grid gap-1 text-sm text-slate-700">
            Email
            <input type="email" required className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring" />
          </label>
          <label className="grid gap-1 text-sm text-slate-700">
            Message
            <textarea rows="5" required className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none ring-blue-300/60 focus:ring" />
          </label>
          <button type="submit" className="mt-2 rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800">
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
