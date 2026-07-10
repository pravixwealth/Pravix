export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2e8f0] border-t-[#2b5cff]" />
        <p className="text-xs text-[#94a3b8]">Loading...</p>
      </div>
    </div>
  );
}
