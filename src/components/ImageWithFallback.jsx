import { useEffect, useState } from "react";

function normalizeImageSrc(src) {
  if (typeof src !== "string") return undefined;
  const trimmed = src.trim();
  return trimmed || undefined;
}

export function ImageWithFallback({ src, alt, className, style, onError, ...rest }) {
  const normalizedSrc = normalizeImageSrc(src);
  const [didError, setDidError] = useState(false);

  useEffect(() => {
    setDidError(false);
  }, [normalizedSrc]);

  function handleError(event) {
    setDidError(true);
    onError?.(event);
  }

  if (!normalizedSrc || didError) {
    const fallbackLabel = alt || (normalizedSrc ? "Image unavailable" : "No image available");

    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-slate-400 ${className || ""}`.trim()}
        style={style}
        role="img"
        aria-label={fallbackLabel}
        data-original-url={normalizedSrc}
      >
        <span aria-hidden="true" className="text-lg leading-none">□</span>
        <span className="sr-only">{fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={normalizedSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      {...rest}
    />
  );
}
