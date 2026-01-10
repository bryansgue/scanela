export default function QRStatusMessage({
  title,
  description,
  actionLabel = 'Volver al dashboard',
  actionHref = '/dashboard',
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-10 text-center space-y-6">
        <div className="text-5xl">🪪</div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-3 text-slate-600 leading-relaxed">{description}</p>
        </div>
        <a
          href={actionHref}
          className="inline-flex items-center justify-center px-6 py-3 rounded-2xl font-semibold text-white bg-slate-900 hover:bg-slate-800 transition"
        >
          {actionLabel}
        </a>
      </div>
    </div>
  );
}
