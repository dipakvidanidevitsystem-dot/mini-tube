import { useEffect, useRef, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {
  Play,
  Pause,
  SpeakerHigh,
  SpeakerLow,
  SpeakerX,
  CornersOut,
  CornersIn,
  ArrowCounterClockwise,
  VideoCameraSlash,
} from "@phosphor-icons/react";
import { formatDuration } from "../lib/format";

const PROGRESS_HEARTBEAT_MS = 15_000;
const CONTROLS_HIDE_DELAY_MS = 2_500;
const SEEK_STEP_S = 5;
const JUMP_STEP_S = 10;

/** Controls sit on video, so they always use scrim/on-scrim tokens regardless of theme. */
const CONTROL_SX = {
  color: "rgb(var(--c-on-scrim))",
  width: 44,
  height: 44,
  "&:hover": { backgroundColor: "rgb(var(--c-on-scrim) / 0.12)" },
};

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
  const [ended, setEnded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [hover, setHover] = useState<{ x: number; time: number } | null>(null);
  const [flash, setFlash] = useState<{ key: number; label: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
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

  const announce = (label: string) => setFlash({ key: Date.now(), label });

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  };

  const seekBy = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + delta), video.duration || 0);
    setCurrentTime(video.currentTime);
    announce(`${delta > 0 ? "+" : "−"}${Math.abs(delta)}s`);
  };

  const setVolumeTo = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.min(1, Math.max(0, value));
    video.volume = next;
    video.muted = next === 0;
    setVolume(next);
    setMuted(next === 0);
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
    setEnded(true);
    setControlsVisible(true);
    onProgress?.(videoRef.current?.currentTime ?? 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = Number(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleTrackHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || !duration) return;
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHover({ x: ratio * rect.width, time: ratio * duration });
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void containerRef.current?.requestFullscreen();
    }
  };

  // YouTube-style shortcuts while the player (or one of its controls) has focus.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const onSlider = (e.target as HTMLElement).tagName === "INPUT";
    switch (e.key) {
      case " ":
      case "k":
      case "K":
        if ((e.target as HTMLElement).tagName === "BUTTON" && e.key === " ") return;
        e.preventDefault();
        togglePlay();
        break;
      case "j":
      case "J":
        seekBy(-JUMP_STEP_S);
        break;
      case "l":
      case "L":
        seekBy(JUMP_STEP_S);
        break;
      case "ArrowLeft":
        if (onSlider) return;
        e.preventDefault();
        seekBy(-SEEK_STEP_S);
        break;
      case "ArrowRight":
        if (onSlider) return;
        e.preventDefault();
        seekBy(SEEK_STEP_S);
        break;
      case "ArrowUp":
        if (onSlider) return;
        e.preventDefault();
        setVolumeTo((muted ? 0 : volume) + 0.1);
        break;
      case "ArrowDown":
        if (onSlider) return;
        e.preventDefault();
        setVolumeTo((muted ? 0 : volume) - 0.1);
        break;
      case "m":
      case "M":
        toggleMute();
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      default:
        return;
    }
    showControlsTemporarily();
  };

  if (failed || !src) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg bg-scrim text-on-scrim ring-1 ring-inset ring-border">
        <VideoCameraSlash size={32} weight="duotone" className="opacity-70" aria-hidden />
        <p className="text-caption opacity-80">This video is unavailable right now.</p>
      </div>
    );
  }

  const VolumeIcon = muted || volume === 0 ? SpeakerX : volume < 0.5 ? SpeakerLow : SpeakerHigh;
  const progressPct = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct = duration ? (buffered / duration) * 100 : 0;
  const chromeVisible = controlsVisible || !playing;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label="Video player. Space or K to play or pause, J and L to skip 10 seconds, F for fullscreen, M to mute."
      onKeyDown={handleKeyDown}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => playing && scheduleHide()}
      className={`group/player relative aspect-video w-full overflow-hidden rounded-lg bg-scrim ${
        isFullscreen ? "" : "ring-1 ring-inset ring-border"
      } ${chromeVisible ? "" : "cursor-none"}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        className="h-full w-full"
        playsInline
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onProgress={handleBuffered}
        onPlay={() => {
          setPlaying(true);
          setEnded(false);
          scheduleHide();
        }}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        onError={() => setFailed(true)}
      />

      {!playing && (
        <button
          type="button"
          aria-label={ended ? "Replay" : "Play"}
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-scrim/25 text-on-scrim transition-colors duration-fast hover:bg-scrim/35"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-strong/95 shadow-glow-accent transition-transform duration-fast hover:scale-105 sm:h-20 sm:w-20">
            {ended ? <ArrowCounterClockwise size={30} weight="bold" /> : <Play size={30} weight="fill" className="ml-1" />}
          </span>
        </button>
      )}

      {flash && (
        <span
          key={flash.key}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fade-in rounded-full bg-scrim/70 px-4 py-2 text-caption-strong text-on-scrim"
          onAnimationEnd={() => setTimeout(() => setFlash(null), 400)}
        >
          {flash.label}
        </span>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-scrim/85 via-scrim/40 to-transparent px-2 pb-1 pt-12 transition-opacity duration-enter sm:px-3 ${
          chromeVisible ? "opacity-100" : "opacity-0"
        } group-focus-within/player:opacity-100`}
      >
        {/* Progress track: grows on hover, shows a time preview, native range input for a11y. */}
        <div
          ref={trackRef}
          className="group/track relative mx-1 flex h-4 cursor-pointer items-center"
          onMouseMove={handleTrackHover}
          onMouseLeave={() => setHover(null)}
        >
          <div className="relative h-1 w-full overflow-hidden rounded-full bg-on-scrim/25 transition-[height] duration-fast group-hover/track:h-1.5">
            <div className="absolute inset-y-0 left-0 bg-on-scrim/40" style={{ width: `${bufferedPct}%` }} />
            {hover && <div className="absolute inset-y-0 left-0 bg-on-scrim/30" style={{ width: hover.x }} />}
            <div className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${progressPct}%` }} />
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 scale-0 rounded-full bg-accent shadow-glow-accent transition-transform duration-fast group-hover/track:scale-100"
            style={{ left: `${progressPct}%` }}
          />
          {hover && (
            <span
              aria-hidden
              className="tabular pointer-events-none absolute bottom-5 -translate-x-1/2 rounded-sm bg-scrim/85 px-2 py-0.5 text-fine-print font-semibold text-on-scrim"
              style={{ left: hover.x }}
            >
              {formatDuration(hover.time)}
            </span>
          )}
          <input
            type="range"
            aria-label="Seek"
            aria-valuetext={`${formatDuration(currentTime)} of ${formatDuration(duration)}`}
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>

        <div className="flex items-center gap-0.5">
          <Tooltip title={playing ? "Pause (k)" : "Play (k)"}>
            <IconButton aria-label={playing ? "Pause" : "Play"} onClick={togglePlay} sx={CONTROL_SX}>
              {playing ? <Pause size={22} weight="fill" /> : <Play size={22} weight="fill" />}
            </IconButton>
          </Tooltip>

          <div className="group/vol flex items-center">
            <Tooltip title={muted ? "Unmute (m)" : "Mute (m)"}>
              <IconButton aria-label={muted ? "Unmute" : "Mute"} onClick={toggleMute} sx={CONTROL_SX}>
                <VolumeIcon size={22} />
              </IconButton>
            </Tooltip>
            <input
              type="range"
              aria-label="Volume"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVolumeTo(Number(e.target.value))}
              className="w-0 cursor-pointer opacity-0 transition-all duration-enter [accent-color:rgb(var(--c-accent))] focus-visible:w-20 focus-visible:opacity-100 group-hover/vol:w-20 group-hover/vol:opacity-100"
            />
          </div>

          <span className="tabular ml-1.5 text-fine-print font-medium text-on-scrim sm:text-caption">
            {formatDuration(currentTime)}
            <span className="opacity-60"> / {formatDuration(duration)}</span>
          </span>

          <span className="flex-1" />

          <Tooltip title={isFullscreen ? "Exit full screen (f)" : "Full screen (f)"}>
            <IconButton
              aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
              onClick={toggleFullscreen}
              sx={CONTROL_SX}
            >
              {isFullscreen ? <CornersIn size={22} /> : <CornersOut size={22} />}
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
