export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-finance-bg pt-24 pb-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mt-16 rounded-2xl border border-finance-border/70 bg-finance-panel p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-finance-border border-t-[#2b5cff]" />
            <p className="text-sm text-finance-muted">Loading articles...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
