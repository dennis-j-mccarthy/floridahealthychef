"use client";

/*
  What the post will look like on Facebook and Instagram, drawn from the
  caption, photo and schedule in the composer. Approximate: Meta's own apps
  decide the final crop and the "See more" cut, but these follow their
  current rules (Facebook cuts long text after a few lines; Instagram shows
  about 125 characters, then "more", and crops to a square in the grid).
*/

const AVATAR = "/images/logo.png";
const IG_CUT = 125;

interface Props {
  caption: string;
  imageUrl: string;
  pageName: string;
  igHandle: string;
  scheduledAt: string;
  showFacebook: boolean;
  showInstagram: boolean;
}

function when(scheduledAt: string) {
  if (!scheduledAt) return "Just now";
  const d = new Date(scheduledAt);
  if (Number.isNaN(d.getTime())) return "Just now";
  return d.toLocaleString(undefined, { month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function Avatar({ size }: { size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={AVATAR}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-full border border-light-2 bg-white object-contain p-0.5"
      style={{ width: size, height: size }}
    />
  );
}

function Empty({ text }: { text: string }) {
  return <span className="italic text-gray/60">{text}</span>;
}

function FacebookPost({ caption, imageUrl, pageName, scheduledAt }: Props) {
  return (
    <div className="w-full max-w-[380px] overflow-hidden rounded-lg border border-[#dddfe2] bg-white font-sans text-[#050505] shadow-sm">
      <div className="flex items-center gap-2 px-3 pt-3">
        <Avatar size={40} />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[15px] font-semibold">{pageName}</div>
          <div className="text-[13px] text-[#65676b]">
            {when(scheduledAt)} · <span aria-label="Public">🌐</span>
          </div>
        </div>
        <span className="ml-auto text-sm tracking-widest text-[#65676b]">•••</span>
      </div>
      <div className="px-3 pb-3 pt-2 text-[15px] leading-snug">
        {caption.trim() ? (
          <p className="line-clamp-5 whitespace-pre-line">{caption}</p>
        ) : (
          <Empty text="Your caption shows here." />
        )}
        {caption.split("\n").length > 4 || caption.length > 250 ? (
          <span className="font-semibold text-[#65676b]">See more</span>
        ) : null}
      </div>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="block max-h-[460px] w-full object-cover" />
      )}
      <div className="mx-3 flex justify-between border-b border-[#ced0d4] py-2 text-[13px] text-[#65676b]">
        <span>👍❤️ 0</span>
        <span>0 comments</span>
      </div>
      <div className="flex justify-around py-1.5 text-[14px] font-semibold text-[#65676b]">
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>↪ Share</span>
      </div>
    </div>
  );
}

function InstagramPost({ caption, imageUrl, igHandle }: Props) {
  const text = caption.trim();
  const cut = text.length > IG_CUT;
  return (
    <div className="w-full max-w-[380px] overflow-hidden rounded-lg border border-[#dbdbdb] bg-white font-sans text-[#000] shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] p-[2px]">
          <span className="block rounded-full bg-white p-[1px]">
            <Avatar size={30} />
          </span>
        </span>
        <span className="text-[14px] font-semibold">{igHandle}</span>
        <span className="ml-auto text-sm tracking-widest">•••</span>
      </div>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="block aspect-square w-full object-cover" />
      ) : (
        <div className="grid aspect-square w-full place-items-center bg-[#fafafa] px-8 text-center text-sm text-[#737373]">
          Instagram needs a photo. Pick one from the gallery above.
        </div>
      )}
      <div className="flex gap-4 px-3 pt-2.5 text-[22px] leading-none">
        <span>♡</span>
        <span>💬</span>
        <span>➤</span>
        <span className="ml-auto">🔖</span>
      </div>
      <div className="px-3 pb-3 pt-2 text-[14px] leading-snug">
        {text ? (
          <p className="whitespace-pre-line">
            <span className="font-semibold">{igHandle}</span>{" "}
            {cut ? text.slice(0, IG_CUT).trimEnd() : text}
            {cut && <span className="text-[#737373]">… more</span>}
          </p>
        ) : (
          <Empty text="Your caption shows here." />
        )}
      </div>
    </div>
  );
}

export default function PostPreview(props: Props) {
  if (!props.showFacebook && !props.showInstagram) return null;
  return (
    <div className="mt-6 rounded-xl border border-light-2 bg-light p-4 sm:p-6">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-gray">
        Preview: what people will see
      </span>
      <div className="mt-4 flex flex-wrap items-start gap-6">
        {props.showFacebook && (
          <div className="w-full max-w-[380px]">
            <p className="mb-2 text-xs font-medium text-gray">Facebook</p>
            <FacebookPost {...props} />
          </div>
        )}
        {props.showInstagram && (
          <div className="w-full max-w-[380px]">
            <p className="mb-2 text-xs font-medium text-gray">Instagram</p>
            <InstagramPost {...props} />
          </div>
        )}
      </div>
    </div>
  );
}
