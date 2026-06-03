import { useEffect, useRef, useState } from "react";

export default function AutoPlayAudio({ src }) {
  const audioRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onCanPlay = () => setReady(true);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!ready) return;

    // Attempt autoplay (may still be blocked by browser until user interaction)
    audio
      .play()
      .then(() => {
        // started
      })
      .catch(() => {
        // ignore autoplay block
      });
  }, [ready]);

  return (
    <audio
      ref={audioRef}
      src={src}
      controls={false}
      loop={true}
      preload="auto"
      playsInline
      // keep it invisible and non-interactive
      style={{ display: "none" }}
    />
  );
}

