export function LoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-lg bg-[#f1f5f9]"
          style={{ animationDelay: `${i * 75}ms` }}
        />
      ))}
    </div>
  );
}
