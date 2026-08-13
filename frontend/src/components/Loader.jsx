

export default function Loader({ label = 'Loading...', fullPage = true }) {
  return (
    <div
      className={
        fullPage
          ? 'min-h-screen flex flex-col items-center justify-center gap-3 text-ink-300'
          : 'flex flex-col items-center justify-center gap-3 py-20 text-ink-300'
      }
    >
      <video
        src="/loader-clip.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="h-24 w-24 object-contain rounded-full"
      />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}