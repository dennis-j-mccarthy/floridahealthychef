"use client";

import { useEffect, useRef, useState } from "react";
import {
  parseBeats,
  pickRecordingMimeType,
  PLATFORM_GUIDANCE,
  PLATFORM_LABEL,
  SWEET_SPOT,
  type VideoPlatform,
} from "./videoToolUtils";

type Phase =
  | "idle"
  | "starting"
  | "preview"
  | "countdown"
  | "recording"
  | "review";

type FacingMode = "user" | "environment";

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function FlipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function RecordVideoModal({
  platform,
  videoIdea,
  onClose,
}: {
  platform: VideoPlatform;
  videoIdea: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [facing, setFacing] = useState<FacingMode>("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<{ url: string; ext: string } | null>(
    null
  );

  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;

  const beats = parseBeats(videoIdea);
  const [low, high] = SWEET_SPOT[platform];

  function stopTimers() {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (elapsedTimerRef.current) {
      clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
    }
  }

  function releaseStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
  }

  function cleanupAll() {
    stopTimers();
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    }
    recorderRef.current = null;
    releaseStream();
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  }

  // Release the camera and timers on unmount.
  useEffect(() => {
    return cleanupAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClose() {
    cleanupAll();
    onClose();
  }

  async function enableCamera(nextFacing: FacingMode) {
    setError("");
    setPhase("starting");
    releaseStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: nextFacing,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
        },
        audio: true,
      });
      streamRef.current = stream;
      setFacing(nextFacing);
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        // play() can reject on quick navigations; that's fine.
        liveVideoRef.current.play().catch(() => undefined);
      }
      setPhase("preview");
      // Best effort: offer a flip toggle only when a second camera exists.
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setHasMultipleCameras(
          devices.filter((d) => d.kind === "videoinput").length > 1
        );
      } catch {
        setHasMultipleCameras(false);
      }
    } catch {
      setPhase("idle");
      setError(
        "Camera access was blocked. Allow camera and microphone permission for this site in your browser settings, then try again."
      );
    }
  }

  function beginCountdown() {
    if (!streamRef.current) return;
    setCountdown(3);
    setPhase("countdown");
    let n = 3;
    countdownTimerRef.current = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
        startRecording();
      } else {
        setCountdown(n);
      }
    }, 1000);
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    const { mimeType, ext } = pickRecordingMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
    } catch {
      try {
        recorder = new MediaRecorder(stream);
      } catch {
        setError("Video recording is not supported in this browser.");
        setPhase("preview");
        return;
      }
    }
    recorderRef.current = recorder;
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onerror = () => {
      stopTimers();
      setError("Recording failed. Please try again.");
      setPhase("preview");
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, {
        type: recorder.mimeType || mimeType || "video/webm",
      });
      if (blob.size === 0) {
        setError("The recording came back empty. Please try again.");
        setPhase("preview");
        return;
      }
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({ url, ext });
      setPhase("review");
    };
    recorder.start(250);
    setElapsed(0);
    setPhase("recording");
    const start = Date.now();
    elapsedTimerRef.current = setInterval(() => {
      setElapsed((Date.now() - start) / 1000);
    }, 200);
  }

  function stopRecording() {
    stopTimers();
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }

  function reRecord() {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
    setResult(null);
    setError("");
    setElapsed(0);
    if (streamRef.current) {
      // Re-attach the still-running stream to the live preview.
      setPhase("preview");
      requestAnimationFrame(() => {
        if (liveVideoRef.current && streamRef.current) {
          liveVideoRef.current.srcObject = streamRef.current;
          liveVideoRef.current.play().catch(() => undefined);
        }
      });
    } else {
      setPhase("idle");
    }
  }

  const seconds = Math.floor(elapsed);
  const timerColor =
    seconds < low
      ? "text-gray"
      : seconds <= high
        ? "text-sage"
        : "text-amber-600";
  const cameraActive =
    phase === "preview" || phase === "countdown" || phase === "recording";
  const filename = `beth-${platform}-take.${result?.ext ?? "mp4"}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-dark/70 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Make a video"
      onClick={handleClose}
    >
      <div
        className="mx-auto w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium text-dark">Make a video</h2>
            <p className="mt-1 text-sm font-light text-gray">
              Record a {PLATFORM_LABEL[platform]} take right here — the shot
              script stays on screen next to the camera.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="rounded-lg p-2.5 text-gray transition-colors hover:bg-light hover:text-dark"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-6 md:flex-row">
          {/* Left pane: camera / playback */}
          <div className="flex flex-col items-center md:w-[320px] md:shrink-0">
            <div
              className="relative w-full max-w-[300px] overflow-hidden rounded-2xl bg-black"
              style={{ aspectRatio: "9 / 16" }}
            >
              {/* Live camera preview — mirrored for the front camera, muted to
                  avoid feedback (audio is still recorded). */}
              <video
                ref={liveVideoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 h-full w-full object-cover ${
                  cameraActive ? "" : "hidden"
                }`}
                style={
                  facing === "user" ? { transform: "scaleX(-1)" } : undefined
                }
              />

              {phase === "idle" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
                  <CameraIcon className="h-10 w-10 text-white/70" />
                  <p className="text-sm font-light text-white/80">
                    Your camera preview will appear here.
                  </p>
                  <button
                    onClick={() => enableCamera(facing)}
                    className="rounded-lg bg-sage px-6 py-3.5 text-base font-medium text-white transition-colors hover:bg-olive-dark"
                  >
                    Enable camera
                  </button>
                </div>
              )}

              {phase === "starting" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm font-light text-white/80">
                    Starting camera…
                  </p>
                </div>
              )}

              {phase === "countdown" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-8xl font-semibold text-white drop-shadow">
                    {countdown}
                  </span>
                </div>
              )}

              {phase === "recording" && (
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 backdrop-blur-sm">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-white">REC</span>
                </div>
              )}

              {phase === "review" && result && (
                <video
                  src={result.url}
                  controls
                  playsInline
                  className="absolute inset-0 h-full w-full object-contain"
                />
              )}
            </div>

            {/* Timer, color-coded against the platform sweet spot */}
            {phase === "recording" && (
              <p className={`mt-3 font-mono text-2xl font-semibold ${timerColor}`}>
                {seconds}s
                {seconds > high && (
                  <span className="ml-2 align-middle text-sm font-medium">
                    consider wrapping up
                  </span>
                )}
              </p>
            )}

            {/* Controls under the preview */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {phase === "preview" && (
                <>
                  <button
                    onClick={beginCountdown}
                    className="flex items-center gap-2.5 rounded-full bg-red-600 px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <span className="h-3 w-3 rounded-full bg-white" />
                    Record
                  </button>
                  {hasMultipleCameras && (
                    <button
                      onClick={() =>
                        enableCamera(
                          facing === "user" ? "environment" : "user"
                        )
                      }
                      className="flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-olive ring-1 ring-olive/40 transition-colors hover:bg-olive/10"
                    >
                      <FlipIcon className="h-4 w-4" />
                      Flip camera
                    </button>
                  )}
                </>
              )}
              {phase === "recording" && (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2.5 rounded-full bg-dark px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-dark/85"
                >
                  <span className="h-3 w-3 bg-white" />
                  Stop
                </button>
              )}
              {phase === "review" && result && (
                <>
                  <a
                    href={result.url}
                    download={filename}
                    className="flex items-center gap-2 rounded-lg bg-sage px-5 py-3 text-base font-medium text-white transition-colors hover:bg-olive-dark"
                  >
                    <DownloadIcon className="h-5 w-5" />
                    Download video
                  </a>
                  <button
                    onClick={reRecord}
                    className="rounded-lg bg-white px-5 py-3 text-base font-medium text-olive ring-1 ring-olive/40 transition-colors hover:bg-olive/10"
                  >
                    Re-record
                  </button>
                  <button
                    onClick={handleClose}
                    className="rounded-lg bg-dark px-5 py-3 text-base font-medium text-white transition-colors hover:bg-dark/85"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right pane: platform guidance + shot script */}
          <div className="min-w-0 flex-1">
            <div className="rounded-xl border border-sage/40 bg-sage/10 px-4 py-3">
              <p className="text-sm font-medium text-dark">
                {PLATFORM_LABEL[platform]} length
              </p>
              <p className="mt-1 text-sm font-light leading-relaxed text-dark">
                {PLATFORM_GUIDANCE[platform]}
              </p>
            </div>

            <p className="mt-5 text-sm font-medium text-dark">Shot script</p>
            {beats.length > 0 ? (
              <ol className="mt-3 space-y-3">
                {beats.map((beat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm font-light leading-relaxed text-dark">
                      {beat}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm font-light text-gray">
                No script beats found — wing it in Beth&apos;s voice.
              </p>
            )}

            <p className="mt-5 text-xs font-light leading-relaxed text-gray">
              Tip: hold the hook in beat 1 for the first 2 seconds. When you
              stop, the take plays back here so you can download it or go
              again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
