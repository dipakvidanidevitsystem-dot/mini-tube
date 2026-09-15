import { useEffect, useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";
import { Play, Pause, SpeakerHigh, SpeakerLow, SpeakerX, CornersOut, CornersIn } from "@phosphor-icons/react";
import { formatDuration } from "../lib/format";

const PROGRESS_HEARTBEAT_MS = 15_000;
const CONTROLS_HIDE_DELAY_MS = 2_500;

export default function VideoPlayer({
  src,
  poster,
  onProgress,
  onUnload,
}: {
  src: string;
  poster: string;
  /** Best-effort progress report: periodic heartbeat while playing, plus pause/ended/unmount. */
  onProgress?: (seconds: number) => void;
  /** Fired on page unload (tab close/navigation away) — use navigator.sendBeacon here, fetch is unreliable during teardown. */
  onUnload?: (seconds: number) => void;
}) {
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const interval = setInterval(() => {
      if (!video.paused) onProgress?.(video.currentTime);
    }, PROGRESS_HEARTBEAT_MS);

    const handleUnload = () => onUnload?.(video.currentTime);
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      onProgress?.(video.currentTime);
    };
  }, [onProgress, onUnload]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const scheduleHide = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setControlsVisible(false), CONTROLS_HIDE_DELAY_MS);
  };

  const showControlsTemporarily = () => {
    setControlsVisible(true);
    if (playing) scheduleHide();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) setDuration(video.duration || 0);
  };

  const handleBuffered = () => {
    const video = videoRef.current;
    if (!video || video.buffered.length === 0) return;
    setBuffered(video.buffered.end(video.buffered.length - 1));
  };

  const handleEnded = () => {
    setPlaying(false);
    onProgress?.(videoRef.current?.currentTime ?? 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const value = Number(e.target.value);
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current?.requestFullscreen();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    }
  };

  if (failed || !src) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-background-dark text-sm text-muted-foreground-dark">
        This video is unavailable right now.
      </div>
    );
  }

  const VolumeIcon = muted || volume === 0 ? SpeakerX : volume < 0.5 ? SpeakerLow : SpeakerHigh;
  const showOverlayPlayButton = !playing;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => playing && scheduleHide()}
      className="group relative w-full overflow-hidden rounded-lg bg-background-dark outline-none aspect-video"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        className="h-full w-full"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleBuffered}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onError={() => setFailed(true)}
      />

      {showOverlayPlayButton && (
        <button
          type="button"
          aria-label="play"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 text-white transition-opacity hover:bg-black/30"
        >
          <Play size={56} weight="fill" />
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-sm pb-xs pt-xl transition-opacity ${
          controlsVisible || !playing ? "opacity-100" : "opacity-0"
        } group-focus-within:opacity-100`}
      >
        <div className="relative mb-xxs h-1 w-full rounded-full bg-white/30">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/50"
            style={{ width: duration ? `${(buffered / duration) * 100}%` : "0%" }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-accent"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : "0%" }}
          />
          <input
            type="range"
            aria-label="seek"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="flex items-center gap-xs">
          <IconButton size="small" aria-label={playing ? "pause" : "play"} onClick={togglePlay} sx={{ color: "white" }}>
            {playing ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
          </IconButton>
          <span className="text-fine-print text-white">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
          <span className="flex-1" />
          <IconButton size="small" aria-label={muted ? "unmute" : "mute"} onClick={toggleMute} sx={{ color: "white" }}>
            <VolumeIcon size={20} />
          </IconButton>
          <input
            type="range"
            aria-label="volume"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16"
          />
          <IconButton
            size="small"
            aria-label={isFullscreen ? "exit fullscreen" : "enter fullscreen"}
            onClick={toggleFullscreen}
            sx={{ color: "white" }}
          >
            {isFullscreen ? <CornersIn size={20} /> : <CornersOut size={20} />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}
