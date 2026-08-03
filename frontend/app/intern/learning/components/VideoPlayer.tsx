export function VideoPlayer({ src }: { src: string }) {
  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
      {/* Dummy video URLs won't actually play — this is a structural placeholder for the real player */}
      <video controls className="w-full h-full" src={src} poster="">
        Your browser does not support video playback.
      </video>
    </div>
  );
}
