"use client";

import { useEffect, useState } from "react";

interface Photo {
  url: string;
  caption: string;
}

interface Props {
  configured: boolean;
  connected: boolean;
  instagramEnabled: boolean;
  source: "env" | "oauth" | null;
  page: string | null;
  instagram: string | null;
  fbUser: string | null;
  tokenExpiresAt: string | null;
  photos: Photo[];
}

const ERRORS: Record<string, string> = {
  not_configured: "The Meta app isn't set up yet (missing App ID/Secret).",
  declined: "Facebook authorization was declined.",
  no_code: "Facebook didn't return an authorization code.",
  bad_state: "Security check failed — please try connecting again.",
  no_pages: "That Facebook account doesn't manage any Pages.",
  connect_failed: "Couldn't complete the connection.",
};

type ChannelResult =
  | { ok: true; id: string; scheduled: boolean; scheduledAt: string | null }
  | { ok: false; error: string };

type PostResponse = {
  ok: boolean;
  page: string | null;
  instagram: string | null;
  results: { facebook?: ChannelResult; instagram?: ChannelResult };
};

const inputClass =
  "w-full rounded-xl border border-light-2 bg-white px-4 py-3 text-base font-light text-dark placeholder-gray/50 focus:border-primary focus:outline-none";
const labelClass = "block text-sm font-medium text-dark";

export default function SocialClient(props: Props) {
  const [connected, setConnected] = useState(props.connected);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // composer
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [toFacebook, setToFacebook] = useState(true);
  const [toInstagram, setToInstagram] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<
    | { ok: boolean; results: PostResponse["results"] }
    | { ok: false; error: string }
    | null
  >(null);

  // Surface ?connected / ?error from the OAuth round-trip, then clean the URL.
  // One-time sync from the redirect URL into UI state on mount.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const connectedFlag = q.get("connected") === "1";
    const code = q.get("error");
    if (!connectedFlag && !code) return;
    const detail = q.get("detail");
    if (connectedFlag) {
      setConnected(true);
      setNotice({ kind: "ok", text: "Facebook connected." });
    } else {
      setNotice({
        kind: "err",
        text: (ERRORS[code!] || "Connection error.") + (detail ? ` (${detail})` : ""),
      });
    }
    window.history.replaceState({}, "", "/admin/social");
  }, []);

  const isEnv = props.source === "env";

  async function disconnect() {
    await fetch("/api/admin/meta/disconnect", { method: "POST" });
    setConnected(false);
    setNotice({ kind: "ok", text: "Disconnected." });
  }

  async function submit(schedule: boolean) {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/facebook/post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caption,
          imageUrl: imageUrl.trim() || undefined,
          // Convert the local datetime to an absolute ISO timestamp so the
          // server reads it in the right timezone (not UTC-on-Vercel).
          scheduledAt:
            schedule && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
          facebook: toFacebook,
          instagram: toInstagram,
        }),
      });
      const data = await res.json();
      if (data.results) {
        setResult({ ok: data.ok, results: data.results as PostResponse["results"] });
      } else {
        setResult({ ok: false, error: data.error || "Failed." });
      }
    } catch (e: unknown) {
      setResult({ ok: false, error: e instanceof Error ? e.message : "Network error." });
    } finally {
      setBusy(false);
    }
  }

  if (!props.configured) {
    return (
      <div className="mt-8 rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
        <strong className="font-semibold">Meta app not set up yet.</strong>
        <p className="mt-2 leading-relaxed">
          Add <code>META_APP_ID</code> and <code>META_APP_SECRET</code> from your
          Meta app (developers.facebook.com) to the environment, then reload. See{" "}
          <code>docs/META_SETUP.md</code> for the step-by-step.
        </p>
      </div>
    );
  }

  const canInstagram = props.instagramEnabled;

  return (
    <div className="mt-8 space-y-4">
      {notice && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            notice.kind === "ok"
              ? "bg-sage/10 text-olive"
              : "bg-primary/10 text-primary"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Connection */}
      <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-gray">
          Connection
        </span>
        {connected ? (
          <>
            <p className="mt-2 text-base text-dark">
              Connected to <strong>{props.page}</strong>
              {props.instagram ? ` · Instagram @${props.instagram}` : ""}
            </p>
            {isEnv ? (
              <p className="mt-1 text-xs font-light text-gray">
                Using a Page token from the environment (<code>META_PAGE_TOKEN</code>).
              </p>
            ) : (
              <>
                {props.fbUser && (
                  <p className="mt-1 text-xs font-light text-gray">
                    Authorized by {props.fbUser}
                    {props.tokenExpiresAt
                      ? ` · token renews before ${new Date(props.tokenExpiresAt).toLocaleDateString()}`
                      : ""}
                  </p>
                )}
                <div className="mt-4 flex gap-3">
                  <a
                    href="/api/admin/meta/connect"
                    className="rounded-lg border border-light-2 px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-light"
                  >
                    Reconnect
                  </a>
                  <button
                    onClick={disconnect}
                    className="rounded-lg border border-light-2 px-4 py-2.5 text-sm font-medium text-dark transition-colors hover:bg-light"
                  >
                    Disconnect
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <p className="mt-2 text-sm font-light text-gray">
              Not connected. Authorize once with Beth&apos;s Facebook to let the
              app publish to her Page.
            </p>
            <a
              href="/api/admin/meta/connect"
              className="mt-4 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Connect Facebook
            </a>
          </>
        )}
      </div>

      {/* Composer */}
      <div className={`rounded-2xl bg-white p-6 shadow-sm sm:p-8 ${connected ? "" : "opacity-60"}`}>
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-gray">
          New post
        </span>

        <div className="mt-4">
          <label className={labelClass} htmlFor="social-caption">
            Caption
          </label>
          <textarea
            id="social-caption"
            className={`mt-2 min-h-[120px] resize-y ${inputClass}`}
            placeholder="Write the caption…"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={!connected || busy}
          />
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="social-image">
            Image URL (optional — must be public https)
          </label>
          <input
            id="social-image"
            className={`mt-2 ${inputClass}`}
            placeholder="https://floridahealthychef.com/images/…jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={!connected || busy}
          />
          {props.photos.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-light text-gray">
                …or pick one from the gallery:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {props.photos.map((p) => (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => setImageUrl(p.url)}
                    disabled={!connected || busy}
                    title={p.caption}
                    className={`overflow-hidden rounded-lg border transition ${
                      imageUrl === p.url
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-light-2 hover:border-sage"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.caption}
                      className="h-16 w-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Channels */}
        <div className="mt-4">
          <span className={labelClass}>Post to</span>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-dark">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={toFacebook}
                onChange={(e) => setToFacebook(e.target.checked)}
                disabled={!connected || busy}
              />
              Facebook
            </label>
            <label
              className={`flex items-center gap-2 ${canInstagram ? "" : "text-gray/50"}`}
              title={canInstagram ? "" : "No Instagram Business account is linked to this Page."}
            >
              <input
                type="checkbox"
                checked={toInstagram}
                onChange={(e) => setToInstagram(e.target.checked)}
                disabled={!connected || busy || !canInstagram}
              />
              Instagram{canInstagram && props.instagram ? ` (@${props.instagram})` : ""}
            </label>
          </div>
          {toInstagram && (
            <p className="mt-2 text-xs font-light text-gray">
              Instagram needs a public image and publishes immediately
              (scheduling is Facebook-only).
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className={labelClass} htmlFor="social-schedule">
            Schedule (optional — leave blank to post now)
          </label>
          <input
            id="social-schedule"
            className={`mt-2 max-w-xs ${inputClass}`}
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            disabled={!connected || busy}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => submit(false)}
            disabled={!connected || busy || !caption.trim()}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            {busy ? "Working…" : "Publish now"}
          </button>
          <button
            onClick={() => submit(true)}
            disabled={!connected || busy || !caption.trim() || !scheduledAt || toInstagram}
            className="rounded-lg bg-olive px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-olive-dark disabled:opacity-60"
          >
            Schedule
          </button>
        </div>

        {result && "results" in result && (
          <div className="mt-6 space-y-2">
            {result.results.facebook && (
              <ChannelLine channel="Facebook" result={result.results.facebook} />
            )}
            {result.results.instagram && (
              <ChannelLine channel="Instagram" result={result.results.instagram} />
            )}
          </div>
        )}
        {result && "error" in result && (
          <div className="mt-6 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
            {result.error}
          </div>
        )}
      </div>
    </div>
  );
}

function ChannelLine({ channel, result }: { channel: string; result: ChannelResult }) {
  if (result.ok) {
    return (
      <div className="rounded-xl bg-sage/10 px-4 py-3 text-sm text-olive">
        <strong>{channel}:</strong> {result.scheduled ? "Scheduled" : "Published"}. Post id{" "}
        <code>{result.id}</code>
        {result.scheduledAt ? ` · ${new Date(result.scheduledAt).toLocaleString()}` : ""}.
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
      <strong>{channel}:</strong> {result.error}
    </div>
  );
}
