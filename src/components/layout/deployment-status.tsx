const statusItems = [
  "Next.js App Router OK",
  "Supabase Env OK",
  "Vercel Auto Deploy OK",
] as const;

export function DeploymentStatus() {
  const environment = process.env.VERCEL ? "Vercel" : "Local";
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasSupabaseEnv = hasSupabaseUrl && hasSupabaseAnonKey;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-slate-100">
      <section className="w-full max-w-4xl">
        <div className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
            Deployment Check
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Record System
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            A lightweight status page for verifying the application environment
            before deployment.
          </p>
        </div>

        <dl className="mb-8 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <dt className="text-sm text-slate-400">Environment</dt>
            <dd className="mt-1 text-lg font-medium">{environment}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-400">Supabase URL</dt>
            <dd className="mt-1 flex items-center gap-2 text-lg font-medium">
              <span
                className={`size-2.5 rounded-full ${
                  hasSupabaseUrl ? "bg-emerald-400" : "bg-rose-400"
                }`}
                aria-hidden="true"
              />
              {hasSupabaseUrl ? "Loaded" : "Missing"}
            </dd>
          </div>
        </dl>

        <div className="grid gap-4 md:grid-cols-3">
          {statusItems.map((item, index) => {
            const isHealthy = index !== 1 || hasSupabaseEnv;

            return (
              <article
                key={item}
                className="rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-xl shadow-black/20"
              >
                <span
                  className={`mb-5 flex size-9 items-center justify-center rounded-full text-lg font-bold ${
                    isHealthy
                      ? "bg-emerald-400/15 text-emerald-400"
                      : "bg-rose-400/15 text-rose-400"
                  }`}
                  aria-label={isHealthy ? "OK" : "Missing configuration"}
                >
                  {isHealthy ? "✓" : "!"}
                </span>
                <h2 className="text-lg font-semibold">
                  {index === 1 && !isHealthy ? "Supabase Env Missing" : item}
                </h2>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Public configuration is checked without exposing key values.
        </p>
      </section>
    </main>
  );
}
