export default function YouTubeEmbed({ videoId, title, autoplay = false, muted = false, loop = false }) {
  if (!videoId) return null;

  const params = new URLSearchParams({
    ...(autoplay && { autoplay: '1' }),
    ...(muted && { mute: '1' }),
    ...(loop && { loop: '1', playlist: videoId }), // YouTube requires playlist=videoId for single-video looping
    playsinline: '1', // required so autoplay works on mobile Safari instead of forcing fullscreen
    rel: '0',
  });

  return (
    <div className="relative w-full aspect-video rounded-app overflow-hidden bg-ink">
      <iframe
        className="absolute inset-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        title={title || 'YouTube video'}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
