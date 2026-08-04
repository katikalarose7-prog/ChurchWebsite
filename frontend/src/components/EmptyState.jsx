export default function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 px-6">
      {Icon && (
        <div className="grid place-items-center h-14 w-14 rounded-2xl bg-ink/5 text-ink-300">
          <Icon size={26} />
        </div>
      )}
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {subtitle && <p className="text-sm text-ink-300 max-w-xs">{subtitle}</p>}
    </div>
  );
}
