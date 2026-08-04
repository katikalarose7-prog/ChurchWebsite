export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-300">
      <span className="h-8 w-8 rounded-full border-2 border-ink/10 border-t-candle animate-spin" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
